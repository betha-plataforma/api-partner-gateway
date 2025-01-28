import { RedisCache } from '../redis.cache.impl';
import type { RedisClientType } from 'redis';
import { CacheProvider } from '../cache.provider';

describe('RedisCache', () => {
    let mockRedisClient: jest.Mocked<RedisClientType>;
    let redisCache: CacheProvider;

    beforeEach(() => {
        mockRedisClient = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            flushAll: jest.fn(),
            on: jest.fn(),
            connect: jest.fn(),
            quit: jest.fn()
        } as unknown as jest.Mocked<RedisClientType>;

        redisCache = new RedisCache(mockRedisClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should retrieve a value from the cache by key', async () => {
        const key = 'testKey';
        const value = 'testValue';

        mockRedisClient.get.mockResolvedValueOnce(value);

        const result = await redisCache.get(key);
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
        expect(result).toBe(value);
    });

    test('should store a value in the cache with the specified key', async () => {
        const key = 'testKey';
        const value = 'testValue';

        await redisCache.set(key, value);
        expect(mockRedisClient.set).toHaveBeenCalledWith(key, value);
    });

    test('should remove a value from the cache by key', async () => {
        const key = 'testKey';

        await redisCache.clear(key);
        expect(mockRedisClient.del).toHaveBeenCalledWith(key);
    });

    test('should clear all values from the cache', async () => {
        await redisCache.clearAll();
        expect(mockRedisClient.flushAll).toHaveBeenCalled();
    });
});
