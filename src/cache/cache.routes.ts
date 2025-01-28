import { Router, Request, Response } from 'express';
import { CacheController } from './cache.controller.js';

const router = Router();

/**
 * Route to clear all cache.
 */
router.post('/clear', async (req: Request, res: Response) => {
    new CacheController().clearAllCache(req, res);
});

export { router };
