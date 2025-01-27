import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { GatewayValidationException, InvalidTokenException } from "./gateway.errors";
import { GatewayService } from "./gateway.service";
import AppConstants from "../app-constants";

/**
 * Controller class for handling gateway-related functionality.
 * 
 * @param req The request object.
 * @param res The response object.
 * @param gatewayService The gateway service.
 */
class GatewayController {
    private req: Request;
    private res: Response;
    private gatewayService: GatewayService;

    /**
     * Constructor for the GatewayController class.
     * 
     * @param req - The incoming request object, containing data like headers, body, and params.
     * @param res - The response object, used to send responses back to the client.
     */
    constructor(req: Request, res: Response, gatewayService: GatewayService) {
        this.req = req;
        this.res = res;
        this.gatewayService = gatewayService;
    }

    /**
     * Authenticates and redirects the user to the application.
     */
    public async auth(): Promise<void> {
        try {
            await check(AppConstants.BTH_GATEWAY_ID_HEADER, "Invalid JWT token")
                .exists().isJWT().run(this.req);
            this.handleValidationErrors();

            await this.gatewayService.auth(this.req);

            this.res.status(200).send("redirected");
        } catch (error) {
            // TODO: Log the error with a logger
            console.error(error);
            if (
                error instanceof GatewayValidationException ||
                error instanceof InvalidTokenException
            ) {
                this.res.status(error.statusCode).json({ error });
            } else {
                this.res.status(500).json({ message: "Internal server error" });
            }
        }
    }

    /**
     * Validates the request.
     * 
     * @throws {ValidationException} When validation errors are present in the request.
     */
    private handleValidationErrors(): void {
        const errors = validationResult(this.req);

        if (!errors.isEmpty()) {
            throw new GatewayValidationException("Validation failed", errors.array());
        }
    }
}

export { GatewayController };
