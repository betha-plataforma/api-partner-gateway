import { config as configDotenv } from 'dotenv'
import { resolve } from 'path'

switch (process.env.NODE_ENV) {
    case "development":
        console.log("Environment is 'development'")
        configDotenv({
            path: resolve(__dirname, "../.env.development")
        })
        break
    case "test":
        configDotenv({
            path: resolve(__dirname, "../.env.test")
        })
        break
    // TODO: add production env
    default:
        throw new Error(`'NODE_ENV' ${process.env.NODE_ENV} is not handled!`)
}

console.log("ENVS carregadas", process.env.NODE_ENV)

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: string;
            JWKS_URI: string;
        }
    }
}

export { };