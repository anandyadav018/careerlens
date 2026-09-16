const { createLogger, format, transports } = require('winston');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

/**
 * Winston logger configuration.
 *
 * - Development: colorized console output with simple formatting
 * - Production: structured JSON logs to files + console
 */
const logger = createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat()
  ),
  defaultMeta: { service: 'careerpilot-api' },
  transports: [],
});

if (env === 'development') {
  // Development: pretty-printed console output
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `${timestamp} ${level}: ${message}\n${stack}`
            : `${timestamp} ${level}: ${message}`;
        })
      ),
    })
  );
} else {
  // Production: JSON format to console (cloud platforms capture stdout)
  logger.add(
    new transports.Console({
      format: format.combine(format.json()),
    })
  );

  // Production: also write to log files
  logger.add(
    new transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    })
  );
}

module.exports = logger;
