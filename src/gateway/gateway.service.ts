import jwksRsa from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { InvalidTokenException } from './gateway.errors';
import { BthContext } from './gateway.interfaces';
import { AuthCredentials } from './auth/auth.interfaces';
import { AuthService } from './auth/auth.service';
import { BthJwtPayload } from './gateway.interfaces';
import assert from 'assert';

/**
 * The GatewayService class provides methods for authenticating requests to the
 * gateway service.
 */
class GatewayService {
    private jwksClient: jwksRsa.JwksClient;
    private authService: AuthService;

    /**
     * Constructor for the GatewayService class.
     */
    constructor(authService: AuthService) {
        const jwksUri = process.env.JWKS_URI;
        assert(jwksUri, 'ENV JWKS_URI is not defined');

        this.authService = authService;
        this.jwksClient = jwksRsa({
            jwksUri,
            cache: true,
            // TODO: change to 4 hours and define magic numbers
            cacheMaxEntries: 3,
            cacheMaxAge: 172800000 // Cache duration in milliseconds (48 hours)
        });
    }

    /**
     * Authenticates the request with the given JWT token on the JWKS endpoint,
     * and returns the auth credentials from the auth service.
     *
     * @param token - The JWT token from the request headers.
     * @returns A promise that resolves to the auth credentials.
     * @throws An error if the token is invalid or cannot be verified.
     */
    public async auth(token: string): Promise<AuthCredentials> {
        const context: BthContext = await this.extractContextFromJwt(token);

        // TODO: cache the auth credentials by context
        return await this.authService.getAuthCredentials(context);
    }

    /**
     * Extracts the context information from the JWT token.
     *
     * @param token - The JWT token to extract context from.
     * @returns The extracted context containing database, entity, and system.
     * @throws {InvalidTokenException} If the JWT is invalid or cannot be verified.
     */
    private async extractContextFromJwt(token: string): Promise<BthContext> {
        const jwtPayload = (await this.getJwtPayload(token)) as BthJwtPayload;

        return {
            database: jwtPayload.client.attributes.database,
            entity: jwtPayload.client.attributes.entidade,
            system: jwtPayload.client.attributes.sistema
        };
    }

    /**
     * Validates the given JWT and returns the decoded payload.
     *
     * @param token - The JWT to validate.
     * @returns A promise that resolves to the decoded JWT payload if valid.
     * @throws An error if the token is invalid or cannot be verified.
     */
    public async getJwtPayload(token: string): Promise<JwtPayload> {
        const decodedHeader = jwt.decode(token, { complete: true });

        assert(
            decodedHeader?.header.kid,
            new InvalidTokenException('Token header is missing the key ID')
        );

        const signingKey = await this.getJwksSigningKey(decodedHeader.header.kid);

        try {
            return jwt.verify(token, signingKey, { algorithms: ['RS256'] }) as JwtPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new InvalidTokenException('JWT validation failed: Token has expired', error);
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
