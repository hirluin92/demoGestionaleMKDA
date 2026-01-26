import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@/lib/logger'

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should log info messages', () => {
    logger.info('Test message')
    expect(consoleLogSpy).toHaveBeenCalled()
  })

  it('should log error messages', () => {
    logger.error('Error message')
    expect(consoleLogSpy).toHaveBeenCalled()
  })

  it('should log with metadata', () => {
    logger.info('Test with meta', { userId: '123' })
    expect(consoleLogSpy).toHaveBeenCalled()
    const loggedMessage = consoleLogSpy.mock.calls[0][0]
    expect(loggedMessage).toContain('userId')
  })

  it('should only log debug in development', () => {
    const originalEnv = process.env.NODE_ENV
    
    // Test in development
    process.env.NODE_ENV = 'development'
    logger.debug('Debug message')
    expect(consoleLogSpy).toHaveBeenCalled()
    
    consoleLogSpy.mockClear()
    
    // Test in production
    process.env.NODE_ENV = 'production'
    logger.debug('Debug message')
    expect(consoleLogSpy).not.toHaveBeenCalled()
    
    process.env.NODE_ENV = originalEnv
  })
})
