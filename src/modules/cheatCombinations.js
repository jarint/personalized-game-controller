// Cheat Combinations Handler - Tracks button click sequences for secret cheats
export const cheatCombinations = {
	sequences: [],
	activeSequence: null,
	resetTimer: null,
	RESET_TIMEOUT: 2000, // 2 seconds to complete sequence

	/**
	 * Register a new cheat combination
	 * @param {Array} sequence - Array of button IDs in order (e.g., ['camera', 'boxing', 'camera', 'boxing'])
	 * @param {Function} action - Function to execute when sequence is completed
	 * @param {string} name - Name of the cheat for debugging
	 */
	registerSequence(sequence, action, name = 'Unnamed Cheat') {
		this.sequences.push({
			sequence,
			action,
			name,
			progress: 0
		});
	},

	/**
	 * Register a click from a button overlay
	 * @param {string} buttonId - ID of the clicked button
	 */
	registerClick(buttonId) {
		// Check all sequences
		this.sequences.forEach(seq => {
			// Check if this click matches the next expected button
			if (seq.sequence[seq.progress] === buttonId) {
				seq.progress++;
				
				// If sequence completed, trigger action
				if (seq.progress === seq.sequence.length) {
					console.log(`Cheat activated: ${seq.name}`);
					seq.action();
					this.reset();
					return;
				}
			} else if (seq.sequence[0] === buttonId) {
				// Start over if first button clicked
				seq.progress = 1;
			} else {
				// Wrong button, reset this sequence
				seq.progress = 0;
			}
		});

		// Reset all sequences after timeout
		if (this.resetTimer) clearTimeout(this.resetTimer);
		this.resetTimer = setTimeout(() => this.reset(), this.RESET_TIMEOUT);
	},

	/**
	 * Reset all sequence progress
	 */
	reset() {
		this.sequences.forEach(seq => seq.progress = 0);
		if (this.resetTimer) {
			clearTimeout(this.resetTimer);
			this.resetTimer = null;
		}
	}
};

// Red screen effect for TV
export function showRedScreen(duration = 3000) {
	const tvScreen = document.getElementById('tv_screen');
	if (!tvScreen) return;

	// Create red overlay
	const redOverlay = document.createElement('div');
	redOverlay.className = 'red-screen-overlay';
	redOverlay.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: red;
		z-index: 9999;
		animation: redPulse 0.5s ease-in-out 3;
	`;

	// Add pulsing animation
	const style = document.createElement('style');
	style.textContent = `
		@keyframes redPulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.6; }
		}
	`;
	document.head.appendChild(style);

	tvScreen.appendChild(redOverlay);

	// Remove after duration
	setTimeout(() => {
		redOverlay.remove();
		style.remove();
	}, duration);
}

// Re-export effects from effects folder for convenience
export { showBlackHole } from './effects/blackHole.js';
export { showSketch } from './effects/sketch.js';
