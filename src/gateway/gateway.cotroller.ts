import { Request, Response } from "express";
import { body, check, validationResult } from "express-validator";

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
        await check("token", "Invalid JWT token").exists().isJWT().run(this.req);
        if (!this.handleValidationErrors()) return;

        this.res.status(200).send("redirected");
    }

    /**
     * Validates the request and handles errors.
     * If there are validation errors, it sends a 422 response.
     *
     * @returns {boolean} Returns `true` if no validation errors, `false` otherwise.
     */
    private handleValidationErrors(): boolean {
        const errors = validationResult(this.req);

        if (!errors.isEmpty()) {
            this.res.status(422).json({ errors: errors.array() });
            return false;
        }

        return true;
    }
}

export { GatewayController };
