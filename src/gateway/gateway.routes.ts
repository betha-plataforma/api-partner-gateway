import { Request, Response, Router } from 'express';
import { GatewayController } from './gateway.controller.js';
import { GatewayService } from './gateway.service.js';
import { AuthImpl } from './auth/auth.impl.js';
import { CachingAuthProvider } from './auth/auth.cache.decorator.js';

const router = Router();

/**
 * Routes for the gateway
 */
router.all('*', (req: Request, res: Response, next: any) =>
    new GatewayController(new GatewayService(), new CachingAuthProvider(new AuthImpl())).auth(
        req,
        res,
        next
    )
);
export { router };
