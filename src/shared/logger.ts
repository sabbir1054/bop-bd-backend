import { createLogger, format, transports } from 'winston';
import config from '../config';
import DailyRotateFile from 'winston-daily-rotate-file';
const { combine, timestamp, label, printf } = format;
import path from 'path';

// custom log format with BD time (Asia/Dhaka)
const myFormat = printf(({ level, message, label, timestamp }) => {
  // Convert timestamp to Bangladesh Standard Time (BST, UTC+6)
  const date = new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
  });

  const formattedDate = new Date(date); // Re-convert to Date object to get time components
  const hour = formattedDate.getHours();
  const minutes = formattedDate.getMinutes();
  const seconds = formattedDate.getSeconds();

  return `${formattedDate.toDateString()} ${hour}:${minutes}:${seconds} } [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'UMP' }), timestamp(), myFormat),
  transports:
    config.env === 'production'
      ? [
          new DailyRotateFile({
            filename: path.join(
              process.cwd(),
              'logs',
              'winston',
              'successes',
              'ump-%DATE%.success.log',
            ),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
        ]
      : [new transports.Console()],
});

const errorLogger = createLogger({
  level: 'error',
  format: combine(label({ label: 'UMP' }), timestamp(), myFormat),
  transports:
    config.env === 'production'
      ? [
          new DailyRotateFile({
            filename: path.join(
              process.cwd(),
              'logs',
              'winston',
              'errors',
              'ump-%DATE%.error.log',
            ),
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
          }),
        ]
      : [new transports.Console()],
});

export { errorLogger, logger };
