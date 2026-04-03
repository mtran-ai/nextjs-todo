import { vi } from 'vitest';
import type { ZodSchema } from 'zod';

// Mock next-safe-action module
vi.mock('next-safe-action', () => {
  return {
    createSafeActionClient: vi.fn((config: any) => {
      return (schema: ZodSchema, handler: Function) => {
        // Return a callable function that simulates the safe action
        return async (input: any) => {
          try {
            // Validate input against schema
            const validatedInput = schema.parse(input);

            // Call the middleware to get context
            const context = await config.middleware();

            // Call the handler with validated input and context
            const result = await handler(validatedInput, context);

            return result;
          } catch (error: any) {
            return { failure: error.message };
          }
        };
      };
    }),
  };
});
