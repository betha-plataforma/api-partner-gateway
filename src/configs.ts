import { config } from 'dotenv';

const result = config();
if (result.error) {
    throw new Error(`Error loading .env file: ${result.error}`);
}

if (result.parsed) {
    Object.assign(process.env, result.parsed);
}

const envs = result.parsed || {};

export { envs };