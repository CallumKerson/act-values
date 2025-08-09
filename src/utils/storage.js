const STORAGE_KEY = 'act-values-assessment';

export class StorageManager {
  static saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to save assessment state:', error);
    }
  }

  static loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const state = JSON.parse(stored);
      
      // Check if state is older than 7 days (optional cleanup)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (Date.now() - state.timestamp > maxAge) {
        this.clearState();
        return null;
      }
      
      return state;
    } catch (error) {
      console.warn('Failed to load assessment state:', error);
      this.clearState();
      return null;
    }
  }

  static clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear assessment state:', error);
    }
  }

  static hasStoredState() {
    return this.loadState() !== null;
  }
}