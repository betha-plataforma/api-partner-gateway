export interface Config {
    port?: number;
    jwt: {
        jwksUri?: string;
        cache: {
            maxEntries?: number;
            ageMs?: number;
        };
    };
    cache: {
        inMemory: {
            ttlSeconds?: number;
        };
        redis: {
            enabled?: boolean;
            url?: string;
            ttl?: string;
        };
    };
    auth: {
        uri?: string;
    };
}
