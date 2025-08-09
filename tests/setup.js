// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    store: {},
    getItem(key) {
      return this.store[key] || null;
    },
    setItem(key, value) {
      this.store[key] = String(value);
    },
    removeItem(key) {
      delete this.store[key];
    },
    clear() {
      this.store = {};
    },
  },
  writable: true,
});

// Mock alert and confirm
window.alert = vi.fn();
window.confirm = vi.fn(() => true);

// Mock Date.now for consistent testing
Date.now = vi.fn(() => 1234567890000);

// Mock window.app object
window.app = {
  startComparison: vi.fn(),
  showResults: vi.fn(),
  restart: vi.fn(),
};