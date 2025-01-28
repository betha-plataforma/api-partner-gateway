import { Router, Request, Response } from 'express';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthImpl } from './auth/auth.impl';
import { CachingAuthProvider } from './auth/auth.cache.decorator';

const router = Router();

/**
 * Routes for the gateway
 */
router.use('/auth', (req: Request, res: Response, next: any) =>
    new GatewayController(new GatewayService(), new CachingAuthProvider(new AuthImpl())).auth(
        req,
        res,
        next
    )
);
export { router };
