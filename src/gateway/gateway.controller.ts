import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import httpProxy from 'express-http-proxy';
import { GatewayValidationException, InvalidTokenException } from "./gateway.errors";
import { GatewayService } from "./gateway.service";
import AppConstants from "../app-constants";
import { PartnerCredentials } from "./partner/partner.interfaces";

/**
 * Controller class for handling gateway-related functionality.
 * 
 * @param gatewayService The gateway service.
 */
class GatewayController {
    private gatewayService: GatewayService;

    /**
     * Constructor for the GatewayController class.
     * 
     * @param gatewayService The gateway service.
     */
    constructor(gatewayService: GatewayService) {
        this.gatewayService = gatewayService;
    }

    /**
     * Authenticates the incoming request by verifying the JWT token and applying partner credentials.
     * If authentication is successful, the request is proxied to the partner application.
     */
    public async auth(req: Request, res: Response, next: any): Promise<void> {
        try {
            await this.verifyJwtToken(req);
            const token = req.headers[AppConstants.BTH_GATEWAY_ID_HEADER] as string;

            const partnerCredentials = await this.gatewayService.auth(token);

            this.applyPartnerCredentialsToRequest(req, partnerCredentials);
            // Proxy the request to the partner application
            this.proxyRequest(req, res, next, partnerCredentials.uriRedirect);
        } catch (error) {
            console.error(error); // TODO: Replace with proper logging
            if (error instanceof GatewayValidationException || error instanceof InvalidTokenException) {
                res.status(error.statusCode).json({ error });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }
        }
    }

    /**
     * Validates the JWT token in the request header.
     * 
     * @param req - The request object.
     * @throws {GatewayValidationException} If the token is invalid.
     */
    private async verifyJwtToken(req: Request): Promise<void> {
        await check(AppConstants.BTH_GATEWAY_ID_HEADER, "Invalid JWT token")
            .exists()
            .isJWT()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new GatewayValidationException("Validation failed", errors.array());
        }
    }

    /**
     * Applies partner credentials to the incoming request.
     * 
     * @param req - The request object.
     * @param partnerCredentials - The partner credentials.
     */
    private applyPartnerCredentialsToRequest(req: Request, partnerCredentials: PartnerCredentials): void {
        req.headers = {
            ...req.headers,
            ...partnerCredentials.headers,
        };
        req.method = partnerCredentials.method;
    }

    /**
     * Proxies the request to the partner application.
     * 
     * @param req - The request object.
     * @param res - The response object.
     * @param next - The next middleware function.
     * @param uriRedirect - The URI to redirect to.
     */
    private proxyRequest(req: Request, res: Response, next: any, uriRedirect: string): void {
        httpProxy(uriRedirect, {
            proxyReqPathResolver: () => uriRedirect,
        })(req, res, next);
    }
}

export { GatewayController };
