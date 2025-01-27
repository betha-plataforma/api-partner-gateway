import { AuthService } from '../auth.service';
import { AuthServiceRequestException } from '../auth.errors';
import { BthContext } from '../../gateway.interfaces';

global.fetch = jest.fn();

// TODO: test all functionality on the borders of the AuthService class
// make sure that the entry method is getCredentials and it returns Promise<AuthCredentials>
// all other functionality should be private
describe('AuthService', () => {
    let authService: AuthService;
    const mockContext: BthContext = {
        database: 'testDB',
        entity: 'user',
        system: 'auth'
    };

    beforeEach(() => {
        process.env.AUTH_URI = 'http://localhost:3000/mock/partner/auth';
        authService = new AuthService();
        jest.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.AUTH_URI;
    });

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
            'http://localhost:3000/mock/partner/auth?database=testDB&entity=user&system=auth',
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

        expect(() => new AuthService()).toThrow('ENV AUTH_URI is not defined');
    });
});
