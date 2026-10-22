// ============================================================
// EventEmitter — Typed pub/sub event bridge for real-time sync
// ============================================================

type EventCallback<T = unknown> = (payload: T) => void;

class EventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const cb = callback as EventCallback;
    this.listeners.get(event)!.add(cb);
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(cb);
    };
  }

  emit<T>(event: string, payload: T): void {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`[EventEmitter] Error in handler for "${event}":`, err);
      }
    });
  }

  off(event: string, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Singleton emitter shared across the whole app
export const telegramEmitter = new EventEmitter();

// Typed event names
export const EVENTS = {
  MESSAGE_SENT: 'message:sent',
  MESSAGE_STATUS_UPDATED: 'message:status_updated',
  CHAT_CREATED: 'chat:created',
  CHAT_JOINED: 'chat:joined',
  USER_UPDATED: 'user:updated',
  PREMIUM_TOGGLED: 'premium:toggled',
  SETTINGS_UPDATED: 'settings:updated',
  LOG_ADDED: 'log:added',
  MEME_CREATED: 'meme:created',
  AUTH_CHANGED: 'auth:changed',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
