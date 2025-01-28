import type { Config } from 'jest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';

export default async (): Promise<Config> => {
    return {
        verbose: true,
        extensionsToTreatAsEsm: ['.ts'],
        moduleNameMapper: {
            '^(\\.{1,2}/.*)\\.js$': '$1'
        },
        transform: {
            '^.+\\.tsx?$': [
                'ts-jest',
                {
                    useESM: true
                }
            ]
        },
        preset: 'ts-jest/presets/default-esm',
        moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
        testEnvironment: 'node',
        setupFiles: ['dotenv/config'],
        testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
        collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}']
    };
};
