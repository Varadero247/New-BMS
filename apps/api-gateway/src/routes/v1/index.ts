import { Router, type Router as RouterType } from 'express';
import authRoutes from '../auth';
import userRoutes from '../users';
import dashboardRoutes from '../dashboard';
import sessionsRoutes from '../sessions';

const router: RouterType = Router();

// Mount v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/sessions', sessionsRoutes);

export default router;
