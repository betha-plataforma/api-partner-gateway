import { AuthImpl } from '../auth.impl.js';
import { BthContext } from '../../gateway.interfaces.js';
import { AuthCredentials } from '../auth.interfaces.js';
import { AuthImplException, AuthImplRequestException } from '../auth.errors.js';

describe('AuthImpl', () => {
    let authImpl: AuthImpl;
    let fetchSpy: jest.SpiedFunction<typeof globalThis.fetch>;

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
