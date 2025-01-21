import fs from 'fs'
import path from 'path'

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

const LOG_CONFIG = {
  LOG_DIR: path.join(process.cwd(), 'logs'),
  LOG_FILE: 'app.log',
  CONSOLE_OUTPUT: process.env.NODE_ENV !== 'production',
  MIN_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
}

if (!fs.existsSync(LOG_CONFIG.LOG_DIR)) {
  fs.mkdirSync(LOG_CONFIG.LOG_DIR, { recursive: true })
}

// 添加自定义类型定义
type LogMessage = Record<string, unknown>
type ErrorType = Error | null | undefined

interface RequestLogData {
  method: string
  url: string
  headers?: Record<string, string>
  userId?: string | number
  ip?: string
  startTime: number
  statusCode?: number
  error?: ErrorType
}

interface AdminLogData {
  action: string
  userId: string | number
  details?: Record<string, unknown>
  error?: ErrorType
}

interface SystemLogData {
  action: string
  details?: Record<string, unknown>
  error?: ErrorType
}

class Logger {
  private logFile: string

  constructor() {
    this.logFile = path.join(LOG_CONFIG.LOG_DIR, LOG_CONFIG.LOG_FILE)
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel)
    const minLevelIndex = levels.indexOf(LOG_CONFIG.MIN_LEVEL)
    const currentLevelIndex = levels.indexOf(level)
    return currentLevelIndex >= minLevelIndex
  }

  private formatMessage(level: LogLevel, module: string, message: LogMessage): string {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      module,
      ...message
    }
    return JSON.stringify(logData)
  }

  private write(message: string) {
    fs.appendFileSync(this.logFile, message + '\n')
    
    if (LOG_CONFIG.CONSOLE_OUTPUT) {
      console.log(message)
    }
  }

  logRequest(module: string, data: RequestLogData) {
    const duration = Date.now() - data.startTime
    const level = data.error ? LogLevel.ERROR : LogLevel.INFO
    
    if (!this.shouldLog(level)) return

    const message = this.formatMessage(level, module, {
      type: 'request',
      method: data.method,
      url: data.url,
      headers: {
        'user-agent': data.headers?.['user-agent'],
        'content-type': data.headers?.['content-type']
      },
      userId: data.userId,
      ip: data.ip,
      duration: `${duration}ms`,
      statusCode: data.statusCode,
      error: data.error
    })
    
    this.write(message)
  }

  logAdmin(module: string, data: AdminLogData) {
    const level = data.error ? LogLevel.ERROR : LogLevel.INFO
    
    if (!this.shouldLog(level)) return

    const message = this.formatMessage(level, module, {
      type: 'admin',
      ...data
    })
    
    this.write(message)
  }

  logSystem(module: string, data: SystemLogData) {
    const level = data.error ? LogLevel.ERROR : LogLevel.INFO
    
    if (!this.shouldLog(level)) return

    const message = this.formatMessage(level, module, {
      type: 'system',
      ...data
    })
    
    this.write(message)
  }

  log(level: LogLevel, module: string, message: LogMessage) {
    if (!this.shouldLog(level)) return
    
    const formattedMessage = this.formatMessage(level, module, {
      type: 'general',
      message
    })
    
    this.write(formattedMessage)
  }

  debug(module: string, message: LogMessage) {
    this.log(LogLevel.DEBUG, module, message)
  }

  info(module: string, message: LogMessage) {
    this.log(LogLevel.INFO, module, message)
  }

  warn(module: string, message: LogMessage) {
    this.log(LogLevel.WARN, module, message)
  }

  error(module: string, message: LogMessage) {
    this.log(LogLevel.ERROR, module, message)
  }
}

export const logger = new Logger() 