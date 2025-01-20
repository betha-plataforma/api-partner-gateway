import { Router, Request, Response } from "express";
import { GatewayController } from "./gateway.cotroller";

const router = Router();

/**
 * Routes for the gateway
 */
router.post("/auth", (req: Request, res: Response) =>
    new GatewayController(req, res).auth()
);

export { router };