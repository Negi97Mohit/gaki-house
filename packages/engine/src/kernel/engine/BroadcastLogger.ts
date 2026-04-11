type LogLevel = "info" | "warn" | "error" | "debug";

export class BroadcastLogger {
  private buffer: string[] = [];
  private flushTimeout: any = null;

  private flush = () => {
    if (this.buffer.length > 0) {
      const payload = this.buffer.join("\n");
      if ((window as any).electron?.logger) {
        (window as any).electron.logger.appendLine(payload);
      }
      this.buffer = [];
    }
    this.flushTimeout = null;
  };

  log(context: string, level: LogLevel, message: string) {
    const now = new Date();
    // Format: [YYYY-MM-DD HH:mm:ss]
    const pad = (n: number) => n.toString().padStart(2, "0");
    const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const line = `[${ts}] [${level.toUpperCase()}] [${context}] ${message}`;
    
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);

    this.buffer.push(line);

    if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(this.flush, 500);
    }
  }
}

export const AppLogger = new BroadcastLogger();
