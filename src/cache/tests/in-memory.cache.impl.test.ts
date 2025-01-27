import NodeCache from 'node-cache';
import { InMemoryCache } from '../in-memory.cache.impl';

jest.mock('node-cache');

describe('InMemoryCache', () => {
    let cache: InMemoryCache;
    let nodeCacheInstance: jest.Mocked<NodeCache>;

    beforeEach(() => {
        nodeCacheInstance = new NodeCache() as jest.Mocked<NodeCache>;
        (NodeCache as unknown as jest.Mock).mockImplementation(() => nodeCacheInstance);
        cache = new InMemoryCache();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should store a value in the cache', async () => {
        const key = 'testKey';
        const value = 'testValue';

        await cache.set(key, value);

        expect(nodeCacheInstance.set).toHaveBeenCalledWith(key, value);
    });

    it('should retrieve a value from the cache', async () => {
        const key = 'testKey';
        const value = 'testValue';
        nodeCacheInstance.get.mockReturnValue(value);

        const result = await cache.get(key);

        expect(nodeCacheInstance.get).toHaveBeenCalledWith(key);
        expect(result).toBe(value);
    });

    it('should return null if the key does not exist in the cache', async () => {
        const key = 'nonExistentKey';
        nodeCacheInstance.get.mockReturnValue(undefined);

        const result = await cache.get(key);

        expect(nodeCacheInstance.get).toHaveBeenCalledWith(key);
        expect(result).toBeNull();
    });

    it('should remove a value from the cache', async () => {
        const key = 'testKey';

        await cache.clear(key);

        expect(nodeCacheInstance.del).toHaveBeenCalledWith(key);
    });

    it('should clear all values from the cache', async () => {
        await cache.clearAll();

        expect(nodeCacheInstance.flushAll).toHaveBeenCalled();
    });
});
