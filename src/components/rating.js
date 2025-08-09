import { getShuffledValues } from '../utils/values.js';
import { StorageManager } from '../utils/storage.js';

export class RatingPhase {
  constructor(savedState = null) {
    if (savedState?.phase === 'rating') {
      this.values = savedState.values;
      this.currentIndex = savedState.currentIndex;
      this.ratings = new Map(savedState.ratings);
    } else {
      this.values = getShuffledValues();
      this.currentIndex = 0;
      this.ratings = new Map();
    }
    this.init();
  }

  init() {
    this.valueCard = document.getElementById('value-card');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');
    this.counterNumber = document.getElementById('counter-number');
    this.counterMessage = document.getElementById('counter-message');
    this.counterContainer = document.getElementById('very-important-counter');

    // Bind rating button event listeners
    document
      .getElementById('not-important')
      ?.addEventListener('click', () => this.rate('N'));
    document
      .getElementById('quite-important')
      ?.addEventListener('click', () => this.rate('Q'));
    document
      .getElementById('very-important')
      ?.addEventListener('click', () => this.rate('V'));

    this.displayCurrentValue();
    this.updateVeryImportantCounter();
  }

  displayCurrentValue() {
    if (this.currentIndex >= this.values.length) {
      this.onComplete();
      return;
    }

    const value = this.values[this.currentIndex];
    this.valueCard.innerHTML = `
            <div class="value-name">${value.name}</div>
            <div class="value-description">${value.description}</div>
        `;

    this.updateProgress();
  }

  rate(rating) {
    const currentValue = this.values[this.currentIndex];
    this.ratings.set(currentValue.id, {
      value: currentValue,
      rating: rating,
    });

    this.currentIndex++;
    this.saveState();
    this.updateVeryImportantCounter();
    this.displayCurrentValue();
  }

  saveState() {
    StorageManager.saveState({
      phase: 'rating',
      values: this.values,
      currentIndex: this.currentIndex,
      ratings: Array.from(this.ratings.entries()),
    });
  }

  updateProgress() {
    const progress = (this.currentIndex / this.values.length) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${this.currentIndex} / ${this.values.length} values rated`;
  }

  updateVeryImportantCounter() {
    const veryImportantCount = Array.from(this.ratings.values()).filter(
      ({ rating }) => rating === 'V'
    ).length;

    this.counterNumber.textContent = veryImportantCount;

    // Remove existing classes
    this.counterContainer.classList.remove('good', 'warning', 'danger');

    // Update visual feedback based on count
    if (veryImportantCount <= 8) {
      this.counterContainer.classList.add('good');
      this.counterMessage.textContent = veryImportantCount <= 4 
        ? 'Great start! Keep selecting values that truly resonate with you.'
        : 'Perfect range for meaningful comparisons.';
    } else if (veryImportantCount <= 10) {
      this.counterContainer.classList.add('warning');
      this.counterMessage.textContent = 'You\'re at the recommended limit. Consider if all these are truly essential.';
    } else if (veryImportantCount <= 15) {
      this.counterContainer.classList.add('danger');
      this.counterMessage.textContent = `${Math.round((veryImportantCount * (veryImportantCount - 1)) / 2)} comparisons ahead. Consider reducing to focus on what matters most.`;
    } else {
      this.counterContainer.classList.add('danger');
      this.counterMessage.textContent = `${Math.round((veryImportantCount * (veryImportantCount - 1)) / 2)} comparisons! This will take a very long time. Please reconsider some choices.`;
    }
  }

  getVeryImportantValues() {
    return Array.from(this.ratings.values())
      .filter(({ rating }) => rating === 'V')
      .map(({ value }) => value);
  }

  onComplete() {
    // This will be called by the main app controller
    window.app.startComparison(this.getVeryImportantValues());
  }

  reset() {
    this.currentIndex = 0;
    this.ratings.clear();
    this.values = getShuffledValues();
    this.displayCurrentValue();
  }
}
