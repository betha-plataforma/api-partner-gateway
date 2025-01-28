import { CachingAuthProvider } from '../auth.cache.decorator';
import { AuthProvider } from '../auth.provider';
import { AuthCredentials } from '../auth.interfaces';
import { BthContext } from '../../gateway.interfaces';
import { CacheProvider } from '../../../cache/cache.provider';
import { CacheProviderFactory } from '../../../cache/cache.provider.factory';

jest.mock('../../../cache/cache.provider.factory');

describe('CachingAuthProvider', () => {
    let mockDelegate: jest.Mocked<AuthProvider>;
    let mockCacheProvider: jest.Mocked<CacheProvider>;
    let cachingAuthProvider: CachingAuthProvider;
    let context: BthContext;
    let credentials: AuthCredentials;

    beforeEach(() => {
        mockDelegate = {
            auth: jest.fn()
        } as jest.Mocked<AuthProvider>;

        mockCacheProvider = {
            get: jest.fn(),
            set: jest.fn()
        } as unknown as jest.Mocked<CacheProvider>;

        (CacheProviderFactory.createCacheProvider as jest.Mock).mockReturnValue(mockCacheProvider);

        cachingAuthProvider = new CachingAuthProvider(mockDelegate);

        context = {
            database: '1',
            entity: '1',
            system: '1'
        };

        credentials = {
            uriRedirect: 'http://fetched',
            method: 'POST',
            headers: { 'X-Custom': 'header' }
        };
    });

    it('should return cached credentials if available', async () => {
        mockCacheProvider.get.mockResolvedValue(JSON.stringify(credentials));

        const result = await cachingAuthProvider.auth(context);

        expect(mockCacheProvider.get).toHaveBeenCalledWith('1:1:1');
        expect(result).toEqual(credentials);
        expect(mockDelegate.auth).not.toHaveBeenCalled();
    });

    it('should fetch credentials from delegate and cache them if not available in cache', async () => {
        mockCacheProvider.get.mockResolvedValue(null);
        mockDelegate.auth.mockResolvedValue(credentials);

        const result = await cachingAuthProvider.auth(context);

        expect(mockCacheProvider.get).toHaveBeenCalledWith('1:1:1');
        expect(mockDelegate.auth).toHaveBeenCalledWith(context);
        expect(mockCacheProvider.set).toHaveBeenCalledWith('1:1:1', JSON.stringify(credentials));
        expect(result).toEqual(credentials);
    });
});
