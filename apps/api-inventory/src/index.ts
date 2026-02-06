import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
  createHealthCheck,
} from '@ims/monitoring';
import { prisma } from '@ims/database';

const logger = createLogger('api-inventory');

import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import warehousesRouter from './routes/warehouses';
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import suppliersRouter from './routes/suppliers';

const app: Express = express();
const PORT = process.env.INVENTORY_PORT || 4005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-inventory'));
app.use(express.json());

// Health check and metrics
app.get('/health', createHealthCheck('api-inventory', prisma, '1.0.0'));
app.get('/metrics', metricsHandler);

// Routes
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/inventory/transactions', transactionsRouter);
app.use('/api/suppliers', suppliersRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  logger.info(`Inventory Control API running on port ${PORT}`);
});

export default app;
