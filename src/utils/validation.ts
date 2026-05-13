import { ConfigSchema, type ConfigType } from '../types/index.js';

/** Loads and validates environment variables using Zod schema.
 *
 * @returns A validated configuration object.
 */
export function loadConfig(): ConfigType {
  const result = ConfigSchema.safeParse(process.env);

  return result.success ? result.data : ConfigSchema.parse({});
}
