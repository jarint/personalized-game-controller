// Button Setup - Centralized button handler setup with hold-to-start functionality
import { gameManager } from './gameManager.js';

/**
 * Setup a button with hold-to-start and action functionality
 * @param {string} selector - CSS selector for the button overlay
 * @param {string} gameName - Name of the game to start/control
 * @param {function} isDemoRunning - Function that returns if demo is running
 * @param {function} onAction - Optional callback when button is pressed while game is active
 */
export function setupButton(selector, gameName, isDemoRunning, onAction = null) {
	const buttonOverlay = document.querySelector(selector);
	if (!buttonOverlay) return;

	let holdTimer = null;

	buttonOverlay.addEventListener("pointerdown", (e) => {
		if (isDemoRunning()) return;
		e.preventDefault();

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
			gameManager.startGame(gameName);
			holdTimer = null;
		}, gameManager.HOLD_DURATION);
	});

	const cancelHold = () => {
		if (holdTimer) {
			clearTimeout(holdTimer);
			holdTimer = null;
		}
	};

	buttonOverlay.addEventListener("pointerup", cancelHold);
	buttonOverlay.addEventListener("pointerleave", cancelHold);
	buttonOverlay.addEventListener("pointercancel", cancelHold);
}

/**
 * Setup a toggle button (hold to start, hold again to stop)
 * @param {string} selector - CSS selector for the button overlay
 * @param {string} gameName - Name of the game to toggle
 * @param {function} isDemoRunning - Function that returns if demo is running
 */
export function setupToggleButton(selector, gameName, isDemoRunning) {
	const buttonOverlay = document.querySelector(selector);
	if (!buttonOverlay) return;

	let holdTimer = null;

	buttonOverlay.addEventListener("pointerdown", (e) => {
		if (isDemoRunning()) return;
		e.preventDefault();

		// Start hold timer (toggles game on/off)
		holdTimer = setTimeout(() => {
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
		}
	};

	buttonOverlay.addEventListener("pointerup", cancelHold);
	buttonOverlay.addEventListener("pointerleave", cancelHold);
	buttonOverlay.addEventListener("pointercancel", cancelHold);
}
