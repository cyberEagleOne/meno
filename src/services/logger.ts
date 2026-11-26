/**
 * Meno Application Runtime Logging System
 *
 * Implements structured, safe logging according to docs/LOGGING_AND_ERROR_HANDLING.md.
 * Provides DEBUG, INFO, WARN, and ERROR levels with automatic PII/secret sanitization,
 * in-memory ring-buffer for runtime diagnostics, and environment-aware output.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogCategory =
  | "APP_LIFECYCLE"
  | "API_INTEGRATION"
  | "DATABASE"
  | "BIBLE"
  | "SECURITY_AUTH"
  | "FORM_VALIDATION"
  | "SENSOR"
  | "GENERAL";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  event: string;
  message?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    status?: number;
  };
}

export type LogHandler = (entry: LogEntry) => void;

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const SENSITIVE_KEY_REGEX = /password|token|secret|authorization|api[_-]?key|pin|credential/i;

class Logger {
  private minLevel: LogLevel = "DEBUG";
  private isProduction: boolean = false;
  private buffer: LogEntry[] = [];
  private readonly maxBufferSize: number = 100;
  private customHandlers: LogHandler[] = [];

  constructor() {
    // Detect environment safely
    try {
      if (typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
        this.isProduction = true;
        this.minLevel = "INFO";
      }
    } catch {
      this.isProduction = false;
    }
  }

  public setEnvironment(isProd: boolean, minLevel?: LogLevel): void {
    this.isProduction = isProd;
    if (minLevel) {
      this.minLevel = minLevel;
    } else {
      this.minLevel = isProd ? "INFO" : "DEBUG";
    }
  }

  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  public addHandler(handler: LogHandler): () => void {
    this.customHandlers.push(handler);
    return () => {
      this.customHandlers = this.customHandlers.filter((h) => h !== handler);
    };
  }

  public getRecentLogs(): readonly LogEntry[] {
    return [...this.buffer];
  }

  public clearLogs(): void {
    this.buffer = [];
  }

  /**
   * Sanitizes metadata to prevent leaking PII, passwords, PINs, or auth secrets.
   */
  public sanitizeMetadata(data?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!data || typeof data !== "object") return undefined;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        sanitized[key] = "[REDACTED]";
      } else if (key === "note" || key === "reflectionNote") {
        // Redact personal user reflection notes and log character length instead
        sanitized[`${key}Length`] = typeof value === "string" ? value.length : 0;
      } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private log(
    level: LogLevel,
    category: LogCategory,
    event: string,
    message?: string,
    metadata?: Record<string, unknown>,
    errorObj?: unknown,
  ): LogEntry {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return {
        timestamp: new Date().toISOString(),
        level,
        category,
        event,
      };
    }

    let parsedError: LogEntry["error"];
    if (errorObj) {
      if (errorObj instanceof Error) {
        parsedError = {
          name: errorObj.name,
          message: errorObj.message,
          stack: this.isProduction ? undefined : errorObj.stack,
          status: (errorObj as any).status,
        };
      } else {
        parsedError = {
          name: "UnknownError",
          message: String(errorObj),
        };
      }
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      event,
      ...(message ? { message } : {}),
      ...(metadata ? { metadata: this.sanitizeMetadata(metadata) } : {}),
      ...(parsedError ? { error: parsedError } : {}),
    };

    // Keep in in-memory ring buffer
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift();
    }

    // Dispatch to custom handlers (e.g. testing or telemetry)
    for (const handler of this.customHandlers) {
      try {
        handler(entry);
      } catch {
        // Handlers must not throw
      }
    }

    // Output to console
    this.outputToConsole(entry);

    return entry;
  }

  private outputToConsole(entry: LogEntry): void {
    const formatted = `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.event}${
      entry.message ? `: ${entry.message}` : ""
    }`;

    if (this.isProduction) {
      // In production, emit clean single-line JSON
      const jsonStr = JSON.stringify(entry);
      switch (entry.level) {
        case "ERROR":
          console.error(jsonStr);
          break;
        case "WARN":
          console.warn(jsonStr);
          break;
        default:
          console.info(jsonStr);
          break;
      }
    } else {
      // In development / testing
      switch (entry.level) {
        case "ERROR":
          console.error(formatted, entry.error || "", entry.metadata || "");
          break;
        case "WARN":
          console.warn(formatted, entry.error || "", entry.metadata || "");
          break;
        case "INFO":
          console.info(formatted, entry.metadata || "");
          break;
        case "DEBUG":
          console.debug(formatted, entry.metadata || "");
          break;
      }
    }
  }

  public debug(
    category: LogCategory,
    event: string,
    metadata?: Record<string, unknown>,
    message?: string,
  ): LogEntry {
    return this.log("DEBUG", category, event, message, metadata);
  }

  public info(
    category: LogCategory,
    event: string,
    metadata?: Record<string, unknown>,
    message?: string,
  ): LogEntry {
    return this.log("INFO", category, event, message, metadata);
  }

  public warn(
    category: LogCategory,
    event: string,
    metadata?: Record<string, unknown>,
    message?: string,
    error?: unknown,
  ): LogEntry {
    return this.log("WARN", category, event, message, metadata, error);
  }

  public error(
    category: LogCategory,
    event: string,
    error?: unknown,
    metadata?: Record<string, unknown>,
    message?: string,
  ): LogEntry {
    return this.log("ERROR", category, event, message, metadata, error);
  }
}

export const logger = new Logger();

