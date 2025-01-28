import { InMemoryCache } from '../in-memory.cache.impl';
import { InMemoryCacheConfig } from '../in-memory.cache.config';

describe('InMemoryCache', () => {
    let cache: InMemoryCache;

    beforeEach(() => {
        process.env.IN_MEMORY_CACHE_TTL = '3600';
        InMemoryCacheConfig.setup();
        cache = new InMemoryCache();
    });

    it('should store and retrieve a value', async () => {
        await cache.set('foo', 'bar');
        const value = await cache.get('foo');
        expect(value).toEqual('bar');
    });

    it('should return null for a missing key', async () => {
        const value = await cache.get('missingKey');
        expect(value).toBeNull();
    });

    it('should clear a specific key', async () => {
        await cache.set('keyToClear', 'value');
        await cache.clear('keyToClear');
        const value = await cache.get('keyToClear');
        expect(value).toBeNull();
    });

    it('should clear all keys', async () => {
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');

        await cache.clearAll();

        expect(await cache.get('key1')).toBeNull();
        expect(await cache.get('key2')).toBeNull();
    });
});
