import { createClient, RedisClientType } from 'redis';
import assert from 'assert';
import config from './../config/index.js';

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        redisClient = createClient({
            url: config.cache.redis.url
        });

        redisClient.on('error', (err) => {
            throw new Error(`Redis Error: ${err}`);
        });

        redisClient.connect().catch((err) => {
            throw new Error(`Failed to connect to Redis: ${err}`);
        });
    }
    assert(redisClient, 'Failed to initialize Redis client');
    return redisClient;
};
