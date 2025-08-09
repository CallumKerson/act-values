import { RatingPhase } from './components/rating.js';
import { ComparisonPhase } from './components/comparison.js';
import { ResultsPhase } from './components/results.js';

class App {
  constructor() {
    this.currentPhase = null;
    this.init();
  }

  init() {
    // Start with rating phase
    this.startRating();

    // Make app globally accessible for phase transitions
    window.app = this;
  }

  startRating() {
    this.showPhase('rating-phase');
    this.currentPhase = new RatingPhase();
  }

  startComparison(veryImportantValues) {
    if (veryImportantValues.length < 2) {
      alert(
        'You need to rate at least 2 values as "Very Important" to continue with comparisons.'
      );
      return;
    }

    if (veryImportantValues.length <= 3) {
      // If 3 or fewer values, show them directly as results
      this.showResults(veryImportantValues);
      return;
    }

    this.showPhase('comparison-phase');
    this.currentPhase = new ComparisonPhase(veryImportantValues);
  }

  showResults(topThreeValues) {
    this.showPhase('results-phase');
    this.currentPhase = new ResultsPhase(topThreeValues);
  }

  showPhase(phaseId) {
    // Hide all phases
    document.querySelectorAll('.phase').forEach((phase) => {
      phase.classList.remove('active');
    });

    // Show target phase
    document.getElementById(phaseId).classList.add('active');
  }

  restart() {
    this.startRating();
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
