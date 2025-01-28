import { CacheProviderFactory } from '../cache.provider.factory';
import { InMemoryCacheConfig } from '../in-memory.cache.config';
import { InMemoryCache } from '../in-memory.cache.impl';
import { RedisCache } from '../redis.cache.impl';

describe('CacheProviderFactory', () => {
    beforeAll(() => {
        process.env.IN_MEMORY_CACHE_TTL = '3600';
        InMemoryCacheConfig.setup();
    });

    afterEach(() => {
        jest.resetModules();
        delete process.env.USE_REDIS;
    });

    test('should return an instance of InMemoryCache when USE_REDIS is not set', () => {
        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(InMemoryCache);
    });

    test('should return an instance of InMemoryCache when USE_REDIS is set to false', () => {
        process.env.USE_REDIS = 'false';
        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(InMemoryCache);
    });

    test('should return an instance of RedisCache when USE_REDIS is set to true', () => {
        process.env.USE_REDIS = 'true';
        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(RedisCache);
    });
});
