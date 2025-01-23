import { config as configDotenv } from 'dotenv';
import { resolve } from 'path';

function loadEnvironmentConfig(): void {
    switch (process.env.NODE_ENV) {
        case "development":
            console.log("Environment is 'development'");
            configDotenv({
                path: resolve(__dirname, "../.env.development")
            });
            break;
        case "test":
            configDotenv({
                path: resolve(__dirname, "../.env.test")
            });
            break;
        // TODO: add production env
        default:
            throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled!`);
    }
}

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            JWKS_URI: string;
            PARTNER_AUTH_URI: string;
        }
    }
}

export { loadEnvironmentConfig };