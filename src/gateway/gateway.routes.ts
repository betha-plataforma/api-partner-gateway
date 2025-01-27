import apicache from 'apicache'
import { Router, Request, Response } from "express";
import { GatewayController } from "./gateway.cotroller";
import { GatewayService } from "./gateway.service";
import { PartnerService } from "../partner/partner.service";
import { getRedisClient } from "../redis-config";

const router = Router();
let cacheWithRedis = apicache.options({ redisClient: getRedisClient() }).middleware

/**
 * Routes for the gateway
 */
router.post("/auth", /*cacheWithRedis('1 day'),*/(req: Request, res: Response) =>
    new GatewayController(
        req,
        res,
        new GatewayService(new PartnerService)
    ).auth()
);

export { router };