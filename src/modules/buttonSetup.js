// Button Setup - Centralized button handler setup with hold-to-start functionality
import { gameManager } from './gameManager.js';
import { cheatCombinations } from './cheatCombinations.js';

/**
 * Setup a button with hold-to-start and action functionality
 * @param {string} selector - CSS selector for the button overlay
 * @param {string} gameName - Name of the game to start/control
 * @param {string} buttonId - ID for cheat combination tracking
 * @param {function} isDemoRunning - Function that returns if demo is running
 * @param {function} onAction - Optional callback when button is pressed while game is active
 */
export function setupButton(selector, gameName, buttonId, isDemoRunning, onAction = null) {
	const buttonOverlay = document.querySelector(selector);
	if (!buttonOverlay) return;

	let holdTimer = null;
	let isHolding = false;

	buttonOverlay.addEventListener("pointerdown", (e) => {
		if (isDemoRunning()) return;
		e.preventDefault();

		isHolding = false;

		// If game is already active, handle action
		if (gameManager.activeGame === gameName) {
			if (onAction) {
				onAction();
			} else {
				gameManager.handleAction(gameName);
			}
			gameManager.resetInactivityTimer();
			return;
		}

		// Start hold timer to start the game
		holdTimer = setTimeout(() => {
			isHolding = true;
			gameManager.startGame(gameName);
			holdTimer = null;
		}, gameManager.HOLD_DURATION);
	});

	const cancelHold = () => {
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
			
			// If released before hold completed, register as click for cheat combos
			if (!isHolding) {
				cheatCombinations.registerClick(buttonId);
			}
		}
		isHolding = false;
	};

	buttonOverlay.addEventListener("pointerup", cancelHold);
	buttonOverlay.addEventListener("pointerleave", cancelHold);
	buttonOverlay.addEventListener("pointercancel", cancelHold);
}

/**
 * Setup a toggle button (hold to start, hold again to stop)
 * @param {string} selector - CSS selector for the button overlay
 * @param {string} gameName - Name of the game to toggle
 * @param {string} buttonId - ID for cheat combination tracking
 * @param {function} isDemoRunning - Function that returns if demo is running
 */
export function setupToggleButton(selector, gameName, buttonId, isDemoRunning) {
	const buttonOverlay = document.querySelector(selector);
	if (!buttonOverlay) return;

	let holdTimer = null;
	let isHolding = false;

	buttonOverlay.addEventListener("pointerdown", (e) => {
		if (isDemoRunning()) return;
		e.preventDefault();

		isHolding = false;

		// Start hold timer (toggles game on/off)
		holdTimer = setTimeout(() => {
			isHolding = true;
			if (gameManager.activeGame === gameName) {
				gameManager.closeCurrentGame();
			} else {
				gameManager.startGame(gameName);
			}
			holdTimer = null;
		}, gameManager.HOLD_DURATION);
	});

	const cancelHold = () => {
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
			
			// If released before hold completed, register as click for cheat combos
			if (!isHolding) {
				cheatCombinations.registerClick(buttonId);
			}
		}
		isHolding = false;
	};

	buttonOverlay.addEventListener("pointerup", cancelHold);
	buttonOverlay.addEventListener("pointerleave", cancelHold);
	buttonOverlay.addEventListener("pointercancel", cancelHold);
}
