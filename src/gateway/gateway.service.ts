import jwksRsa from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { InvalidTokenException } from "./gateway.errors";
import { RequestContext } from "./request-context.interface";
import { PartnerCredentials } from "../partner/partner-credentials.interface";
import { PartnerService } from "../partner/partner.service";
import { Request } from "express";
import AppConstants from "../app-constants";
import { BthJwtPayload } from "./bth-jwt-payload.interface";

/**
 * The GatewayService class provides methods for authenticating requests to the
 * gateway service.
 */
class GatewayService {
    private jwksClient: jwksRsa.JwksClient;
    private partnerService: PartnerService;

    /**
     * Constructor for the GatewayService class.
     */
    constructor(partnerService: PartnerService) {
        const jwksUri = process.env.JWKS_URI;
        if (!jwksUri) throw new Error("ENV JWKS_URI is not defined");

        this.partnerService = partnerService;
        this.jwksClient = jwksRsa({
            jwksUri,
            cache: true, // Caches the signing key
            cacheMaxEntries: 5, // Maximum number of keys to cache
            cacheMaxAge: 600000 // Cache duration in milliseconds
        });
    }

    /**
     * Authenticates the request by extracting the JWT payload from the request headers,
     * constructs a request context, and retrieves partner credentials using the partner service.
     *
     * @param req - The incoming request object containing headers and other request data.
     * @returns A promise that resolves to the partner credentials.
     *
     * @throws Will throw an error if the JWT payload cannot be retrieved or if the partner service fails.
     */
    // TODO: Change the return type to the response object of the partner product
    // public async auth(req: Request): Promise<Response> {
    public async auth(req: Request): Promise<PartnerCredentials> {
        const jwtPayload: BthJwtPayload = await this.getJwtPayload(
            req.header(AppConstants.BTH_GATEWAY_ID_HEADER) as string
        ) as BthJwtPayload;

        const context: RequestContext = {
            database: jwtPayload.client.attributes.database,
            entity: jwtPayload.client.attributes.entidade,
            system: jwtPayload.client.attributes.sistema
        }

        // TODO: call the partner service with the context
        // and get the credentials
        return this.partnerService.getPartnerCredentials(context);

        // TODO: redirect the request to the partner product by the uri_redirect
        // and fowoarding the request with the partner credentials
        // const partnerCredentials: PartnerCredentials = this.partnerService.getPartnerCredentials(context);
        // request to the uri_redirect with the partner credentials
        // await fetch(partnerCredentials.uriRedirect + request.params, {
        //     method: partnerCredentials.method;
        //     headers: {
        //         "Authorization": partnerCredentials.token,
        //         // Add any other request headers here
        //     },
        //     body: JSON.stringify(request.body)
        // }).then(response => {
        //     return response;
        // }).catch(error => {
        //     // TODO: handle the error
        //     throw new GatewayServiceException("Error calling partner service", error);
        // });
    }

    /**
     * Validates the given JWT and returns the decoded payload.
     *
     * @param token - The JWT to validate.
     * @returns A promise that resolves to the decoded JWT payload if valid.
     * @throws An error if the token is invalid or cannot be verified.
     */
    public async getJwtPayload(token: string): Promise<JwtPayload> {
        try {
            const decodedHeader = jwt.decode(token, { complete: true });

            if (!decodedHeader || !decodedHeader.header.kid) {
                throw new InvalidTokenException("Token header is missing the key ID");
            }

            const signingKey = await this.getJwksSigningKey(decodedHeader.header.kid);

            return jwt.verify(token, signingKey, { algorithms: ["RS256"] }) as JwtPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError || InvalidTokenException) {
                throw new InvalidTokenException("JWT validation failed", error);
            }
            throw error;
        }
    }

    /**
     * Obtains the public key from the JWKS endpoint.
     * 
     * @param kid - The key ID to obtain.
     * @returns A promise that resolves to the public key.
     */
    private async getJwksSigningKey(kid: string): Promise<string> {
        return (await this.jwksClient.getSigningKey(kid)).getPublicKey();
    }
}

export { GatewayService };
