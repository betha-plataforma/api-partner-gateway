import jwksRsa from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { InvalidTokenException } from "./gateway.errors";
import { BthContext } from "./bth-context.interface";
import { PartnerCredentials } from "../partner/partner-credentials.interface";
import { PartnerService } from "../partner/partner.service";
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
            // TODO: check if its necessary to cache the keys on redis
            cache: true,
            cacheMaxEntries: 3,
            cacheMaxAge: 172800000 // Cache duration in milliseconds (48 hours)
        });
    }

    /**
     * Authenticates the request with the given JWT token on the JWKS endpoint,
     * and returns the partner credentials from the partner auth service.
     *
     * @param token - The JWT token from the request headers.
     * @returns A promise that resolves to the partner credentials.
     * @throws An error if the token is invalid or cannot be verified.
     */
    // TODO: Change the return type to the response object of the partner product
    // public async auth(req: Request): Promise<Response> {
    public async auth(token: string): Promise<PartnerCredentials> {
        // const jwtPayload: BthJwtPayload = await this.getJwtPayload(token) as BthJwtPayload;
        // const context: RequestContext = {
        //     database: jwtPayload.client.attributes.database,
        //     entity: jwtPayload.client.attributes.entidade,
        //     system: jwtPayload.client.attributes.sistema
        // }
        // const context: RequestContext = await this.getJwtPayload(token) as RequestContext;
        // const context: RequestContext = {
        //     database: jwtPayload.client.attributes.database,
        //     entity: jwtPayload.client.attributes.entidade,
        //     system: jwtPayload.client.attributes.sistema
        // }
        const context: BthContext = {
            database: 'database',
            entity: 'entity',
            system: 'system'
        }

        return await this.partnerService.getPartnerCredentials(context);
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
