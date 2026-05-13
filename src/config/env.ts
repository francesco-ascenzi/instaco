import z from 'zod';

export const ConfigSchema = z.object({
  DB_FILE_PATH: z.string().min(1).default('./db/sql.db'),
  MAX_BATCH_SIZE: z.coerce.number().int().positive().default(500),
  INPUT_PATH: z.string().min(1).default('data'),
  OUTPUT_PATH: z.string().min(1).default('data/list'),
});
