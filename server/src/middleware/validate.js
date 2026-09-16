const AppError = require('../utils/AppError');

/**
 * Zod validation middleware factory.
 * Validates request body, query, or params against a Zod schema.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 *   router.get('/jobs', validate(jobQuerySchema, 'query'), controller.list);
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of the request to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(
        Object.assign(
          new AppError('Validation failed', 400),
          {
            details: errors,
            // Override the default error response to include details
            toJSON() {
              return {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Validation failed',
                  details: errors,
                },
              };
            },
          }
        )
      );
    }

    // Replace request source with validated + transformed data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
