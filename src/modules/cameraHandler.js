// Camera Handler - Triangle button DNA helix visualization
import { gameManager } from './gameManager.js';

export const cameraHandler = {
	camera: null,
	holdTimer: null,

	setup(demoRunning) {
		this.camera = 
			document.querySelector("#triangle_camera .camera") ||
			document.querySelector("#triangle_camera > .camera");
		
		if (!this.camera) return;

		// play the flash animation reliably
		const triggerFlash = () => {
			this.camera.classList.remove("is_flashing");
			void this.camera.offsetWidth; // restart animation
			this.camera.classList.add("is_flashing");
		};

		this.camera.addEventListener("pointerdown", (e) => {
			if (demoRunning()) return;
			e.preventDefault();

			// If DNA already active: just flash + reset timer
			if (gameManager.activeGame === "dna") {
				gameManager.resetInactivityTimer();
				triggerFlash();
				return;
			}

			// Start hold timer (2s)
			this.holdTimer = setTimeout(() => {
				gameManager.startGame("dna");
				this.holdTimer = null;
				triggerFlash(); // flash on successful start
			}, gameManager.HOLD_DURATION);
		});

		// If released early: cancel start but still flash
		const cancelHold = () => {
			if (this.holdTimer) {
				clearTimeout(this.holdTimer);
				this.holdTimer = null;
				triggerFlash(); // flash on short click
			}
		};

		this.camera.addEventListener("pointerup", cancelHold);
		this.camera.addEventListener("pointerleave", cancelHold);
		this.camera.addEventListener("pointercancel", cancelHold);

		// remove class after animation ends
		const light =
			this.camera.querySelector(".light") ||
			document.querySelector("#triangle_camera .light");

		if (light) {
			light.addEventListener("animationend", (e) => {
				if (e.animationName === "flash") this.camera.classList.remove("is_flashing");
			});
		}
	}
};
