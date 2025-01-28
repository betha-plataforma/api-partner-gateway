import { CacheProvider } from './cache.provider.js';
import { InMemoryCache } from './in-memory.cache.impl.js';
import { getRedisClient } from './redis.cache.config.js';
import { RedisCache } from './redis.cache.impl.js';

/**
 * Factory class for creating cache providers.
 */
class CacheProviderFactory {
    /**
     * Creates an instance of a cache provider based on the environment configuration.
     * If the environment variable `USE_REDIS` is set to 'true', it returns an instance of `RedisCache`.
     * Otherwise, it returns an instance of `InMemoryCache`.
     *
     * @returns {CacheProvider} An instance of a cache provider.
     */
    static createCacheProvider(): CacheProvider {
        const useRedis = process.env.USE_REDIS === 'true';
        if (useRedis) {
            return new RedisCache(getRedisClient());
        }
        return new InMemoryCache();
    }
}

export { CacheProviderFactory };
