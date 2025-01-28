import { AuthImpl } from '../auth.impl';
import { CacheProviderFactory } from '../../../cache/cache.provider.factory';
import { CacheProvider } from '../../../cache/cache.provider';
import { BthContext } from '../../gateway.interfaces';
import { AuthCredentials } from '../auth.interfaces';
import { AuthImplRequestException, AuthImplException } from '../auth.errors';

describe('AuthImpl (native fetch)', () => {
    let authImpl: AuthImpl;
    let mockCacheProvider: jest.Mocked<CacheProvider>;
    let fetchSpy: jest.SpiedFunction<typeof globalThis.fetch>;

    beforeAll(() => {
        process.env.AUTH_URI = 'http://fake-auth-service';
    });

    beforeEach(() => {
        mockCacheProvider = {
            get: jest.fn(),
            set: jest.fn(),
            clear: jest.fn(),
            clearAll: jest.fn()
        };

        jest.spyOn(CacheProviderFactory, 'createCacheProvider').mockReturnValue(mockCacheProvider);
        fetchSpy = jest.spyOn(globalThis, 'fetch');
        authImpl = new AuthImpl();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns cached credentials if they exist', async () => {
        const mockCredentials: AuthCredentials = {
            uriRedirect: 'http://cached',
            method: 'GET',
            headers: { Authorization: 'Bearer cached' }
        };
        mockCacheProvider.get.mockResolvedValueOnce(JSON.stringify(mockCredentials));

        const context: BthContext = {
            database: 'db',
            entity: 'ent',
            system: 'sys'
        };

        const result = await authImpl.auth(context);
        expect(result).toEqual(mockCredentials);
        expect(mockCacheProvider.get).toHaveBeenCalledWith('db:ent:sys');
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('fetches new credentials and caches them if not in cache', async () => {
        const mockCredentials: AuthCredentials = {
            uriRedirect: 'http://fetched',
            method: 'POST',
            headers: { 'X-Custom': 'header' }
        };
        mockCacheProvider.get.mockResolvedValueOnce(null);
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
        expect(mockCacheProvider.set).toHaveBeenCalledWith(
            'db:ent:sys',
            JSON.stringify(mockCredentials)
        );
        expect(result).toEqual(mockCredentials);
    });

    it('throws AuthImplException if fetch rejects', async () => {
        mockCacheProvider.get.mockResolvedValueOnce(null);
        fetchSpy.mockRejectedValueOnce(new Error('Network error'));

        const context: BthContext = {
            database: '1',
            entity: '1',
            system: '1'
        };

        await expect(authImpl.auth(context)).rejects.toThrow(AuthImplException);
        await expect(authImpl.auth(context)).rejects.toThrow('Ocorreu um erro inesperado');
    });

    it('throws AuthImplRequestException if response is not ok', async () => {
        mockCacheProvider.get.mockResolvedValueOnce(null);
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

    it('throws AuthImplException if required fields are missing', async () => {
        mockCacheProvider.get.mockResolvedValueOnce(null);
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
