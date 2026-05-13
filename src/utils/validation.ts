import { ConfigSchema, ConfigType } from "../config/env.js";

/** Loads and validates environment variables using Zod schema.
 *
 * @returns {ConfigType} A validated configuration object.
 */
export function loadConfig(): ConfigType {
  const result = ConfigSchema.safeParse(process.env);

  return result.success
    ? result.data
    : ConfigSchema.parse({});
}