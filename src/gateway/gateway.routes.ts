import { Router, Request, Response } from 'express';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthImpl } from './auth/auth.impl';

const router = Router();

/**
 * Routes for the gateway
 */
router.use('/auth', (req: Request, res: Response, next: any) =>
    new GatewayController(new GatewayService(), new AuthImpl()).auth(req, res, next)
);
export { router };
