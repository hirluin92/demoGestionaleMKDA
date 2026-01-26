/**
 * Structured logging utility
 * 
 * @module lib/logger
 */

import { env } from './env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogMeta {
  [key: string]: any
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  meta?: LogMeta
  environment: string
}

class Logger {
  private isProduction = env.NODE_ENV === 'production'

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      environment: env.NODE_ENV || 'development',
    }
  }

  private log(level: LogLevel, message: string, meta?: LogMeta) {
    const entry = this.formatMessage(level, message, meta)
    
    if (this.isProduction) {
      console.log(JSON.stringify(entry))
    } else {
      const metaStr = meta ? `\n  ${JSON.stringify(meta, null, 2)}` : ''
      const color = {
        info: '\x1b[36m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[90m',
      }[level]
      const reset = '\x1b[0m'
      
      console.log(`${color}[${entry.timestamp}] [${level.toUpperCase()}]${reset} ${message}${metaStr}`)
    }
  }

  info(message: string, meta?: LogMeta) {
    this.log('info', message, meta)
  }

  warn(message: string, meta?: LogMeta) {
    this.log('warn', message, meta)
  }

  error(message: string, meta?: LogMeta) {
    this.log('error', message, meta)
  }

  debug(message: string, meta?: LogMeta) {
    if (!this.isProduction) {
      this.log('debug', message, meta)
    }
  }
}

/**
 * Logger instance
 * 
 * - Development: Colored console output with formatted metadata
 * - Production: JSON-formatted logs for log aggregation services
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger'
 * 
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Payment failed', { error: err.message, orderId: '456' })
 * logger.debug('Processing item', { item })
 * ```
 */
export const logger = new Logger()
