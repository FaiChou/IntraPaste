import fs from 'fs'
import path from 'path'

// 日志级别枚举
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// 日志配置
const LOG_CONFIG = {
  // 日志文件路径
  LOG_DIR: path.join(process.cwd(), 'logs'),
  // 日志文件名格式
  LOG_FILE: 'app.log',
  // 是否输出到控制台
  CONSOLE_OUTPUT: process.env.NODE_ENV !== 'production',
  // 最小日志级别
  MIN_LEVEL: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
}

// 确保日志目录存在
if (!fs.existsSync(LOG_CONFIG.LOG_DIR)) {
  fs.mkdirSync(LOG_CONFIG.LOG_DIR, { recursive: true })
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

  private formatMessage(level: LogLevel, module: string, message: any): string {
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
    // 追加到日志文件
    fs.appendFileSync(this.logFile, message + '\n')
    
    // 开发环境下同时输出到控制台
    if (LOG_CONFIG.CONSOLE_OUTPUT) {
      console.log(message)
    }
  }

  // API 请求日志
  logRequest(module: string, data: {
    method: string
    url: string
    headers?: Record<string, string>
    userId?: string | number
    ip?: string
    startTime: number
    statusCode?: number
    error?: any
  }) {
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

  // 管理员操作日志
  logAdmin(module: string, data: {
    action: string
    userId: string | number
    details?: any
    error?: any
  }) {
    const level = data.error ? LogLevel.ERROR : LogLevel.INFO
    
    if (!this.shouldLog(level)) return

    const message = this.formatMessage(level, module, {
      type: 'admin',
      ...data
    })
    
    this.write(message)
  }

  // 系统操作日志
  logSystem(module: string, data: {
    action: string
    details?: any
    error?: any
  }) {
    const level = data.error ? LogLevel.ERROR : LogLevel.INFO
    
    if (!this.shouldLog(level)) return

    const message = this.formatMessage(level, module, {
      type: 'system',
      ...data
    })
    
    this.write(message)
  }

  // 通用日志方法
  log(level: LogLevel, module: string, message: any) {
    if (!this.shouldLog(level)) return
    
    const formattedMessage = this.formatMessage(level, module, {
      type: 'general',
      message
    })
    
    this.write(formattedMessage)
  }

  debug(module: string, message: any) {
    this.log(LogLevel.DEBUG, module, message)
  }

  info(module: string, message: any) {
    this.log(LogLevel.INFO, module, message)
  }

  warn(module: string, message: any) {
    this.log(LogLevel.WARN, module, message)
  }

  error(module: string, message: any) {
    this.log(LogLevel.ERROR, module, message)
  }
}

export const logger = new Logger() 