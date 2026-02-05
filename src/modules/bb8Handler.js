// BB-8 TV Animation - Interactive BB-8 droid that follows mouse/touch
import { gameManager } from './gameManager.js';

export const bb8Handler = {
	tvScreen: null,
	root: null,
	raf: null,

	// state
	dW: 140,
	dPos: 0,
	dSpeed: 1,
	dMinSpeed: 1,
	dMaxSpeed: 4,
	dAccel: 1.04,
	dRot: 0,
	mPos: 0,
	slowOffset: 120,
	movingRight: false,

	// cached nodes
	elBB8: null,
	elBall: null,
	elAntennas: null,
	elEyes: null,
	elMsg: null,

	_onPointerMove: null,
	_onResize: null,

	init() {
		this.tvScreen = document.getElementById("tv_screen");
	},

	start() {
		if (!this.tvScreen || this.root) return; // already running

		// Create root container inside TV
		this.root = document.createElement("div");
		this.root.className = "bb8_root";
		this.tvScreen.appendChild(this.root);

		// Make TV behave like a "scene" container
		this.tvScreen.style.background = "none";
		this.tvScreen.style.backgroundColor = "transparent";
		this.tvScreen.style.position = "relative";

		// Force bb8_root to fully cover the TV (even if CSS didn't compile)
		Object.assign(this.root.style, {
			position: "absolute",
			inset: "0",
			overflow: "hidden",
			background: "#869F9D",
			zIndex: "50"
		});

		// Inject HTML
		this.root.innerHTML = `
			<div class="message">
				<h2>move mouse or tap.</h2>
			</div>
			<div class="sand"></div>
			<div class="bb8">
				<div class="antennas">
					<div class="antenna short"></div>
					<div class="antenna long"></div>
				</div>
				<div class="head">
					<div class="stripe one"></div>
					<div class="stripe two"></div>
					<div class="eyes">
						<div class="eye one"></div>
						<div class="eye two"></div>
					</div>
					<div class="stripe three"></div>
				</div>
				<div class="ball">
					<div class="lines one"></div>
					<div class="lines two"></div>
					<div class="ring one"></div>
					<div class="ring two"></div>
					<div class="ring three"></div>
				</div>
				<div class="shadow"></div>
			</div>
		`;

		// Cache nodes (scoped to this.root so it won't touch your page)
		this.elBB8 = this.root.querySelector(".bb8");
		this.elBall = this.root.querySelector(".ball");
		this.elAntennas = this.root.querySelector(".antennas");
		this.elEyes = this.root.querySelector(".eyes");
		this.elMsg = this.root.querySelector("h2");

		// Initial sizing/positions based on TV, not window
		const measure = () => {
			const rect = this.tvScreen.getBoundingClientRect();
			const bb8Rect = this.elBB8.getBoundingClientRect();

			// approximate width (CSS sets it, but measuring is safest)
			this.dW = bb8Rect.width || 140;
			// start near left, and mouse target near right-ish
			this.mPos = rect.width - rect.width / 5;

			// keep dPos in bounds
			this.dPos = Math.max(0, Math.min(this.dPos, rect.width));
		};

		measure();
		// Start BB-8 visibly inside the TV instead of half off-screen
		const rect = this.tvScreen.getBoundingClientRect();
		this.dPos = Math.max(this.dW / 2, rect.width * 0.2);

		this._onResize = () => measure();
		window.addEventListener("resize", this._onResize);

		// Pointer move inside the TV
		this._onPointerMove = (e) => {
			if (this.elMsg) this.elMsg.classList.add("hide");
			const rect = this.tvScreen.getBoundingClientRect();
		
			const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
			this.mPos = clientX - rect.left;
		
			// clamp mouse position inside TV
			this.mPos = Math.max(0, Math.min(this.mPos, rect.width));
		
			// keep inactivity timer alive while interacting with BB-8
			gameManager.resetInactivityTimer();
		};

		// Use pointer events if possible
		this.tvScreen.addEventListener("pointermove", this._onPointerMove, { passive: true });
		this.tvScreen.addEventListener("touchmove", this._onPointerMove, { passive: true });

		// Animate
		const tick = () => {
			if (!this.root) return;
		
			const rect = this.tvScreen.getBoundingClientRect();
		
			// If we can't measure yet (first frame / hidden), try again next frame
			if (!rect.width || !rect.height) {
				this.raf = requestAnimationFrame(tick);
				return;
			}
		
			// Defensive: if dW wasn't measured properly, default to 140
			if (!this.dW || this.dW <= 0) this.dW = 140;
		
			const halfW = this.dW / 2;
			const minX = halfW;
			const maxX = rect.width - halfW;
		
			// ---- Movement logic (ported from jQuery version) ----
			if (this.mPos > this.dPos + halfW / 2) {
				// moving right
				if (!this.movingRight) {
					this.movingRight = true;
					this.elAntennas?.classList.add("right");
					this.elEyes?.classList.add("right");
				}
		
				const dist = this.mPos - this.dPos;
				if (dist > this.slowOffset) {
					if (this.dSpeed < this.dMaxSpeed) this.dSpeed *= this.dAccel;
				} else {
					if (this.dSpeed > this.dMinSpeed) this.dSpeed /= this.dAccel;
				}
		
				this.dPos += this.dSpeed;
				this.dRot += this.dSpeed;
		
				// optional: counts as interaction
				gameManager.resetInactivityTimer();
		
			} else if (this.mPos < this.dPos - halfW / 2) {
				// moving left
				if (this.movingRight) {
					this.movingRight = false;
					this.elAntennas?.classList.remove("right");
					this.elEyes?.classList.remove("right");
				}
		
				const dist = this.dPos - this.mPos;
				if (dist > this.slowOffset) {
					if (this.dSpeed < this.dMaxSpeed) this.dSpeed *= this.dAccel;
				} else {
					if (this.dSpeed > this.dMinSpeed) this.dSpeed /= this.dAccel;
				}
		
				this.dPos -= this.dSpeed;
				this.dRot -= this.dSpeed;
		
				// optional: counts as interaction
				gameManager.resetInactivityTimer();
			}
		
			// ---- Clamp BB-8 inside TV ----
			this.dPos = Math.max(minX, Math.min(this.dPos, maxX));
		
			// ---- Apply styles ----
			if (this.elBB8) {
				this.elBB8.style.left = `${this.dPos}px`;
				this.elBB8.style.transform = "translateX(-50%)";
			}
		
			if (this.elBall) {
				this.elBall.style.transform = `rotate(${this.dRot}deg)`;
			}
		
			// Next frame
			this.raf = requestAnimationFrame(tick);
		};

		tick();
	},

	cleanup() {
		this.tvScreen.style.background = "";
		this.tvScreen.style.backgroundColor = "#777";

		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = null;

		if (this._onResize) {
			window.removeEventListener("resize", this._onResize);
			this._onResize = null;
		}

		if (this._onPointerMove) {
			this.tvScreen.removeEventListener("pointermove", this._onPointerMove);
			this.tvScreen.removeEventListener("touchmove", this._onPointerMove);
			this._onPointerMove = null;
		}

		if (this.root) {
			this.root.remove();
			this.root = null;
		}

		// reset refs
		this.elBB8 = this.elBall = this.elAntennas = this.elEyes = this.elMsg = null;
	}
};
