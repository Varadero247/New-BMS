/**
 * GDPR / UK GDPR Compliance Routes
 *
 * Implements:
 * - Data Subject Access Request (DSAR) — Article 15: right of access
 * - Right to Erasure (anonymisation) — Article 17: right to be forgotten
 *
 * Both endpoints are restricted to ADMIN role only.
 * Audit trail is maintained for all GDPR operations.
 */
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRole } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-hr-gdpr');
const router: Router = Router();

// All GDPR endpoints require authentication and ADMIN role
router.use(authenticate);
router.use(requireRole('ADMIN'));

/**
 * POST /api/gdpr/data-export/:employeeId
 * Data Subject Access Request — exports all PII for one employee
 *
 * Returns a structured JSON package of all personal data held about
 * the employee across the HR module. Suitable for providing to the
 * data subject within the 30-day GDPR response window.
 */
router.post('/data-export/:employeeId', async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Employee not found' },
      });
    }

    // Compile all personal data we hold about this employee
    const [leaveRecords, attendanceRecords, performanceRecords] = await Promise.all([
      prisma.leaveRequest.findMany({ where: { employeeId }, take: 500 }),
      prisma.attendance.findMany({ where: { employeeId }, take: 500 }),
      prisma.performanceReview.findMany({ where: { employeeId }, take: 200 }),
    ]);

    const dataPackage = {
      requestDate: new Date().toISOString(),
      requestedBy: req.headers['x-user-id'] || 'admin',
      dataSubject: {
        id: employee.id,
        employeeNumber: employee.employeeNumber,
        personalData: {
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
          dateOfBirth: employee.dateOfBirth,
          gender: employee.gender,
          personalEmail: employee.personalEmail,
          workEmail: employee.workEmail,
          phone: employee.phone,
          mobilePhone: employee.mobilePhone,
          bankName: employee.bankName,
          accountNumber: employee.accountNumber,
        },
        employment: {
          hireDate: employee.hireDate,
          department: employee.department?.name,
          jobTitle: employee.jobTitle,
          employmentType: employee.employmentType,
          employmentStatus: employee.employmentStatus,
          currency: employee.currency,
        },
      },
      relatedRecords: {
        leaveRequests: leaveRecords,
        attendanceRecords: attendanceRecords,
        performanceReviews: performanceRecords,
      },
    };

    logger.info('GDPR data export completed', {
      employeeId,
      requestedBy: req.headers['x-user-id'],
    });

    res.json({ success: true, data: dataPackage });
  } catch (error) {
    logger.error('GDPR data export failed', { error: (error as Error).message, employeeId });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Data export failed' },
    });
  }
});

/**
 * POST /api/gdpr/anonymize/:employeeId
 * Right to Erasure — anonymises all PII for one employee
 *
 * Replaces personally identifiable data with anonymised placeholders.
 * Non-personal data (employment records, compliance data) is retained
 * for legal/regulatory purposes with retention period documented.
 *
 * This is irreversible — confirm before calling.
 */
router.post('/anonymize/:employeeId', async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Employee not found' },
      });
    }

    if (employee.employmentStatus === 'ACTIVE') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Cannot anonymise an active employee. Terminate employment first.',
        },
      });
    }

    const anonymisedAt = new Date();
    const anonymisedId = `ANON-${employee.id.slice(-8).toUpperCase()}`;

    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        // Replace PII with anonymised placeholders
        firstName: 'REDACTED',
        middleName: null,
        lastName: anonymisedId,
        dateOfBirth: null,
        gender: null,
        personalEmail: null,
        workEmail: `redacted.${anonymisedId.toLowerCase()}@deleted.invalid`,
        phone: null,
        mobilePhone: null,
        bankName: null,
        accountNumber: null,
        profilePhoto: null,
        // Mark record as anonymised
        deletedAt: anonymisedAt,
      },
    });

    logger.info('GDPR anonymisation completed', {
      employeeId,
      anonymisedId,
      requestedBy: req.headers['x-user-id'],
    });

    res.json({
      success: true,
      data: {
        message: 'Employee PII has been anonymised in compliance with GDPR Article 17',
        employeeId,
        anonymisedAt: anonymisedAt.toISOString(),
        retentionNote:
          'Non-personal employment records retained for statutory purposes per UK Employment Rights Act 1996',
      },
    });
  } catch (error) {
    logger.error('GDPR anonymisation failed', { error: (error as Error).message, employeeId });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Anonymisation failed' },
    });
  }
});

export default router;
