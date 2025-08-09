export class ResultsPhase {
  constructor(topThreeValues) {
    this.topThreeValues = topThreeValues;
    this.init();
  }

  init() {
    this.container = document.getElementById('results-container');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');

    // Set progress to 100%
    this.progressFill.style.width = '100%';
    this.progressText.textContent = 'Assessment complete!';

    this.displayResults();

    // Setup restart button
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      window.app.restart();
    });
  }

  displayResults() {
    this.container.innerHTML = this.topThreeValues
      .map(
        (value, index) => `
            <div class="result-card">
                <div class="result-rank">${index + 1}</div>
                <div class="value-name">${value.name}</div>
                <div class="value-description">${value.description}</div>
            </div>
        `
      )
      .join('');
  }
}
