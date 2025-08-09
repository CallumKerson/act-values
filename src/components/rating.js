import { getShuffledValues } from '../utils/values.js';

export class RatingPhase {
  constructor() {
    this.values = getShuffledValues();
    this.currentIndex = 0;
    this.ratings = new Map();
    this.init();
  }

  init() {
    this.valueCard = document.getElementById('value-card');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

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
    this.displayCurrentValue();
  }

  updateProgress() {
    const progress = (this.currentIndex / this.values.length) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${this.currentIndex} / ${this.values.length} values rated`;
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
