import { AuthService } from '../auth.service';
import { AuthServiceRequestException } from '../auth.errors';
import { BthContext } from '../../gateway.interfaces';

global.fetch = jest.fn();

describe('AuthService', () => {
    let authService: AuthService;
    const mockContext: BthContext = {
        database: '1',
        entity: '1',
        system: '1'
    };

    beforeEach(() => {
        process.env.AUTH_URI = 'http://localhost:3000/mock/partner/auth';
        authService = new AuthService();
        jest.clearAllMocks();
    });

    afterEach(() => {});

    test('should successfully get partner credentials', async () => {
        const mockResponse = {
            ok: true,
            status: 200,
            json: () =>
                Promise.resolve({
                    uriRedirect: 'http://localhost:3000/mock/partner/application1',
                    method: 'GET',
                    headers: {}
                })
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        const credentials = await authService.getCredentials(mockContext);

        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:3000/mock/partner/auth?database=1&entity=1&system=1',
            expect.objectContaining({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );
        expect(credentials).toEqual({
            uriRedirect: 'http://localhost:3000/mock/partner/application1',
            method: 'GET',
            headers: {}
        });
    });

    test('should throw AuthServiceRequestException for 4xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            statusText: 'Bad Request'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authService.getCredentials(mockContext)).rejects.toThrow(
            AuthServiceRequestException
        );
    });

    test('should throw AuthServiceRequestException for 5xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authService.getCredentials(mockContext)).rejects.toThrow(
            AuthServiceRequestException
        );
    });

    test('should throw AuthServiceRequestException for other status codes', async () => {
        const mockResponse = {
            ok: false,
            status: 300,
            statusText: 'Multiple Choices'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authService.getCredentials(mockContext)).rejects.toThrow(
            AuthServiceRequestException
        );
    });

    test('should throw Error when AUTH_URI is not defined', () => {
        delete process.env.AUTH_URI;

        expect(() => new AuthService()).toThrow(
            'A variável de ambiente AUTH_URI não está definida'
        );
    });
});
