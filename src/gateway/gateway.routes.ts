import apicache from 'apicache';
import { Router, Request, Response } from 'express';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { PartnerService } from './partner/partner.service';
import { getRedisClient } from '../redis-config';

const router = Router();
const cacheWithRedis = apicache.options({ redisClient: getRedisClient() }).middleware;

/**
 * Routes for the gateway
 */
router.use(
    '/auth',
    // TODO: remove full request cache. Cache by context
    /*cacheWithRedis('1 day'),*/ (req: Request, res: Response, next: any) =>
        new GatewayController(new GatewayService(new PartnerService())).auth(req, res, next)
);
export { router };
