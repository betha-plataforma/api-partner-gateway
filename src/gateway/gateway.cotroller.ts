import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import httpProxy from 'express-http-proxy';
import { GatewayValidationException, InvalidTokenException } from "./gateway.errors";
import { GatewayService } from "./gateway.service";
import AppConstants from "../app-constants";
import { PartnerCredentials } from "../partner/partner-credentials.interface";

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
     * Authenticates and redirects the user to the application.
     */
    public async auth(req: Request, res: Response, next: any): Promise<void> {
        try {
            await check(AppConstants.BTH_GATEWAY_ID_HEADER, "Invalid JWT token")
                .exists().isJWT().run(req);
            this.handleValidationErrors(req);

            const partnerResponse: PartnerCredentials = await this.gatewayService.auth(
                req.headers[AppConstants.BTH_GATEWAY_ID_HEADER] as string
            );

            req.headers = {
                ...req.headers,
                ...partnerResponse.headers
            };
            req.method = partnerResponse.method;

            // Redirect the user to the partner application
            httpProxy(partnerResponse.uriRedirect, {
                proxyReqPathResolver: () => partnerResponse.uriRedirect
            })(req, res, next);
        } catch (error) {
            // TODO: Log the error with a logger
            console.error(error);
            if (
                error instanceof GatewayValidationException ||
                error instanceof InvalidTokenException
            ) {
                res.status(error.statusCode).json({ error });
            } else {
                res.status(500).json({ message: "Internal server error" });
            }
        }
    }

    /**
     * Validates the request.
     * 
     * @throws {ValidationException} When validation errors are present in the request.
     */
    private handleValidationErrors(req: Request): void {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            throw new GatewayValidationException("Validation failed", errors.array());
        }
    }
}

export { GatewayController };
