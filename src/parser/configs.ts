import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ConfigSchema, type ConfigType } from '../types/index.js';

/** Reads and parses the `settings.json` file, validates its content using
 * `validateConfigs`, and logs the current configuration to the console.
 *
 * @returns A promise that resolves to the validated configuration object
 */
export async function parseConfigs(): Promise<ConfigType> {
  const rawFileContent = readFileSync(join(process.cwd(), 'settings.json'), { encoding: 'utf-8' });
  const parsedConfigs = await JSON.parse(rawFileContent);

  const configs = ConfigSchema.parse(parsedConfigs);

  process.env = {
    ...process.env,
    DB_PATH: configs.db.path,
    DEBUG: String(configs.globals.debug).toLowerCase(),
  };

  return configs;
}
