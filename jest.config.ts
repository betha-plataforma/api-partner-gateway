import type { Config } from 'jest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';

export default async (): Promise<Config> => {
    return {
        verbose: true
    };
};
