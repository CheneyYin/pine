import {
    LoggerOptions,
    createLogger,
    format,
    transports,
    Logger,
} from 'winston';

const opts: LoggerOptions = {
    level: 'info',
    format: format.combine(format.timestamp(), format.simple()),
    transports: [new transports.Console()],
};

export const logger: Logger = createLogger(opts);
