import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { config } from 'dotenv';
import { GatewayService } from '../gateway.service';
import { InvalidTokenException } from '../gateway.errors';
import { AuthService } from '../auth/auth.service';
import { AuthCredentials } from '../auth/auth.interfaces';

jest.mock('jwks-rsa');
jest.mock('jsonwebtoken');

describe('GatewayService', () => {
    const mockJwksClient = {
        getSigningKey: jest.fn()
    };

    beforeAll(() => {
        config({ path: './.env.test' });
        (jwksRsa as unknown as jest.Mock).mockImplementation(() => mockJwksClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should validate a JWT successfully and return auth credentials', async () => {
        const mockPublicKey = 'mock-public-key';
        const mockJwtPayload: JwtPayload = {
            client: {
                attributes: {
                    database: 'test-database',
                    entidade: 'test-entity',
                    sistema: 'test-system'
                }
            }
        };

        const mockCredentials: AuthCredentials = {
            uriRedirect: 'http://localhost:3000',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const token = 'mock-jwt-token';
        const decodedHeader = { kid: 'test-kid', alg: 'RS256' };

        mockJwksClient.getSigningKey.mockResolvedValue({
            getPublicKey: () => mockPublicKey
        });

        (jwt.decode as jest.Mock).mockReturnValue({ header: decodedHeader });
        (jwt.verify as jest.Mock).mockReturnValue(mockJwtPayload);

        const authService = new AuthService();
        jest.spyOn(authService, 'getAuthCredentials').mockResolvedValue(mockCredentials);

        const gatewayService = new GatewayService(authService);
        const result = await gatewayService.auth(token);

        expect(result).toEqual(mockCredentials);
        expect(mockJwksClient.getSigningKey).toHaveBeenCalledWith('test-kid');
        expect(jwt.verify).toHaveBeenCalledWith(token, mockPublicKey, { algorithms: ['RS256'] });
        expect(authService.getAuthCredentials).toHaveBeenCalledWith({
            database: 'test-database',
            entity: 'test-entity',
            system: 'test-system'
        });
    });

    test('should throw InvalidTokenException on invalid JWT', async () => {
        const mockPublicKey = 'mock-public-key';

        mockJwksClient.getSigningKey.mockResolvedValue({
            getPublicKey: () => mockPublicKey
        });

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new InvalidTokenException('Invalid JWT');
        });

        const authService = new AuthService();
        const gatewayService = new GatewayService(authService);
        const token = 'mock-jwt-token';

        await expect(gatewayService.auth(token)).rejects.toThrow(InvalidTokenException);
        expect(mockJwksClient.getSigningKey).toHaveBeenCalledWith(expect.any(String));
        expect(jwt.verify).toHaveBeenCalledWith(token, mockPublicKey, { algorithms: ['RS256'] });
    });
});
