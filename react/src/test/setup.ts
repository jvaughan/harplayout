// Shared test setup. Runs for every test file (node and jsdom environments).
// The jsdom build used here doesn't implement Web Storage, so provide a minimal
// in-memory localStorage when it's absent.
if (typeof globalThis.localStorage === "undefined") {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();
    get length() {
      return this.store.size;
    }
    clear() {
      this.store.clear();
    }
    getItem(key: string) {
      return this.store.has(key) ? this.store.get(key)! : null;
    }
    key(index: number) {
      return Array.from(this.store.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.store.delete(key);
    }
    setItem(key: string, value: string) {
      this.store.set(key, String(value));
    }
  }
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}
