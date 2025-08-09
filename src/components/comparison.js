export class ComparisonPhase {
  constructor(values) {
    this.values = values;
    this.comparisons = this.generateComparisons();
    this.currentIndex = 0;
    this.scores = new Map();

    // Initialize scores
    this.values.forEach(({ id }) => this.scores.set(id, 0));

    this.init();
  }

  init() {
    this.container = document.getElementById('comparison-container');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    this.displayCurrentComparison();
  }

  generateComparisons() {
    const comparisons = [];
    for (let i = 0; i < this.values.length; i++) {
      for (let j = i + 1; j < this.values.length; j++) {
        comparisons.push([this.values[i], this.values[j]]);
      }
    }

    // Shuffle comparisons to avoid bias
    for (let i = comparisons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [comparisons[i], comparisons[j]] = [comparisons[j], comparisons[i]];
    }

    return comparisons;
  }

  displayCurrentComparison() {
    if (this.currentIndex >= this.comparisons.length) {
      this.onComplete();
      return;
    }

    const [value1, value2] = this.comparisons[this.currentIndex];

    this.container.innerHTML = `
            <div class="comparison-card" data-value-id="${value1.id}">
                <div class="value-name">${value1.name}</div>
                <div class="value-description">${value1.description}</div>
            </div>
            <div class="comparison-vs">VS</div>
            <div class="comparison-card" data-value-id="${value2.id}">
                <div class="value-name">${value2.name}</div>
                <div class="value-description">${value2.description}</div>
            </div>
        `;

    // Add click handlers
    this.container.querySelectorAll('.comparison-card').forEach((card) => {
      card.addEventListener('click', () => {
        const valueId = Number(card.dataset.valueId);
        this.choose(valueId);
      });
    });

    this.updateProgress();
  }

  choose(winnerValueId) {
    // Increment score for chosen value
    const currentScore = this.scores.get(winnerValueId) || 0;
    this.scores.set(winnerValueId, currentScore + 1);

    this.currentIndex++;
    this.displayCurrentComparison();
  }

  updateProgress() {
    const progress = (this.currentIndex / this.comparisons.length) * 100;
    this.progressFill.style.width = `${progress}%`;
    this.progressText.textContent = `${this.currentIndex} / ${this.comparisons.length} comparisons completed`;
  }

  getTopThreeValues() {
    // Sort values by score (descending)
    const sortedValues = this.values
      .map((value) => ({
        value,
        score: this.scores.get(value.id) || 0,
      }))
      .sort((a, b) => b.score - a.score);

    return sortedValues.slice(0, 3).map((item) => item.value);
  }

  onComplete() {
    // This will be called by the main app controller
    window.app.showResults(this.getTopThreeValues());
  }
}
