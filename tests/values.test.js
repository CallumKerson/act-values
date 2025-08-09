import { describe, it, expect } from 'vitest';
import { valuesData, getShuffledValues } from '../src/utils/values.js';

describe('Values utilities', () => {
  describe('valuesData', () => {
    it('should contain exactly 58 values', () => {
      expect(valuesData).toHaveLength(58);
    });

    it('should have all required properties for each value', () => {
      valuesData.forEach((value, index) => {
        expect(value).toHaveProperty('id');
        expect(value).toHaveProperty('name');
        expect(value).toHaveProperty('description');
        expect(value.id).toBe(index + 1);
        expect(typeof value.name).toBe('string');
        expect(typeof value.description).toBe('string');
        expect(value.name.length).toBeGreaterThan(0);
        expect(value.description.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs', () => {
      const ids = valuesData.map(v => v.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(58);
    });

    it('should have unique names', () => {
      const names = valuesData.map(v => v.name);
      const uniqueNames = [...new Set(names)];
      expect(uniqueNames).toHaveLength(58);
    });

    it('should contain expected ACT values', () => {
      const valueNames = valuesData.map(v => v.name);
      expect(valueNames).toContain('Acceptance');
      expect(valueNames).toContain('Compassion');
      expect(valueNames).toContain('Authenticity');
      expect(valueNames).toContain('Connection');
      expect(valueNames).toContain('Mindfulness');
    });
  });

  describe('getShuffledValues', () => {
    it('should return all 58 values', () => {
      const shuffled = getShuffledValues();
      expect(shuffled).toHaveLength(58);
    });

    it('should return the same values as valuesData', () => {
      const shuffled = getShuffledValues();
      const originalIds = valuesData.map(v => v.id).sort();
      const shuffledIds = shuffled.map(v => v.id).sort();
      expect(shuffledIds).toEqual(originalIds);
    });

    it('should return different orders on multiple calls', () => {
      // Note: This test has a tiny chance of failing if shuffle returns same order
      // Run multiple times to reduce probability
      const attempts = 10;
      let differentOrderFound = false;

      for (let i = 0; i < attempts; i++) {
        const shuffle1 = getShuffledValues();
        const shuffle2 = getShuffledValues();
        
        // Check if orders are different
        const order1 = shuffle1.map(v => v.id).join(',');
        const order2 = shuffle2.map(v => v.id).join(',');
        
        if (order1 !== order2) {
          differentOrderFound = true;
          break;
        }
      }

      expect(differentOrderFound).toBe(true);
    });

    it('should not modify the original valuesData', () => {
      const originalFirst = valuesData[0];
      getShuffledValues();
      expect(valuesData[0]).toEqual(originalFirst);
    });
  });
});