/**
 * Interface representing a cache provider.
 *
 * @interface CacheProvider
 */
interface CacheProvider {
    get(key: string): Promise<string | null>;
    set(key: string, value: string): Promise<void>;
    clear(key: string): Promise<void>;
    clearAll(): Promise<void>;
}
