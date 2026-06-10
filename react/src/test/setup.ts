// Shared test setup. Runs for every test file (node and jsdom environments).
//
// Neither environment gives us a usable localStorage: the jsdom build here
// doesn't implement Web Storage, and Node 26's experimental global
// `localStorage` warns ("--localstorage-file was not provided") on first
// access. So we unconditionally install a deterministic in-memory shim.
//
// `defineProperty` replaces the property without ever *reading* the existing
// value, which is what would trigger Node's warning getter.
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
