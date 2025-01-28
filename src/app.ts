import express, { Application, Request, Response } from 'express';
import { router as gatewayRoutes } from './gateway/gateway.routes.js';
import { router as mockRoutes } from './mock.routes.js';
import { router as cacheRoutes } from './cache/cache.routes.js';
import { InMemoryCacheConfig } from './cache/in-memory.cache.config.js';
import config from './config/index.js';

const app: Application = express();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/partner-gateway/v1', gatewayRoutes);

// Cache
app.use('/cache', cacheRoutes);

// if not production, use mock routes
if (process.env.NODE_ENV !== 'production') {
    app.use('/mock', mockRoutes);
}

// Health Check
app.use('/alive', (_req: Request, res: Response): void => {
    res.status(200).send('yes');
});

// Initialize the in-memory cache instance
// if not using Redis
if (!config.cache.redis.enabled) {
    InMemoryCacheConfig.setup();
}

export default app;
