import apicache from 'apicache';
import { Router, Request, Response } from 'express';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthService } from './auth/auth.service';
import { getRedisClient } from '../redis-config';

const router = Router();
const cacheWithRedis = apicache.options({ redisClient: getRedisClient() }).middleware;

/**
 * Routes for the gateway
 */
router.use('/auth', (req: Request, res: Response, next: any) =>
    new GatewayController(new GatewayService(), new AuthService()).auth(req, res, next)
);
export { router };
