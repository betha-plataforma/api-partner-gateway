import { Router, Request, Response } from "express";
import { GatewayController } from "./gateway.cotroller";
import { GatewayService } from "./gateway.service";

const router = Router();

/**
 * Routes for the gateway
 */
router.post("/auth", (req: Request, res: Response) =>
    new GatewayController(req, res, new GatewayService).auth()
);

export { router };