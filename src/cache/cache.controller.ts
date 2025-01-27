import { CacheProviderFactory } from './cache.provider.factory';
import { Request, Response } from 'express';

/**
 * CacheController class provides methods to manage and clear cache data.
 */
class CacheController {
    private cacheProvider;

    constructor() {
        this.cacheProvider = CacheProviderFactory.createCacheProvider();
    }

    /**
     * Clears all cache entries.
     * @returns A promise that resolves when the cache is cleared.
     */
    public async clearAllCache(_req: Request, res: Response): Promise<void> {
        try {
            await this.cacheProvider.clearAll();
            res.status(200).json({ message: 'All cache cleared successfully.' });
        } catch (error) {
            res.status(500).json({ error });
        }
    }
}

export { CacheController };
