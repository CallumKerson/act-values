import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComparisonPhase } from '../src/components/comparison.js';

const mockDOM = () => {
  document.body.innerHTML = `
    <div id="comparison-container"></div>
    <div id="progress-fill"></div>
    <div id="progress-text"></div>
  `;
};

const mockValues = [
  { id: 1, name: 'Value A', description: 'Description A' },
  { id: 2, name: 'Value B', description: 'Description B' },
  { id: 3, name: 'Value C', description: 'Description C' },
  { id: 4, name: 'Value D', description: 'Description D' },
];

describe('ComparisonPhase', () => {
  beforeEach(() => {
    mockDOM();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with fresh data when no saved state', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      
      expect(comparisonPhase.values).toEqual(mockValues);
      expect(comparisonPhase.currentIndex).toBe(0);
      expect(comparisonPhase.scores.size).toBe(4);
      expect(comparisonPhase.comparisons.length).toBe(6); // 4 choose 2 = 6 pairs
    });

    it('should restore from saved state when provided', () => {
      const savedState = {
        phase: 'comparison',
        values: mockValues,
        comparisons: [[mockValues[0], mockValues[1]]],
        currentIndex: 1,
        scores: [[1, 2], [2, 0], [3, 1], [4, 0]],
      };

      const comparisonPhase = new ComparisonPhase(null, savedState);
      
      expect(comparisonPhase.currentIndex).toBe(1);
      expect(comparisonPhase.scores.get(1)).toBe(2);
      expect(comparisonPhase.comparisons).toEqual(savedState.comparisons);
    });
  });

  describe('generateComparisons', () => {
    it('should create correct number of pairwise comparisons', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      
      // For 4 values: 4 choose 2 = 6 comparisons
      expect(comparisonPhase.comparisons).toHaveLength(6);
    });

    it('should include all possible pairs', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const pairs = comparisonPhase.comparisons;
      
      // Check that each value appears in comparisons
      const valueIds = new Set();
      pairs.forEach(([val1, val2]) => {
        valueIds.add(val1.id);
        valueIds.add(val2.id);
      });
      
      expect(valueIds.size).toBe(4);
      expect([...valueIds].sort()).toEqual([1, 2, 3, 4]);
    });

    it('should not have duplicate pairs', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const pairStrings = comparisonPhase.comparisons.map(([val1, val2]) => 
        [val1.id, val2.id].sort().join('-')
      );
      
      const uniquePairs = [...new Set(pairStrings)];
      expect(uniquePairs).toHaveLength(pairStrings.length);
    });
  });

  describe('scoring system', () => {
    it('should initialize all scores to zero', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      
      mockValues.forEach(value => {
        expect(comparisonPhase.scores.get(value.id)).toBe(0);
      });
    });

    it('should increment winner score when choice is made', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const initialScore = comparisonPhase.scores.get(1);
      
      comparisonPhase.choose(1);
      
      expect(comparisonPhase.scores.get(1)).toBe(initialScore + 1);
    });

    it('should advance to next comparison after choice', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const initialIndex = comparisonPhase.currentIndex;
      
      comparisonPhase.choose(1);
      
      expect(comparisonPhase.currentIndex).toBe(initialIndex + 1);
    });
  });

  describe('progress tracking', () => {
    it('should update progress correctly', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const progressFill = document.getElementById('progress-fill');
      const progressText = document.getElementById('progress-text');
      
      comparisonPhase.updateProgress();
      
      const expectedProgress = (0 / 6) * 100;
      expect(progressFill.style.width).toBe(`${expectedProgress}%`);
      expect(progressText.textContent).toBe('0 / 6 comparisons completed');
    });

    it('should show correct progress after comparisons', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const progressText = document.getElementById('progress-text');
      
      comparisonPhase.choose(1); // Complete first comparison
      comparisonPhase.updateProgress();
      
      expect(progressText.textContent).toBe('1 / 6 comparisons completed');
    });
  });

  describe('getTopThreeValues', () => {
    it('should return values sorted by score descending', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      
      // Manually set scores
      comparisonPhase.scores.set(1, 3); // Highest
      comparisonPhase.scores.set(2, 1);
      comparisonPhase.scores.set(3, 2);
      comparisonPhase.scores.set(4, 0); // Lowest
      
      const topThree = comparisonPhase.getTopThreeValues();
      
      expect(topThree).toHaveLength(3);
      expect(topThree[0].id).toBe(1); // Highest score
      expect(topThree[1].id).toBe(3); // Second highest
      expect(topThree[2].id).toBe(2); // Third highest
    });

    it('should handle ties gracefully', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      
      // Set tied scores
      comparisonPhase.scores.set(1, 2);
      comparisonPhase.scores.set(2, 2);
      comparisonPhase.scores.set(3, 1);
      comparisonPhase.scores.set(4, 0);
      
      const topThree = comparisonPhase.getTopThreeValues();
      
      expect(topThree).toHaveLength(3);
      expect(topThree[2].id).toBe(3); // Should include third place
    });
  });

  describe('comparison completion', () => {
    it('should call onComplete when all comparisons are done', () => {
      window.app = {
        showResults: vi.fn(),
      };

      const comparisonPhase = new ComparisonPhase(mockValues);
      
      // Complete all 6 comparisons
      for (let i = 0; i < 6; i++) {
        comparisonPhase.choose(1);
      }

      expect(window.app.showResults).toHaveBeenCalled();
    });
  });

  describe('UI rendering', () => {
    it('should display current comparison in DOM', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const container = document.getElementById('comparison-container');
      
      // Since comparisons are shuffled, just check that some values and VS are displayed
      expect(container.innerHTML).toContain('VS');
      expect(container.innerHTML).toContain('comparison-card');
      expect(container.innerHTML).toContain('value-name');
    });

    it('should add click handlers to comparison cards', () => {
      const comparisonPhase = new ComparisonPhase(mockValues);
      const cards = document.querySelectorAll('.comparison-card');
      
      expect(cards).toHaveLength(2);
      
      // Click first card
      cards[0].click();
      
      // Should advance to next comparison
      expect(comparisonPhase.currentIndex).toBe(1);
    });
  });
});