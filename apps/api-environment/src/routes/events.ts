import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envEvent.count({
    where: { referenceNumber: { startsWith: `ENV-EVT-${year}` } },
  });
  return `ENV-EVT-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List events
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, eventType, severity, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (eventType) where.eventType = eventType;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { reportedBy: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.envEvent.findMany({ where, skip, take: limitNum, orderBy: { dateOfEvent: 'desc' } }),
      prisma.envEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list events' } });
  }
});

// GET /:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.envEvent.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get event' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      eventType: z.string().min(1),
      severity: z.string().min(1),
      dateOfEvent: z.string().min(1),
      location: z.string().min(1),
      department: z.string().min(1),
      reportedBy: z.string().min(1),
      description: z.string().min(10),
      regulatoryNotification: z.boolean().optional(),
      regulatoryBody: z.string().optional(),
      notificationReference: z.string().optional(),
      gpsCoordinates: z.string().optional(),
      immediateCause: z.string().optional(),
      contributingFactors: z.string().optional(),
      mediaAffected: z.array(z.string()).optional().default([]),
      substanceInvolved: z.string().optional(),
      quantityReleased: z.number().optional(),
      quantityUnit: z.string().optional(),
      concentration: z.string().optional(),
      receptorDistance: z.string().optional(),
      areaSecured: z.boolean().optional(),
      immediateActions: z.string().optional(),
      spillKitUsed: z.boolean().optional(),
      emergencyServicesCalled: z.boolean().optional(),
      materialsUsed: z.string().optional(),
      cleanupDuration: z.string().optional(),
      rcaMethod: z.string().optional(),
      rootCause: z.string().optional(),
      linkedAspectId: z.string().optional(),
      investigationLead: z.string().optional(),
      investigationDueDate: z.string().optional(),
      investigationCompleted: z.string().optional(),
      environmentalDamage: z.string().optional(),
      biodiversityImpact: z.boolean().optional(),
      biodiversityDescription: z.string().optional(),
      waterCourseImpact: z.boolean().optional(),
      waterCourseName: z.string().optional(),
      airQualityImpact: z.boolean().optional(),
      remediationCost: z.number().optional(),
      reputationalImpact: z.string().optional(),
      capaRequired: z.boolean().optional(),
      capaReference: z.string().optional(),
      preventiveMeasures: z.string().optional(),
      monitoringRequired: z.boolean().optional(),
      monitoringDescription: z.string().optional(),
      followUpDate: z.string().optional(),
      status: z.string().optional(),
      closedBy: z.string().optional(),
      closureDate: z.string().optional(),
      lessonsLearned: z.string().optional(),
      sharedWithTeam: z.boolean().optional(),
      aiRootCauseAnalysis: z.string().optional(),
      aiImmediateActions: z.string().optional(),
      aiRegulatoryObligations: z.string().optional(),
      aiEnvironmentalImpact: z.string().optional(),
      aiPreventiveMeasures: z.string().optional(),
      aiCAPARecommendations: z.string().optional(),
      aiLessonsLearned: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const event = await prisma.envEvent.create({
      data: {
        referenceNumber,
        eventType: data.eventType as any,
        severity: data.severity as any,
        dateOfEvent: new Date(data.dateOfEvent),
        location: data.location,
        department: data.department,
        reportedBy: data.reportedBy,
        description: data.description,
        regulatoryNotification: data.regulatoryNotification ?? false,
        regulatoryBody: data.regulatoryBody,
        notificationReference: data.notificationReference,
        gpsCoordinates: data.gpsCoordinates,
        immediateCause: data.immediateCause,
        contributingFactors: data.contributingFactors,
        mediaAffected: data.mediaAffected,
        substanceInvolved: data.substanceInvolved,
        quantityReleased: data.quantityReleased,
        quantityUnit: data.quantityUnit,
        concentration: data.concentration,
        receptorDistance: data.receptorDistance,
        areaSecured: data.areaSecured,
        immediateActions: data.immediateActions,
        spillKitUsed: data.spillKitUsed,
        emergencyServicesCalled: data.emergencyServicesCalled,
        materialsUsed: data.materialsUsed,
        cleanupDuration: data.cleanupDuration,
        rcaMethod: data.rcaMethod as any,
        rootCause: data.rootCause,
        linkedAspectId: data.linkedAspectId,
        investigationLead: data.investigationLead,
        investigationDueDate: data.investigationDueDate ? new Date(data.investigationDueDate) : null,
        investigationCompleted: data.investigationCompleted ? new Date(data.investigationCompleted) : null,
        environmentalDamage: data.environmentalDamage,
        biodiversityImpact: data.biodiversityImpact,
        biodiversityDescription: data.biodiversityDescription,
        waterCourseImpact: data.waterCourseImpact,
        waterCourseName: data.waterCourseName,
        airQualityImpact: data.airQualityImpact,
        remediationCost: data.remediationCost,
        reputationalImpact: data.reputationalImpact as any,
        capaRequired: data.capaRequired,
        capaReference: data.capaReference,
        preventiveMeasures: data.preventiveMeasures,
        monitoringRequired: data.monitoringRequired,
        monitoringDescription: data.monitoringDescription,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        status: (data.status as any) || 'REPORTED',
        closedBy: data.closedBy,
        closureDate: data.closureDate ? new Date(data.closureDate) : null,
        lessonsLearned: data.lessonsLearned,
        sharedWithTeam: data.sharedWithTeam,
        aiRootCauseAnalysis: data.aiRootCauseAnalysis,
        aiImmediateActions: data.aiImmediateActions,
        aiRegulatoryObligations: data.aiRegulatoryObligations,
        aiEnvironmentalImpact: data.aiEnvironmentalImpact,
        aiPreventiveMeasures: data.aiPreventiveMeasures,
        aiCAPARecommendations: data.aiCAPARecommendations,
        aiLessonsLearned: data.aiLessonsLearned,
        aiGenerated: data.aiGenerated ?? false,
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create event' } });
  }
});

// PUT /:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });

    const data = req.body;

    // Auto-set closureDate when status changes to CLOSED
    if (data.status === 'CLOSED' && existing.status !== 'CLOSED') {
      data.closureDate = new Date();
    }

    // Convert date strings to Date objects
    if (data.dateOfEvent) data.dateOfEvent = new Date(data.dateOfEvent);
    if (data.investigationDueDate) data.investigationDueDate = new Date(data.investigationDueDate);
    if (data.investigationCompleted) data.investigationCompleted = new Date(data.investigationCompleted);
    if (data.followUpDate) data.followUpDate = new Date(data.followUpDate);
    if (data.closureDate && typeof data.closureDate === 'string') data.closureDate = new Date(data.closureDate);

    const event = await prisma.envEvent.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update event' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envEvent.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    await prisma.envEvent.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Event deleted successfully' } });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete event' } });
  }
});

export default router;
