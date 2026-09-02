import api from './client';

export type LogContext = 'foreground' | 'background';
export type LogLevel = 'debug' | 'info' | 'warning' | 'error';

export async function sendLog(
  context: LogContext,
  level: LogLevel,
  tag: string,
  message: string,
  payload?: Record<string, any>,
): Promise<void> {
  try {
    await api.post('/log/entry/', {
      context,
      level,
      tag,
      message,
      payload: payload ?? null,
    });
  } catch (e: any) {
    console.warn('[Logger] Failed to send log:', e?.message ?? e);
  }
}
