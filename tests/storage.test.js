import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../src/utils/storage.js';

describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const testState = {
        phase: 'rating',
        currentIndex: 5,
        ratings: [['1', { value: { id: 1, name: 'Test' }, rating: 'V' }]],
      };

      StorageManager.saveState(testState);

      const stored = JSON.parse(localStorage.getItem('act-values-assessment'));
      expect(stored.phase).toBe('rating');
      expect(stored.currentIndex).toBe(5);
      expect(stored.timestamp).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(() => {
        StorageManager.saveState({ test: 'data' });
      }).not.toThrow();

      // Restore original method
      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadState', () => {
    it('should load valid state from localStorage', () => {
      const testState = {
        phase: 'comparison',
        values: [{ id: 1, name: 'Test' }],
        timestamp: Date.now(),
      };

      localStorage.setItem('act-values-assessment', JSON.stringify(testState));

      const loaded = StorageManager.loadState();
      expect(loaded.phase).toBe('comparison');
      expect(loaded.values[0].name).toBe('Test');
    });

    it('should return null for non-existent state', () => {
      const loaded = StorageManager.loadState();
      expect(loaded).toBeNull();
    });

    it('should return null and clear storage for expired state', () => {
      const expiredState = {
        phase: 'rating',
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
      };

      localStorage.setItem('act-values-assessment', JSON.stringify(expiredState));

      const loaded = StorageManager.loadState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem('act-values-assessment')).toBeNull();
    });

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('act-values-assessment', 'invalid-json');

      const loaded = StorageManager.loadState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem('act-values-assessment')).toBeNull();
    });
  });

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      localStorage.setItem('act-values-assessment', 'test-data');

      StorageManager.clearState();

      expect(localStorage.getItem('act-values-assessment')).toBeNull();
    });
  });

  describe('hasStoredState', () => {
    it('should return true when valid state exists', () => {
      const testState = {
        phase: 'rating',
        timestamp: Date.now(),
      };

      localStorage.setItem('act-values-assessment', JSON.stringify(testState));

      expect(StorageManager.hasStoredState()).toBe(true);
    });

    it('should return false when no state exists', () => {
      expect(StorageManager.hasStoredState()).toBe(false);
    });

    it('should return false when state is expired', () => {
      const expiredState = {
        phase: 'rating',
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000),
      };

      localStorage.setItem('act-values-assessment', JSON.stringify(expiredState));

      expect(StorageManager.hasStoredState()).toBe(false);
    });
  });
});