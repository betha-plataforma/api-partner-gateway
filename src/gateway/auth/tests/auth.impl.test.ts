import { AuthImpl } from '../auth.impl';
import { BthContext } from '../../gateway.interfaces';
import { AuthCredentials } from '../auth.interfaces';
import { AuthImplRequestException, AuthImplException } from '../auth.errors';

describe('AuthImpl (native fetch)', () => {
    let authImpl: AuthImpl;
    let fetchSpy: jest.SpiedFunction<typeof globalThis.fetch>;

    beforeAll(() => {
        process.env.AUTH_URI = 'http://fake-auth-service';
    });

    beforeEach(() => {
        fetchSpy = jest.spyOn(globalThis, 'fetch');
        authImpl = new AuthImpl();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('fetches new credentials and caches them if not in cache', async () => {
        const mockCredentials: AuthCredentials = {
            uriRedirect: 'http://fetched',
            method: 'POST',
            headers: { 'X-Custom': 'header' }
        };
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            statusText: 'OK',
            json: async () => mockCredentials
        } as Response);

        const context: BthContext = {
            database: 'db',
            entity: 'ent',
            system: 'sys'
        };

        const result = await authImpl.auth(context);
        expect(fetchSpy).toHaveBeenCalledTimes(1);
        expect(result).toEqual(mockCredentials);
    });

    test('throws AuthImplException if fetch rejects', async () => {
        fetchSpy.mockRejectedValueOnce(new Error('Network error'));

        const context: BthContext = {
            database: '1',
            entity: '1',
            system: '1'
        };

        await expect(authImpl.auth(context)).rejects.toThrow(AuthImplException);
        await expect(authImpl.auth(context)).rejects.toThrow('Ocorreu um erro inesperado');
    });

    test('throws AuthImplRequestException if response is not ok', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found'
        } as Response);

        const context: BthContext = {
            database: '1',
            entity: '1',
            system: '1'
        };

        await expect(authImpl.auth(context)).rejects.toThrow(AuthImplRequestException);
    });

    test('throws AuthImplException if required fields are missing', async () => {
        const invalidCredentials = {
            method: 'GET',
            headers: { 'X-Test': 'test-header' }
        };

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            statusText: 'OK',
            json: async () => invalidCredentials
        } as Response);

        const context: BthContext = {
            database: '1',
            entity: '1',
            system: '1'
        };

        await expect(authImpl.auth(context)).rejects.toThrow(AuthImplException);
    });
});
