import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import warehousesRouter from './routes/warehouses';
import categoriesRouter from './routes/categories';
import transactionsRouter from './routes/transactions';
import suppliersRouter from './routes/suppliers';

dotenv.config();

const app: Express = express();
const PORT = process.env.INVENTORY_PORT || 4005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-inventory', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/warehouses', warehousesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/inventory/transactions', transactionsRouter);
app.use('/api/suppliers', suppliersRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: { code: err.code || 'INTERNAL_ERROR', message: err.message || 'An error occurred' },
  });
});

app.listen(PORT, () => {
  console.log(`Inventory Control API running on port ${PORT}`);
});

export default app;
