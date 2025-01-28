import { RedisClientType } from 'redis';
import { CacheProvider } from './cache.provider.js';

/**
 * Implementation of the CacheProvider interface using Redis as the caching mechanism.
 */
class RedisCache implements CacheProvider {
    private redisClient: RedisClientType;

    /**
     * Initializes a new instance of the RedisCache class.
     * Sets up the Redis client connection.
     * @throws Will throw an error if the Redis client fails to initialize.
     */
    constructor(client: RedisClientType) {
        this.redisClient = client;
    }

    /**
     * Retrieves a value from the cache by its key.
     * @param key - The key of the cached value.
     * @returns A promise that resolves to the cached value, or null if the key does not exist.
     */
    async get(key: string): Promise<string | null> {
        return this.redisClient.get(key);
    }

    /**
     * Stores a value in the cache with the specified key.
     * @param key - The key under which the value should be stored.
     * @param value - The value to be cached.
     * @returns A promise that resolves when the value has been stored.
     */
    async set(key: string, value: string): Promise<void> {
        await this.redisClient.set(key, value);
    }

    /**
     * Removes a value from the cache by its key.
     * @param key - The key of the value to be removed.
     * @returns A promise that resolves when the value has been removed.
     */
    async clear(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    /**
     * Clears all values from the cache.
     * @returns A promise that resolves when the cache has been cleared.
     */
    async clearAll(): Promise<void> {
        await this.redisClient.flushAll();
    }
}

export { RedisCache };
