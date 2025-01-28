import assert from 'assert';
import NodeCache from 'node-cache';

class InMemoryCacheConfig {
    private static instance: NodeCache | null = null;

    /**
     * Creates an instance of NodeCache with predefined configuration.
     *
     * @returns {NodeCache} A new instance of NodeCache with the following settings:
     */
    private static createInstance(): NodeCache {
        const cacheTTL = process.env.IN_MEMORY_CACHE_TTL;
        assert(cacheTTL, 'IN_MEMORY_CACHE_TTL environment variable is required.');
        return new NodeCache({
            stdTTL: parseInt(cacheTTL, 10)
        });
    }

    /**
     * Initializes an in-memory cache using NodeCache if the environment variable `USE_REDIS` is not set to 'true'.
     * This method ensures that the application uses NodeCache only when Redis is not configured as the cache provider.
     */
    public static setup(): void {
        const useNodeCache = process.env.USE_REDIS !== 'true';
        if (useNodeCache && !InMemoryCacheConfig.instance) {
            InMemoryCacheConfig.instance = InMemoryCacheConfig.createInstance();
        }
    }

    /**
     * Returns the existing singleton instance of NodeCache.
     *
     * @returns {NodeCache} The singleton NodeCache instance.
     * @throws {Error} If the NodeCache instance has not been created.
     */
    public static getInstance(): NodeCache {
        assert(
            InMemoryCacheConfig.instance,
            'In memory cache instance has not been initialized. Initializing...'
        );
        return InMemoryCacheConfig.instance;
    }
}

export { InMemoryCacheConfig };
