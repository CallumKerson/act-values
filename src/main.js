import { RatingPhase } from './components/rating.js';
import { ComparisonPhase } from './components/comparison.js';
import { ResultsPhase } from './components/results.js';
import { StorageManager } from './utils/storage.js';

class App {
  constructor() {
    this.currentPhase = null;
    this.init();
  }

  init() {
    // Make app globally accessible for phase transitions
    window.app = this;
    
    // Setup UI event handlers
    this.setupEventHandlers();
    
    // Check for saved state and show appropriate UI
    this.checkForSavedState();
  }

  setupEventHandlers() {
    document.getElementById('resume-btn')?.addEventListener('click', () => this.resumeAssessment());
    document.getElementById('start-fresh-btn')?.addEventListener('click', () => this.startFresh());
    document.getElementById('reset-btn')?.addEventListener('click', () => this.showResetConfirmation());
  }

  checkForSavedState() {
    const savedState = StorageManager.loadState();
    
    if (savedState) {
      // Show resume options
      document.getElementById('resume-notice')?.classList.remove('hidden');
      document.getElementById('reset-btn')?.classList.remove('hidden');
      
      // Hide main phases until user chooses
      document.querySelectorAll('.phase').forEach(phase => {
        phase.classList.remove('active');
      });
    } else {
      // Start fresh assessment
      this.startRating();
    }
  }

  resumeAssessment() {
    const savedState = StorageManager.loadState();
    if (!savedState) {
      this.startRating();
      return;
    }

    // Hide resume notice
    document.getElementById('resume-notice')?.classList.add('hidden');
    document.getElementById('reset-btn')?.classList.remove('hidden');

    if (savedState.phase === 'rating') {
      this.showPhase('rating-phase');
      this.currentPhase = new RatingPhase(savedState);
    } else if (savedState.phase === 'comparison') {
      this.showPhase('comparison-phase');
      this.currentPhase = new ComparisonPhase(null, savedState);
    }
  }

  startFresh() {
    StorageManager.clearState();
    this.hideResumeUI();
    this.startRating();
  }

  hideResumeUI() {
    document.getElementById('resume-notice')?.classList.add('hidden');
    document.getElementById('reset-btn')?.classList.add('hidden');
  }

  showResetConfirmation() {
    const confirmed = confirm(
      'Are you sure you want to reset your assessment? This will permanently delete your current progress.'
    );
    
    if (confirmed) {
      StorageManager.clearState();
      this.hideResumeUI();
      this.startRating();
    }
  }

  startRating() {
    this.showPhase('rating-phase');
    this.currentPhase = new RatingPhase();
    document.getElementById('reset-btn')?.classList.remove('hidden');
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

    // Show warning for excessive comparisons
    if (veryImportantValues.length > 15) {
      const comparisons = Math.round((veryImportantValues.length * (veryImportantValues.length - 1)) / 2);
      const confirmed = confirm(
        `You selected ${veryImportantValues.length} very important values, which means ${comparisons} comparisons ahead. This will take a very long time.\n\nWould you like to continue anyway, or go back to reconsider your choices?`
      );
      if (!confirmed) {
        return; // Stay on rating phase
      }
    } else if (veryImportantValues.length > 10) {
      const comparisons = Math.round((veryImportantValues.length * (veryImportantValues.length - 1)) / 2);
      const confirmed = confirm(
        `You selected ${veryImportantValues.length} very important values (${comparisons} comparisons). For the best experience, we recommend 8-10 values.\n\nContinue with comparisons or go back to refine your choices?`
      );
      if (!confirmed) {
        return; // Stay on rating phase
      }
    }

    this.showPhase('comparison-phase');
    this.currentPhase = new ComparisonPhase(veryImportantValues);
  }

  showResults(topThreeValues) {
    // Clear saved state when showing results
    StorageManager.clearState();
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
