export function createLocalId(): string {
  try {
    const fn = globalThis.crypto?.randomUUID;
    if (typeof fn === "function") {
      return fn.call(globalThis.crypto);
    }
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
