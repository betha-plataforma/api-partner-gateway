import { Config } from './types.js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const configs: Record<string, Config> = {
    // Se não haver .env no projeto, use valores padrão para as variáveis de ambiente
    development: {
        port: Number(process.env.PORT) || 3000,
        jwt: {
            jwksUri:
                process.env.JWKS_URI ||
                'https://plataforma-authentication-jwks.test.betha.cloud/api/v1/keys',
            cache: {
                maxEntries: Number(process.env.JWKS_CACHE_MAX_ENTRIES) || 3,
                ageMs: Number(process.env.JWKS_CACHE_AGE) || 14400000
            }
        },
        cache: {
            inMemory: {
                ttlSeconds: Number(process.env.IN_MEMORY_CACHE_TTL) || 3600
            },
            redis: {
                enabled: process.env.USE_REDIS === 'true',
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                ttl: process.env.CACHE_REDIS_TTL || '1 day'
            }
        },
        auth: {
            uri: process.env.AUTH_URI || 'http://localhost:3000/mock/partner/auth'
        }
    },

    test: {
        port: Number(process.env.PORT),
        jwt: {
            jwksUri: process.env.JWKS_URI,
            cache: {
                maxEntries: Number(process.env.JWKS_CACHE_MAX_ENTRIES),
                ageMs: Number(process.env.JWKS_CACHE_AGE)
            }
        },
        cache: {
            inMemory: {
                ttlSeconds: Number(process.env.IN_MEMORY_CACHE_TTL)
            },
            redis: {
                enabled: process.env.USE_REDIS === 'true',
                url: process.env.REDIS_URL,
                ttl: process.env.CACHE_REDIS_TTL
            }
        },
        auth: {
            uri: process.env.AUTH_URI
        }
    },

    production: {
        port: Number(process.env.PORT),
        jwt: {
            jwksUri: process.env.JWKS_URI,
            cache: {
                maxEntries: Number(process.env.JWKS_CACHE_MAX_ENTRIES),
                ageMs: Number(process.env.JWKS_CACHE_AGE)
            }
        },
        cache: {
            inMemory: {
                ttlSeconds: Number(process.env.IN_MEMORY_CACHE_TTL)
            },
            redis: {
                enabled: process.env.USE_REDIS === 'true',
                url: process.env.REDIS_URL,
                ttl: process.env.CACHE_REDIS_TTL
            }
        },
        auth: {
            uri: process.env.AUTH_URI
        }
    }
};

const environment = process.env.NODE_ENV || 'development';
const config: Config = configs[environment];

if (!config) {
    throw new Error(`Configuration not found for environment: ${environment}`);
}

export default config;
