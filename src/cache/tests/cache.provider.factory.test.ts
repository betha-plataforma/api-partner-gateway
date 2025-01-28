import { CacheProviderFactory } from '../cache.provider.factory.js';
import { InMemoryCache } from '../in-memory.cache.impl.js';
import { RedisCache } from '../redis.cache.impl.js';
import { getRedisClient } from '../redis.cache.config.js';
import { InMemoryCacheConfig } from '../in-memory.cache.config.js';
import config from '../../config/index.js';

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
    });

    test('should return an InMemoryCache if Redis is not enabled', () => {
        Object.defineProperty(config.cache.redis, 'enabled', {
            get: () => false
        });

        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(InMemoryCache);
    });

    test('should return a RedisCache if Redis is enabled', () => {
        Object.defineProperty(config.cache.redis, 'enabled', {
            get: () => true
        });

        const cacheProvider = CacheProviderFactory.createCacheProvider();
        expect(cacheProvider).toBeInstanceOf(RedisCache);
        expect(getRedisClient).toHaveBeenCalledTimes(1);
    });
});
