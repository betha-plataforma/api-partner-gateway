import jwksRsa from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";
import { InvalidTokenException } from "./gateway.errors";

interface PartnerCredentials {
    clientId: string;
    clientSecret: string;
}

interface RequestContext {
    database: string;
    entity: string;
    system: string;
}

/**
 * The GatewayService class provides methods for authenticating requests to the
 * gateway service.
 */
class GatewayService {
    private jwksClient: jwksRsa.JwksClient;
    private jwksUri: string = process.env.JWKS_URI as string;

    /**
     * Constructor for the GatewayService class.
     */
    constructor() {
        console.log("JWKS_URI", process.env.JWKS_URI);
        if (!this.jwksUri) throw new Error("ENV JWKS_URI is not defined");

        const jwksUri = this.jwksUri;
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
        const jwtPayload = await this.validatesJwt(token);
        const context = jwtPayload.context as RequestContext;

        // TODO: call the partner service with the context
        // and get the credentials
        const credentials = {
            clientId: jwtPayload.clientId,
            clientSecret: jwtPayload.clientSecret
        };

        return credentials;
    }

    /**
     * Authenticates the request by validating the JWT.
     *
     * @param token - The JWT to validate.
     * @returns A promise that resolves to the decoded JWT payload if valid.
     * @throws An error if the token is invalid or cannot be verified.
     */
    public async validatesJwt(token: string): Promise<JwtPayload> {
        try {
            const decodedHeader = jwt.decode(token, { complete: true });

            if (!decodedHeader || typeof decodedHeader === "string" || !decodedHeader.header.kid) {
                throw new Error("Invalid JWT header");
            }

            const kid = decodedHeader.header.kid;

            const key = await this.jwksClient.getSigningKey(kid);
            const signingKey = key.getPublicKey();

            const payload = jwt.verify(token, signingKey, { algorithms: ["RS256"] }) as JwtPayload;

            return payload;
        } catch (error) {
            throw new InvalidTokenException("JWT validation failed");
        }
    }
}

export { GatewayService };
