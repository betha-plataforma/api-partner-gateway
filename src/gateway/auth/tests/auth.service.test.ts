import { AuthImpl } from '../auth.impl';
import { AuthImplRequestException } from '../auth.errors';
import { BthContext } from '../../gateway.interfaces';

global.fetch = jest.fn();

describe('AuthImpl', () => {
    let authImpl: AuthImpl;
    const mockContext: BthContext = {
        database: '1',
        entity: '1',
        system: '1'
    };

    beforeEach(() => {
        process.env.AUTH_URI = 'http://localhost:3000/mock/partner/auth';
        authImpl = new AuthImpl();
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

        const credentials = await authImpl.auth(mockContext);

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

    test('should throw AuthImplRequestException for 4xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 400,
            statusText: 'Bad Request'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authImpl.auth(mockContext)).rejects.toThrow(AuthImplRequestException);
    });

    test('should throw AuthImplRequestException for 5xx errors', async () => {
        const mockResponse = {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authImpl.auth(mockContext)).rejects.toThrow(AuthImplRequestException);
    });

    test('should throw AuthImplRequestException for other status codes', async () => {
        const mockResponse = {
            ok: false,
            status: 300,
            statusText: 'Multiple Choices'
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

        await expect(authImpl.auth(mockContext)).rejects.toThrow(AuthImplRequestException);
    });

    test('should throw Error when AUTH_URI is not defined', () => {
        delete process.env.AUTH_URI;

        expect(() => new AuthImpl()).toThrow('A variável de ambiente AUTH_URI não está definida');
    });
});
