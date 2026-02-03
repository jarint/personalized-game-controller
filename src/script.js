// Main entry point - imports and initializes all modules
import { gameManager } from './modules/gameManager.js';
import { dnaHelix } from './modules/dnaHelix.js';
import { bb8Handler } from './modules/bb8Handler.js';
import { soccerHandler } from './modules/soccerHandler.js';
import { boxingGame } from './modules/boxingGame.js';
import { cameraHandler } from './modules/cameraHandler.js';
import { setupButton, setupToggleButton } from './modules/buttonSetup.js';
import { konamiCode } from './modules/konami.js';
import { cheatCombinations, showRedScreen, showBlackHole } from './modules/cheatCombinations.js';

document.addEventListener('DOMContentLoaded', () => {
	const svg = document.getElementById('pad');
	const demo = document.getElementById('demo');

	const ids = ['x', 'o', 'square']; // make only the four action buttons clickable
	const pressed = new Set();

	let demoRunning = false;

	// Helper to get button elements
	function get(id) {
		return svg.querySelector('#' + id) || svg.querySelector('#' + id + ' *');
	}

	// Make buttons interactive
	for (const id of ids) {
		const el = get(id);
		if (el) el.classList.add('interactive');
	}

	// Button press/release handlers
	function press(el) {
		el.classList.add('pressed');
		pressed.add(el);
		konamiCode.register(el.id);
	}

	function release(el) {
		el.classList.remove('pressed');
		pressed.delete(el);
	}

	function clear() {
		for (const b of pressed) release(b);
	}

	// Initialize all game handlers
	dnaHelix.init();
	bb8Handler.init();
	soccerHandler.init();
	boxingGame.init();

	// Register games with game manager
	gameManager.registerGame('dna', dnaHelix);
	gameManager.registerGame('bb8', bb8Handler);
	gameManager.registerGame('soccer', soccerHandler);
	gameManager.registerGame('boxing', boxingGame);

	// Register cheat combinations
	// Camera -> Boxing -> Camera -> Boxing = Black Hole Visualization
	cheatCombinations.registerSequence(
		['camera', 'boxing', 'camera', 'boxing'],
		() => showBlackHole(0), // 0 = click to dismiss, or set duration in ms
		'Black Hole Cheat'
	);

	// Add more cheat combinations here as needed
	// Example: cheatCombinations.registerSequence(['soccer', 'bb8', 'soccer'], () => { /* your action */ }, 'My Cheat');

	// Setup camera handler (Triangle button - DNA helix)
	cameraHandler.setup(() => demoRunning);

	// Setup all button handlers using centralized button setup
	// O Button - Soccer Game
	setupButton(
		"#football_o_button .football-icon",
		'soccer',
		'soccer',
		() => demoRunning,
		() => {
			if (soccerHandler.state === 1) {
				soccerHandler.kick();
			}
		}
	);

	// X Button - Boxing Game
	setupButton(
		"#boxing_x_button .boxing-icon",
		'boxing',
		'boxing',
		() => demoRunning
	);

	// Square Button - BB-8 Animation (toggle on/off)
	setupToggleButton(
		"#theme_square_button .theme-icon",
		'bb8',
		'bb8',
		() => demoRunning
	);

	// Triangle Button - Camera (DNA) - needs special handling for click tracking
	const cameraOverlay = document.querySelector("#triangle_camera .camera");
	if (cameraOverlay) {
		let holdTimer = null;
		let isHolding = false;

		cameraOverlay.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();

			isHolding = false;

			// If DNA already active: just flash + reset timer
			if (gameManager.activeGame === "dna") {
				gameManager.resetInactivityTimer();
				// Trigger flash if available
				cameraOverlay.classList.remove("is_flashing");
				void cameraOverlay.offsetWidth;
				cameraOverlay.classList.add("is_flashing");
				return;
			}

			// Start hold timer (2s)
			holdTimer = setTimeout(() => {
				isHolding = true;
				gameManager.startGame("dna");
				holdTimer = null;
				// Trigger flash
				cameraOverlay.classList.remove("is_flashing");
				void cameraOverlay.offsetWidth;
				cameraOverlay.classList.add("is_flashing");
			}, gameManager.HOLD_DURATION);
		});

		const cancelCameraHold = () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
				
				// Flash on short click
				cameraOverlay.classList.remove("is_flashing");
				void cameraOverlay.offsetWidth;
				cameraOverlay.classList.add("is_flashing");

				// If released before hold completed, register as click for cheat combos
				if (!isHolding) {
					cheatCombinations.registerClick('camera');
				}
			}
			isHolding = false;
		};

		cameraOverlay.addEventListener("pointerup", cancelCameraHold);
		cameraOverlay.addEventListener("pointerleave", cancelCameraHold);
		cameraOverlay.addEventListener("pointercancel", cancelCameraHold);
	}

	// Controller button event listeners
	svg.addEventListener('pointerdown', e => {
		if (demoRunning) return;
		const t = document.elementFromPoint(e.clientX, e.clientY);
		if (!t) return;
		const btn = t.closest('.interactive');
		if (!btn) return;
		press(btn);
	});

	svg.addEventListener('pointerup', clear);
	svg.addEventListener('pointercancel', clear);

	// Demo mode - runs through konami code
	demo.onclick = async () => {
		if (demoRunning || konamiCode.isActive) return;
		demoRunning = true;
		konamiCode.reset();

		for (const id of konamiCode.sequence) {
			const el = get(id);
			if (!el) continue;
			press(el);
			await new Promise(r => setTimeout(r, 240));
			release(el);
			await new Promise(r => setTimeout(r, 120));
		}

		demoRunning = false;
	};
});
