import NodeCache from 'node-cache';
import { CacheProvider } from './cache.provider';
import { InMemoryCacheConfig } from './in-memory.cache.config';

/**
 * Implementation of the CacheProvider interface using an in-memory cache.
 * This class provides methods to interact with an in-memory cache for storing,
 * retrieving, and clearing cached data.
 */
class InMemoryCache implements CacheProvider {
    private inMemoryCache: NodeCache;

    /**
     * Creates an instance of InMemoryCache.
     * Initializes the in-memory cache.
     */
    constructor() {
        this.inMemoryCache = InMemoryCacheConfig.getInstance();
    }

    /**
     * Retrieves a value from the cache by its key.
     *
     * @param key - The key of the cached value.
     * @returns A promise that resolves to the cached value, or null if the key does not exist.
     */
    async get(key: string): Promise<string | null> {
        const cachedValue = this.inMemoryCache.get<string>(key);
        return cachedValue || null;
    }

    /**
     * Stores a value in the cache with the specified key.
     *
     * @param key - The key to store the value under.
     * @param value - The value to be cached.
     * @returns A promise that resolves when the value has been stored.
     */
    async set(key: string, value: string): Promise<void> {
        this.inMemoryCache.set(key, value);
    }

    /**
     * Removes a value from the cache by its key.
     *
     * @param key - The key of the cached value to be removed.
     * @returns A promise that resolves when the value has been removed.
     */
    async clear(key: string): Promise<void> {
        this.inMemoryCache.del(key);
    }

    /**
     * Clears all values from the cache.
     *
     * @returns A promise that resolves when all values have been cleared.
     */
    async clearAll(): Promise<void> {
        this.inMemoryCache.flushAll();
    }
}

export { InMemoryCache };
