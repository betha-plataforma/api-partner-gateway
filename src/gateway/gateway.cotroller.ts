import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { GatewayValidationException } from "./gateway.errors";

/**
 * Controller class for handling gateway-related functionality.
 * 
 * @param req The request object.
 * @param res The response object.
 */
class GatewayController {
    private req: Request;
    private res: Response;

    /**
     * Constructor for the GatewayController class.
     * 
     * @param req - The incoming request object, containing data like headers, body, and params.
     * @param res - The response object, used to send responses back to the client.
     */
    constructor(req: Request, res: Response) {
        this.req = req;
        this.res = res;
    }

    /**
     * Authenticates and redirects the user to the application.
     */
    public async auth(): Promise<void> {
        try {
            await check("token", "Invalid JWT token").exists().isJWT().run(this.req);
            this.handleValidationErrors();

            this.res.status(200).send("redirected");
        } catch (error) {
            if (error instanceof GatewayValidationException) {
                this.res.status(error.statusCode).json({ errors: error.errors });
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
