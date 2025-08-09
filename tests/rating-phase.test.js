import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RatingPhase } from '../src/components/rating.js';

// Mock DOM elements
const mockDOM = () => {
  document.body.innerHTML = `
    <div id="value-card"></div>
    <div id="progress-fill"></div>
    <div id="progress-text"></div>
    <div id="counter-number">0</div>
    <div id="counter-message"></div>
    <div id="very-important-counter" class="counter-container"></div>
    <button id="not-important"></button>
    <button id="quite-important"></button>
    <button id="very-important"></button>
  `;
};

describe('RatingPhase', () => {
  beforeEach(() => {
    mockDOM();
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with fresh data when no saved state', () => {
      const ratingPhase = new RatingPhase();
      
      expect(ratingPhase.currentIndex).toBe(0);
      expect(ratingPhase.ratings.size).toBe(0);
      expect(ratingPhase.values).toHaveLength(58);
    });

    it('should restore from saved state when provided', () => {
      const savedState = {
        phase: 'rating',
        values: [{ id: 1, name: 'Test Value', description: 'Test description' }],
        currentIndex: 1,
        ratings: [[1, { value: { id: 1, name: 'Test' }, rating: 'V' }]],
      };

      const ratingPhase = new RatingPhase(savedState);
      
      expect(ratingPhase.currentIndex).toBe(1);
      expect(ratingPhase.values).toHaveLength(1);
      expect(ratingPhase.ratings.get(1).rating).toBe('V');
    });
  });

  describe('rating functionality', () => {
    it('should record ratings correctly', () => {
      const ratingPhase = new RatingPhase();
      const firstValue = ratingPhase.values[0];

      ratingPhase.rate('V');

      const rating = ratingPhase.ratings.get(firstValue.id);
      expect(rating.rating).toBe('V');
      expect(rating.value).toEqual(firstValue);
    });

    it('should advance currentIndex after rating', () => {
      const ratingPhase = new RatingPhase();
      const initialIndex = ratingPhase.currentIndex;

      ratingPhase.rate('Q');

      expect(ratingPhase.currentIndex).toBe(initialIndex + 1);
    });

    it('should save state after each rating', () => {
      const ratingPhase = new RatingPhase();
      vi.spyOn(ratingPhase, 'saveState');

      ratingPhase.rate('N');

      expect(ratingPhase.saveState).toHaveBeenCalled();
    });
  });

  describe('progress tracking', () => {
    it('should update progress correctly', () => {
      const ratingPhase = new RatingPhase();
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');

      ratingPhase.updateProgress();

      const expectedProgress = (ratingPhase.currentIndex / 58) * 100;
      expect(progressFill.style.width).toBe(`${expectedProgress}%`);
      expect(progressText.textContent).toBe(`${ratingPhase.currentIndex} / 58 values rated`);
    });
  });

  describe('very important counter', () => {
    it('should count very important values correctly', () => {
      const ratingPhase = new RatingPhase();
      
      // Rate some values as Very Important
      ratingPhase.rate('V'); // First value
      ratingPhase.rate('Q'); // Second value  
      ratingPhase.rate('V'); // Third value
      
      ratingPhase.updateVeryImportantCounter();
      
      const counterNumber = document.getElementById('counter-number');
      expect(counterNumber.textContent).toBe('2');
    });

    it('should show good feedback for optimal range (≤8)', () => {
      const ratingPhase = new RatingPhase();
      const counterContainer = document.getElementById('very-important-counter');
      
      // Add 5 very important ratings
      for (let i = 0; i < 5; i++) {
        ratingPhase.rate('V');
      }
      
      ratingPhase.updateVeryImportantCounter();
      
      expect(counterContainer.classList.contains('good')).toBe(true);
      expect(counterContainer.classList.contains('warning')).toBe(false);
      expect(counterContainer.classList.contains('danger')).toBe(false);
    });

    it('should show warning for 9-10 values', () => {
      const ratingPhase = new RatingPhase();
      const counterContainer = document.getElementById('very-important-counter');
      
      // Add 9 very important ratings
      for (let i = 0; i < 9; i++) {
        ratingPhase.rate('V');
      }
      
      ratingPhase.updateVeryImportantCounter();
      
      expect(counterContainer.classList.contains('warning')).toBe(true);
      expect(counterContainer.classList.contains('good')).toBe(false);
      expect(counterContainer.classList.contains('danger')).toBe(false);
    });

    it('should show danger for 11+ values', () => {
      const ratingPhase = new RatingPhase();
      const counterContainer = document.getElementById('very-important-counter');
      
      // Add 12 very important ratings
      for (let i = 0; i < 12; i++) {
        ratingPhase.rate('V');
      }
      
      ratingPhase.updateVeryImportantCounter();
      
      expect(counterContainer.classList.contains('danger')).toBe(true);
      expect(counterContainer.classList.contains('good')).toBe(false);
      expect(counterContainer.classList.contains('warning')).toBe(false);
    });
  });

  describe('getVeryImportantValues', () => {
    it('should return only values rated as Very Important', () => {
      const ratingPhase = new RatingPhase();
      
      ratingPhase.rate('V'); // Very Important
      ratingPhase.rate('Q'); // Quite Important
      ratingPhase.rate('V'); // Very Important
      ratingPhase.rate('N'); // Not Important
      
      const veryImportant = ratingPhase.getVeryImportantValues();
      
      expect(veryImportant).toHaveLength(2);
      veryImportant.forEach(value => {
        expect(value).toHaveProperty('id');
        expect(value).toHaveProperty('name');
        expect(value).toHaveProperty('description');
      });
    });

    it('should return empty array when no values rated as Very Important', () => {
      const ratingPhase = new RatingPhase();
      
      ratingPhase.rate('Q');
      ratingPhase.rate('N');
      
      const veryImportant = ratingPhase.getVeryImportantValues();
      expect(veryImportant).toHaveLength(0);
    });
  });

  describe('completion handling', () => {
    it('should call onComplete when all values are rated', () => {
      // Mock the window.app object
      window.app = {
        startComparison: vi.fn(),
      };

      const ratingPhase = new RatingPhase();
      
      // Rate all 58 values
      for (let i = 0; i < 58; i++) {
        ratingPhase.rate('V');
      }

      expect(window.app.startComparison).toHaveBeenCalled();
    });
  });
});