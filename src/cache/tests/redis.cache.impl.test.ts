import { RedisCache } from '../redis.cache.impl';
import { RedisClientType } from 'redis';
import { getRedisClient } from '../redis.cache.config';

jest.mock('../redis.cache.config');

describe('RedisCache', () => {
    let redisClientMock: jest.Mocked<RedisClientType>;
    let redisCache: RedisCache;

    beforeEach(() => {
        redisClientMock = {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            flushAll: jest.fn()
        } as unknown as jest.Mocked<RedisClientType>;

        (getRedisClient as jest.Mock).mockReturnValue(redisClientMock);
        redisCache = new RedisCache();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Redis client', () => {
        expect(getRedisClient).toHaveBeenCalled();
        expect(redisCache).toBeDefined();
    });

    it('should throw an error if Redis client fails to initialize', () => {
        (getRedisClient as jest.Mock).mockReturnValue(null);
        expect(() => new RedisCache()).toThrow('Failed to initialize Redis client');
    });

    it('should retrieve a value from the cache', async () => {
        const key = 'testKey';
        const value = 'testValue';
        redisClientMock.get.mockResolvedValue(value);

        const result = await redisCache.get(key);
        expect(redisClientMock.get).toHaveBeenCalledWith(key);
        expect(result).toBe(value);
    });

    it('should store a value in the cache', async () => {
        const key = 'testKey';
        const value = 'testValue';

        await redisCache.set(key, value);
        expect(redisClientMock.set).toHaveBeenCalledWith(key, value);
    });

    it('should remove a value from the cache', async () => {
        const key = 'testKey';

        await redisCache.clear(key);
        expect(redisClientMock.del).toHaveBeenCalledWith(key);
    });

    it('should clear all values from the cache', async () => {
        await redisCache.clearAll();
        expect(redisClientMock.flushAll).toHaveBeenCalled();
    });
});
