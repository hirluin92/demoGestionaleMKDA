type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMeta {
  [key: string]: any
}

class SimpleLogger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString()
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
  }

  info(message: string, meta?: LogMeta) {
    console.log(this.formatMessage('info', message, meta))
  }

  warn(message: string, meta?: LogMeta) {
    console.warn(this.formatMessage('warn', message, meta))
  }

  error(message: string, meta?: LogMeta) {
    console.error(this.formatMessage('error', message, meta))
  }

  debug(message: string, meta?: LogMeta) {
    if (!this.isProduction) {
      console.log(this.formatMessage('debug', message, meta))
    }
  }
}

export const logger = new SimpleLogger()
