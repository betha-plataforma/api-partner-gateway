import { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import httpProxy from 'express-http-proxy';
import { GatewayValidationException, InvalidTokenException } from './gateway.errors';
import { GatewayService } from './gateway.service';
import AppConstants from '../app-constants';
import { AuthCredentials } from './auth/auth.interfaces';
import { AuthImpl } from './auth/auth.impl';

/**
 * Controller class for handling gateway-related functionality.
 *
 * @param gatewayService The gateway service.
 */
class GatewayController {
    private gatewayService: GatewayService;
    private authImpl: AuthImpl;

    /**
     * Constructor for the GatewayController class.
     *
     * @param gatewayService The gateway service.
     */
    constructor(gatewayService: GatewayService, authImpl: AuthImpl) {
        this.gatewayService = gatewayService;
        this.authImpl = authImpl;
    }

    /**
     * Authenticates the incoming request by verifying the JWT token and applying auth credentials.
     * If authentication is successful, the request is proxied to the partner application.
     */
    public async auth(req: Request, res: Response, next: any): Promise<void> {
        try {
            await this.verifyJwtToken(req);
            const token = req.headers[AppConstants.BTH_GATEWAY_ID_HEADER] as string;

            const context = await this.gatewayService.getContext(token);
            const credentials = await this.authImpl.auth(context);

            this.applyAuthCredentialsToRequest(req, credentials);
            // Proxy the request to the partner application
            this.proxyRequest(req, res, next, credentials.uriRedirect);
        } catch (error) {
            // TODO: Add proper logging
            if (
                error instanceof GatewayValidationException ||
                error instanceof InvalidTokenException
            ) {
                res.status(error.statusCode).json({ error });
            } else {
                res.status(500).json({ message: 'Internal server error' });
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
        await check(AppConstants.BTH_GATEWAY_ID_HEADER, 'Invalid JWT token')
            .exists()
            .isJWT()
            .run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new GatewayValidationException('Validation failed', errors.array());
        }
    }

    /**
     * Applies auth credentials to the incoming request.
     *
     * @param req - The request object.
     * @param credentials - The auth credentials.
     */
    private applyAuthCredentialsToRequest(req: Request, credentials: AuthCredentials): void {
        req.headers = {
            ...req.headers,
            ...credentials.headers
        };
        req.method = credentials.method;
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
            proxyReqPathResolver: () => uriRedirect
        })(req, res, next);
    }
}

export { GatewayController };
