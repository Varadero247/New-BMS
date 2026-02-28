// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router } from 'express';
import { authenticate } from '@ims/auth';

import authRoutes from './auth';
import userRoutes from './users';
import dashboardRoutes from './dashboard';
import complianceCalendarRoutes from './compliance-calendar';
import complianceScoresRoutes from './compliance-scores';
import sessionsRoutes from './sessions';
import reportRoutes from './reports';
import auditRoutes from './audit';
import unifiedAuditRoutes from './unified-audit';
import gdprRoutes from './gdpr';
import securityControlsRoutes from './security-controls';
import templateRoutes from './templates';

const router = Router();

// Public routes (auth has its own rate limiting)
router.use('/auth', authRoutes);

// Protected routes — require authentication
router.use('/users', authenticate, userRoutes);
router.use('/dashboard', authenticate, dashboardRoutes);
router.use('/dashboard/compliance-calendar', authenticate, complianceCalendarRoutes);
router.use('/dashboard/compliance-scores', authenticate, complianceScoresRoutes);
router.use('/sessions', authenticate, sessionsRoutes);
router.use('/reports', authenticate, reportRoutes);
router.use('/audit', authenticate, auditRoutes);
router.use('/unified-audit', authenticate, unifiedAuditRoutes);
router.use('/gdpr', authenticate, gdprRoutes);
router.use('/security-controls', securityControlsRoutes); // has own auth
router.use('/templates', templateRoutes); // list/search are public; mutations handled per-route

export default router;
