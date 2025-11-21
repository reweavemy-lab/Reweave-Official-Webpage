import { createLogger, transports, format } from 'winston'

const level = process.env.LOG_LEVEL || 'info'

export const logger = createLogger({
  level,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()]
})