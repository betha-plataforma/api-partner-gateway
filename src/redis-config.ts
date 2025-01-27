import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        redisClient = createClient({
            url: process.env.REDIS_URL,
        });

        redisClient.on('error', (err) => {
            console.error('Redis Client Error', err);
        });

        redisClient.connect().catch((err) => {
            console.error('Redis Connection Error', err);
        });
    }
    return redisClient;
};
