import jwksRsa from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { InvalidTokenException } from "./gateway.errors";
import { RequestContext } from "./request-context.interface";
import { PartnerCredentials } from "../partner/partner-credentials.interface";
import { PartnerService } from "../partner/partner.service";

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
     * Authenticates the request with the given context from the JWT on the partnet service.
     * 
     * @param token - The JWT to validate.
     * @returns A promise that resolves to the decoded JWT payload if valid.
     */
    public async auth(token: string): Promise<PartnerCredentials> {
        // TODO: get the claims from the JWT = context
        const jwtPayload = await this.getJwtPayload(token);
        const context = jwtPayload.context as RequestContext;

        // TODO: call the partner service with the context
        // and get the credentials
        return this.partnerService.getPartnerCredentials(context);
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

            if (!decodedHeader || typeof decodedHeader === "string" || !decodedHeader.header.kid) {
                throw new Error("Invalid JWT header");
            }

            const signingKey = await this.obtainKeyFromJwks(decodedHeader.header.kid);

            return jwt.verify(token, signingKey, { algorithms: ["RS256"] }) as JwtPayload;
        } catch (error) {
            throw new InvalidTokenException("JWT validation failed");
        }
    }

    /**
     * Obtains the public key from the JWKS endpoint.
     * 
     * @param kid - The key ID to obtain.
     * @returns A promise that resolves to the public key.
     */
    private async obtainKeyFromJwks(kid: string): Promise<string> {
        return (await this.jwksClient.getSigningKey(kid)).getPublicKey();
    }
}

export { GatewayService };
