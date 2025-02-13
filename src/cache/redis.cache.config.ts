import { RedisClientType, createClient } from 'redis';
import assert from 'assert';
import config from './../config/index.js';

let redisClient: RedisClientType | null = null;

export const getRedisClient = (): RedisClientType => {
    if (!redisClient) {
        redisClient = createClient({
            url: config.cache.redis.url
        });

        redisClient.on('error', (err) => {
            throw new Error(`Erro no Redis: ${err}`);
        });

        redisClient.connect().catch((err) => {
            throw new Error(`Falha ao conectar no Redis: ${err}`);
        });
    }
    assert(redisClient, 'Falha ao inicializar o cliente Redis');
    return redisClient;
};
