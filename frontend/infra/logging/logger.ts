/**
 * Client-side logger — a lightweight, self-hosted alternative to Sentry.
 *
 * Captured events are batched and shipped to the backend `POST /api/logs`
 * endpoint, which persists them to the dedicated `frontend` log channel.
 *
 * Design notes:
 * - Uses raw `fetch` / `navigator.sendBeacon` instead of the shared axios
 *   `HttpService`. That keeps logging off the axios error-handler chain, so a
 *   failed log request can never trigger a toast/redirect or, worse, recurse
 *   into logging its own failure.
 * - Events are buffered and flushed on a timer, on buffer overflow, and on
 *   page hide (via `sendBeacon`, which survives unload).
 */

export type LogLevel =
  | "debug"
  | "info"
  | "notice"
  | "warning"
  | "error"
  | "critical"
  | "alert"
  | "emergency";

export type LogContext = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
}

const MAX_BATCH = 20;
const FLUSH_INTERVAL_MS = 5000;
const MAX_QUEUE = 100;

function getEndpoint(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  return `${base.replace(/\/$/, "")}/api/logs`;
}

/**
 * Remote logging is disabled in mock mode (no real backend) and can be turned
 * off explicitly with NEXT_PUBLIC_ENABLE_REMOTE_LOG=false.
 */
function isRemoteEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") return false;
  return process.env.NEXT_PUBLIC_ENABLE_REMOTE_LOG !== "false";
}

function readXsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function serializeError(error: unknown): LogContext {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { value: String(error) };
}

class Logger {
  private queue: LogEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private listenersBound = false;

  public debug(message: string, context?: LogContext): void {
    this.capture("debug", message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.capture("info", message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.capture("warning", message, context);
  }

  public error(message: string, context?: LogContext): void {
    this.capture("error", message, context);
  }

  /**
   * Capture a thrown value with its stack, Sentry-style.
   */
  public captureException(
    error: unknown,
    context?: LogContext,
    level: LogLevel = "error",
  ): void {
    const err = serializeError(error);
    const message =
      typeof err.message === "string" && err.message ? err.message : "Unhandled exception";
    this.capture(level, message, { ...context, error: err });
  }

  private capture(level: LogLevel, message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      const consoleMethod =
        level === "debug" || level === "info" ? "log" : level === "warning" ? "warn" : "error";
      // eslint-disable-next-line no-console
      console[consoleMethod](`[logger:${level}]`, message, context ?? "");
    }

    if (!isRemoteEnabled()) return;

    const entry: LogEntry = {
      level,
      message,
      context: { url: window.location.href, ...context },
      timestamp: new Date().toISOString(),
    };

    this.queue.push(entry);
    // Drop oldest entries if a flush keeps failing, so we never grow unbounded.
    if (this.queue.length > MAX_QUEUE) {
      this.queue.splice(0, this.queue.length - MAX_QUEUE);
    }

    this.bindUnloadListeners();

    if (this.queue.length >= MAX_BATCH) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Send the buffered entries. `useBeacon` is used on page hide, where an async
   * fetch would be cancelled by the unload.
   */
  public flush(useBeacon = false): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) return;

    const logs = this.queue;
    this.queue = [];
    const payload = JSON.stringify({ logs });
    const endpoint = getEndpoint();

    try {
      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        const ok = navigator.sendBeacon(endpoint, blob);
        if (!ok) this.requeue(logs);
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const xsrf = readXsrfToken();
      if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

      void fetch(endpoint, {
        method: "POST",
        headers,
        body: payload,
        credentials: "include",
        keepalive: true,
      }).catch(() => {
        // Swallow: logging must never surface its own transport errors.
        this.requeue(logs);
      });
    } catch {
      this.requeue(logs);
    }
  }

  private requeue(logs: LogEntry[]): void {
    this.queue = [...logs, ...this.queue].slice(-MAX_QUEUE);
  }

  private bindUnloadListeners(): void {
    if (this.listenersBound || typeof window === "undefined") return;
    this.listenersBound = true;

    const flushOnHide = () => {
      if (document.visibilityState === "hidden") this.flush(true);
    };
    document.addEventListener("visibilitychange", flushOnHide);
    window.addEventListener("pagehide", () => this.flush(true));
  }
}

export const logger = new Logger();
