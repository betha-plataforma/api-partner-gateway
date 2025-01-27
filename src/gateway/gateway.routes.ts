import { Router, Request, Response } from 'express';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { AuthService } from './auth/auth.service';

const router = Router();

/**
 * Routes for the gateway
 */
router.use('/auth', (req: Request, res: Response, next: any) =>
    new GatewayController(new GatewayService(), new AuthService()).auth(req, res, next)
);
export { router };
