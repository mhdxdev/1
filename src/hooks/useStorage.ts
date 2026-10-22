// ============================================================
// useStorage — Typed localStorage hook
// ============================================================

export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('[Storage] Failed to write:', key, err);
  }
}

export function removeStorageItem(key: string): void {
  localStorage.removeItem(key);
}
