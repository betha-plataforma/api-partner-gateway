import type { Config } from 'jest';
import { } from "./src/configs";

export default async (): Promise<Config> => {
  return {
    verbose: true,
  };
};