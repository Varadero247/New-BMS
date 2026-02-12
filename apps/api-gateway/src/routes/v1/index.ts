import { Router, type Router as RouterType } from 'express';
import authRoutes from '../auth';
import userRoutes from '../users';
import dashboardRoutes from '../dashboard';
import sessionsRoutes from '../sessions';
import auditRoutes from '../audit';
import unifiedAuditRoutes from '../unified-audit';
import complianceScoresRoutes from '../compliance-scores';
import gdprRoutes from '../gdpr';
import reportRoutes from '../reports';
import securityControlsRoutes from '../security-controls';
import templateRoutes from '../templates';

const router: RouterType = Router();

// Mount v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/audit', auditRoutes);
router.use('/unified-audit', unifiedAuditRoutes);
router.use('/dashboard/compliance-scores', complianceScoresRoutes);
router.use('/gdpr', gdprRoutes);
router.use('/reports', reportRoutes);
router.use('/security-controls', securityControlsRoutes);
router.use('/templates', templateRoutes);

export default router;
