// cache.provider.factory.spec.ts (example filename)
import { CacheProviderFactory } from '../cache.provider.factory.js';
import { InMemoryCache } from '../in-memory.cache.impl.js';
import { RedisCache } from '../redis.cache.impl.js';
import { getRedisClient } from '../redis.cache.config.js';
import { InMemoryCacheConfig } from '../in-memory.cache.config.js';

jest.mock('../redis.cache.config', () => {
    const originalModule = jest.requireActual('../redis.cache.config');
    return {
        ...originalModule,
        getRedisClient: jest.fn()
    };
});

describe('CacheProviderFactory', () => {
    let mockRedisClient: any;

    beforeEach(() => {
        process.env.USE_REDIS = 'false';
        mockRedisClient = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            flushAll: jest.fn(),
            on: jest.fn(),
            connect: jest.fn(),
            quit: jest.fn()
        };

        (getRedisClient as jest.Mock).mockReturnValue(mockRedisClient);
        InMemoryCacheConfig.setup();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        delete process.env.USE_REDIS;
    });

    test('should return an InMemoryCache if USE_REDIS is not set to true', () => {
        process.env.USE_REDIS = 'false';
        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(InMemoryCache);
        // expect(getRedisClient).not.toHaveBeenCalled();
    });

    test('should return a RedisCache if USE_REDIS is set to true', () => {
        process.env.USE_REDIS = 'true';
        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(RedisCache);
        expect(getRedisClient).toHaveBeenCalledTimes(1);
    });
});
