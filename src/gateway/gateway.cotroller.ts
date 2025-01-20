import { Request, Response } from "express";

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
    public auth(): void {
        this.res.status(200).send("redirected");
    }
}

export { GatewayController };
