import type { Config } from 'jest';

process.env.NODE_ENV = 'test';

export default async (): Promise<Config> => {
  return {
    verbose: true,
  };
};