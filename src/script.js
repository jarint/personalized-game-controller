document.addEventListener('DOMContentLoaded',()=>{

	const svg = document.getElementById('pad')
	const demo = document.getElementById('demo')

	//const ids = ['up','down','left','right','x','o','square','triangle','start','select','lb','rb']
	const ids = ['x','o','square'] // make only the four acction buttons clickable
	const pressed = new Set()

	function get(id){
		return svg.querySelector('#'+id) || svg.querySelector('#'+id+' *')
	}

	for(const id of ids){
		const el = get(id)
		if(el) el.classList.add('interactive')
	}

	function press(el){
		el.classList.add('pressed')
		pressed.add(el)
		register(el.id)
	}

	function release(el){
		el.classList.remove('pressed')
		pressed.delete(el)
	}

	const cameraHandler = {
		setup() {
			const camera =
			document.querySelector("#triangle_camera .camera") ||
			document.querySelector("#triangle_camera > .camera");
			if (!camera) return;

			let holdTimer = null;

			// play the flash animation reliably
			const triggerFlash = () => {
			camera.classList.remove("is_flashing");
			void camera.offsetWidth; // restart animation
			camera.classList.add("is_flashing");
			};

			camera.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();

			// If DNA already active: just flash + reset timer
			if (gameManager.activeGame === "dna") {
				gameManager.resetInactivityTimer();
				triggerFlash();
				return;
			}

			// Start hold timer (2s)
			holdTimer = setTimeout(() => {
				gameManager.startGame("dna");
				holdTimer = null;
				triggerFlash(); // flash on successful start
			}, gameManager.HOLD_DURATION);
			});

			// If released early: cancel start but still flash
			const cancelHold = () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
				triggerFlash(); // flash on short click
			}
			};

			camera.addEventListener("pointerup", cancelHold);
			camera.addEventListener("pointerleave", cancelHold);
			camera.addEventListener("pointercancel", cancelHold);

			// remove class after animation ends (listen on the light if present)
			const light =
			camera.querySelector(".light") ||
			document.querySelector("#triangle_camera .light");

			if (light) {
			light.addEventListener("animationend", (e) => {
				if (e.animationName === "flash") camera.classList.remove("is_flashing");
			});
			}
		},
	};


	// O Button Handler (Soccer Game)
	const soccerHandler = {
		tvScreen: document.getElementById('tv_screen'),
		ball: null,
		goalPost: null,
		state: 0,
		intervals: { goalPost: null, ball: null },

		start() {
			// Setup soccer field
			this.tvScreen.style.background = "linear-gradient(90deg, #2d5016 0%, #2d5016 10%, #3d7021 10%, #3d7021 20%, #2d5016 20%, #2d5016 30%, #3d7021 30%, #3d7021 40%, #2d5016 40%, #2d5016 50%, #3d7021 50%, #3d7021 60%, #2d5016 60%, #2d5016 70%, #3d7021 70%, #3d7021 80%, #2d5016 80%, #2d5016 90%, #3d7021 90%, #3d7021 100%)";

			// Create ball
			this.ball = document.createElement('div');
			this.ball.className = 'soccer';
			this.tvScreen.appendChild(this.ball);

			// Create goalpost
			this.goalPost = document.createElement('div');
			this.goalPost.className = 'goalpost';
			this.tvScreen.appendChild(this.goalPost);

			// Animate goalpost
			let top = 0, direction = 1;
			this.intervals.goalPost = setInterval(() => {
				top += direction * 3;
				const maxTop = 100 - (100 / this.tvScreen.offsetHeight * 100);
				if (top >= maxTop || top <= 0) direction *= -1;
				this.goalPost.style.top = top + '%';
			}, 30);

			this.state = 1;
		},

		kick() {
			let left = 0, rotation = 0;
			const width = this.tvScreen.offsetWidth;

			this.intervals.ball = setInterval(() => {
				left += 50;
				rotation += 10;
				this.ball.style.left = left + 'px';
				this.ball.style.transform = `translateY(-50%) rotate(${rotation}deg)`;

				if (this.checkCollision()) {
					this.goal();
					return;
				}

				if (left >= width + 60) {
					this.miss();
				}
			}, 30);

			this.state = 2;
		},

		checkCollision() {
			const ballRect = this.ball.getBoundingClientRect();
			const goalRect = this.goalPost.getBoundingClientRect();
			const ballCenterX = ballRect.left + ballRect.width / 2;
			const ballCenterY = ballRect.top + ballRect.height / 2;

			return ballCenterX >= goalRect.left && ballCenterX <= goalRect.right && 
			       ballCenterY >= goalRect.top && ballCenterY <= goalRect.bottom;
		},

		goal() {
			this.clearIntervals();
			const msg = this.createMessage('GOAL!', 'goal-message');
			document.getElementById('tv_monitor').classList.add('shake');
			this.createConfetti();
			setTimeout(() => {
				msg.remove();
				document.getElementById('tv_monitor').classList.remove('shake');
			}, 2000);
			this.reset();
		},

		miss() {
			this.clearIntervals();
			const msg = this.createMessage('MISS!', 'miss-message');
			setTimeout(() => msg.remove(), 2000);
			this.reset();
		},

		createMessage(text, className) {
			const msg = document.createElement('div');
			msg.className = className;
			msg.textContent = text;
			this.tvScreen.appendChild(msg);
			return msg;
		},

		createConfetti() {
			const colors = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#00f'];
			for (let i = 0; i < 50; i++) {
				const confetti = document.createElement('div');
				confetti.className = 'confetti';
				confetti.style.left = Math.random() * 100 + '%';
				confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
				this.tvScreen.appendChild(confetti);
				setTimeout(() => confetti.remove(), 2000);
			}
		},

		clearIntervals() {
			if (this.intervals.ball) clearInterval(this.intervals.ball);
			if (this.intervals.goalPost) clearInterval(this.intervals.goalPost);
		},

		reset() {
			setTimeout(() => {
				if (this.ball) this.ball.remove();
				if (this.goalPost) this.goalPost.remove();
				this.ball = null;
				this.goalPost = null;
				this.state = 0;
				this.tvScreen.style.background = '';
				this.tvScreen.style.backgroundColor = '#777';
			}, 2000);
		},

		handle() {
			if (this.state === 0) this.start();
			else if (this.state === 1) this.kick();
		}
	};

	// ===============================
	// BB-8 TV MODULE (converted to vanilla JS)
	// ===============================
	const bb8Handler = {
		tvScreen: document.getElementById("tv_screen"),
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

	
		// Inject HTML (your CodePen HTML)
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
		},
	};



	// =================================================================
	// GAME MANAGER - Handles hold-to-start, exclusive games, timeout
	// =================================================================
	const gameManager = {
		activeGame: null,  // null, 'boxing', or 'soccer'
		inactivityTimer: null,
		holdTimer: null,
		HOLD_DURATION: 2000,  // 2 seconds to start a game
		INACTIVITY_TIMEOUT: 10000,  // 10 seconds of no interaction

		resetInactivityTimer() {
			if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
			if (this.activeGame) {
				this.inactivityTimer = setTimeout(() => {
					this.closeCurrentGame();
				}, this.INACTIVITY_TIMEOUT);
			}
		},

		closeCurrentGame() {
			if (this.activeGame === 'boxing') {
				boxingGame.cleanup();
			} else if (this.activeGame === 'soccer') {
				soccerHandler.cleanup();
			} else if (this.activeGame === 'dna') {
			  dnaHelix.cleanup();
			} else if (this.activeGame === 'bb8') {
				bb8Handler.cleanup();
		  	}
			this.activeGame = null;
			if (this.inactivityTimer) {
				clearTimeout(this.inactivityTimer);
				this.inactivityTimer = null;
			}
		},

		startGame(game) {
			// Close current game if different
			if (this.activeGame && this.activeGame !== game) {
				this.closeCurrentGame();
			}

			if (this.activeGame === game) return; // Already active

			this.activeGame = game;
			if (game === 'boxing') {
				boxingGame.start();
			} else if (game === 'soccer') {
				soccerHandler.start();
			} else if (game === 'dna') {
			  dnaHelix.start();
			} else if (game === 'bb8') {
				bb8Handler.start();
			}
			this.resetInactivityTimer();
		},

		handleAction(game) {
			if (this.activeGame !== game) return;

			this.resetInactivityTimer();
			if (game === 'boxing') {
				boxingGame.punch();
			} else if (game === 'soccer') {
				soccerHandler.kick();
			}
		}
	};

	// Initialize handlers
	cameraHandler.setup();

	// Boxing Game
	const boxingGame = {
		tvScreen: document.getElementById('tv_screen'),
		anim: null,
		isHitting: false,
		nextPunchLeft: true,
		container: null,

		start() {
			// Create the animation container
			this.container = document.createElement('div');
			this.container.id = 'bm_animation';

			const clickR = document.createElement('div');
			clickR.id = 'click_r';
			const clickL = document.createElement('div');
			clickL.id = 'click_l';

			this.container.appendChild(clickR);
			this.container.appendChild(clickL);
			this.tvScreen.appendChild(this.container);

			// Initialize Lottie animation
			const animData = {
				container: this.container,
				renderer: 'svg',
				loop: true,
				prerender: false,
				autoplay: true,
				autoloadSegments: false,
				path: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/51676/fight.json'
			};

			this.anim = bodymovin.loadAnimation(animData);
			this.anim.addEventListener('DOMLoaded', () => {
				this.anim.playSegments([[0,65],[65,75]], true);
			});
		},

		punch() {
			if (!this.anim || this.isHitting) return;

			this.isHitting = true;

			if (this.nextPunchLeft) {
				this.anim.playSegments([[95,115],[65,75]], true);
			} else {
				this.anim.playSegments([[75,95],[65,75]], true);
			}

			this.nextPunchLeft = !this.nextPunchLeft;

			const self = this;
			this.anim.addEventListener('loopComplete', function hitComplete() {
				self.isHitting = false;
				self.anim.removeEventListener('loopComplete', hitComplete);
			});
		},

		cleanup() {
			if (this.anim) {
				this.anim.destroy();
				this.anim = null;
			}
			if (this.container) {
				this.container.remove();
				this.container = null;
			}
			this.isHitting = false;
			this.nextPunchLeft = true;
		}
	};

	// Modify soccerHandler to add cleanup
	soccerHandler.cleanup = function() {
		this.clearIntervals();
		if (this.ball) this.ball.remove();
		if (this.goalPost) this.goalPost.remove();
		// Remove any messages
		const msgs = this.tvScreen.querySelectorAll('.goal-message, .miss-message');
		msgs.forEach(m => m.remove());
		// Remove confetti
		const confetti = this.tvScreen.querySelectorAll('.confetti');
		confetti.forEach(c => c.remove());
		this.ball = null;
		this.goalPost = null;
		this.state = 0;
		this.tvScreen.style.background = '';
		this.tvScreen.style.backgroundColor = '#777';
	};

	// Override soccerHandler.reset to work with game manager
	soccerHandler.reset = function() {
		setTimeout(() => {
			if (gameManager.activeGame !== 'soccer') return;
			if (this.ball) this.ball.remove();
			if (this.goalPost) this.goalPost.remove();
			this.ball = null;
			this.goalPost = null;
			this.state = 0;
			// Restart the game for another kick
			this.start();
		}, 2000);
	};

	// Setup football overlay with hold-to-start
	const footballOverlay = document.querySelector("#football_o_button .football-icon");
	if (footballOverlay) {
		let holdTimer = null;

		footballOverlay.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();

			// If soccer is already active, handle kick
			if (gameManager.activeGame === 'soccer') {
				if (soccerHandler.state === 1) {
					soccerHandler.kick();
					gameManager.resetInactivityTimer();
				}
				return;
			}

			// Start hold timer
			holdTimer = setTimeout(() => {
				gameManager.startGame('soccer');
				holdTimer = null;
			}, gameManager.HOLD_DURATION);
		});

		footballOverlay.addEventListener("pointerup", () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
			}
		});

		footballOverlay.addEventListener("pointerleave", () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
			}
		});
	}

	// Setup boxing overlay with hold-to-start
	const boxingOverlay = document.querySelector("#boxing_x_button .boxing-icon");
	if (boxingOverlay) {
		let holdTimer = null;

		boxingOverlay.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();

			// If boxing is already active, handle punch
			if (gameManager.activeGame === 'boxing') {
				boxingGame.punch();
				gameManager.resetInactivityTimer();
				return;
			}

			// Start hold timer
			holdTimer = setTimeout(() => {
				gameManager.startGame('boxing');
				holdTimer = null;
			}, gameManager.HOLD_DURATION);
		});

		boxingOverlay.addEventListener("pointerup", () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
			}
		});

		boxingOverlay.addEventListener("pointerleave", () => {
			if (holdTimer) {
				clearTimeout(holdTimer);
				holdTimer = null;
			}
		});
	}



	// INTERACTIVE DNA HELIX ANIMATION
	const dnaHelix = {
		tvScreen: document.getElementById("tv_screen"),
		canvas: null,
		scene: null,
		raf: null,

		resizeCanvasToTv() {
			if (!this.canvas || !this.tvScreen) return;
					
			const rect = this.tvScreen.getBoundingClientRect();
					
			// Set the canvas *buffer* size (real pixels)
			this.canvas.width = Math.floor(rect.width);
			this.canvas.height = Math.floor(rect.height);

					
			// Tell Zdog about size change if scene exists
			if (this.scene) {
				this.scene.setSize(this.canvas.width, this.canvas.height);
			}
		},
		start() {
			if (!this.tvScreen) return;
			if (this.scene) return; // already running

			// Create canvas dynamically (like soccer/boxing)
			this.canvas = document.createElement("canvas");
			this.canvas.className = "dna_canvas";
			this.tvScreen.appendChild(this.canvas);


			// IMPORTANT: make canvas buffer match tv_screen
			this.resizeCanvasToTv();

			// keep updated on resize
			this._on_resize = () => this.resizeCanvasToTv();
			window.addEventListener("resize", this._on_resize);

			const { Illustration, TAU, Shape } = window.Zdog;

			// IMPORTANT: do NOT use fullscreen
			this.scene = new Illustration({
				element: this.canvas,
				dragRotate: true,
				resize: false, // resize to canvas element
			});

			// --- your existing DNA setup below ---
			const MARGIN = 15;
			const SPAN = 40;
			const STRAND_STROKE = 4;
			const BALL_PADDING = 5;
			const BALL_DIAMETER = 10;
			const STRANDS = 23;
			const STRAND = "silver";
			const COLORS = [
			"rgb(252, 254, 248)",
			"rgb(251, 164, 82)",
			"rgb(37, 175, 186)",
			"rgb(225, 7, 130)",
			];
			const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
			const YSTART = -((STRANDS - 1) * MARGIN) / 2;

			const Strand = new Shape({
			stroke: STRAND_STROKE,
			color: STRAND,
			path: [{ x: -SPAN }, { x: SPAN }],
			});

			const Ball = new Shape({
			stroke: BALL_DIAMETER * 2,
			translate: { x: -(BALL_DIAMETER + SPAN + BALL_PADDING) },
			});

			new Array(STRANDS).fill().forEach((_, i) => {
			const strand = Strand.copy({
				addTo: this.scene,
				rotate: { y: (TAU / STRANDS) * i },
				translate: { y: YSTART + i * MARGIN },
			});

			Ball.copy({ addTo: strand, color: randomColor() });
			Ball.copy({
				addTo: strand,
				color: randomColor(),
				translate: { x: BALL_DIAMETER + SPAN + BALL_PADDING },
			});
			});

			const tick = () => {
			if (!this.scene) return;
			this.scene.rotate.y -= 0.03;
			this.scene.updateRenderGraph();
			this.raf = requestAnimationFrame(tick);
			};
			tick();
		},

		cleanup() {
			if (this.raf) cancelAnimationFrame(this.raf);
			this.raf = null;

			this.scene = null;

			if (this.canvas) {
				this.canvas.remove(); // IMPORTANT: remove from tvScreen like others do
				this.canvas = null;
			}

			if (this._on_resize) {
			  window.removeEventListener("resize", this._on_resize);
			  this._on_resize = null;
			}
		},
	};



	//Paula Button Functionality 
	// Theme button: HOLD 2s to start BB-8, HOLD 2s again to stop BB-8
	const themeOverlay = document.querySelector("#theme_square_button .theme-icon");
	if (themeOverlay) {
	let holdTimer = null;

	themeOverlay.addEventListener("pointerdown", (e) => {
		if (demoRunning) return;
		e.preventDefault();

		// If BB-8 is already active: start a hold-to-close
		holdTimer = setTimeout(() => {
		if (gameManager.activeGame === "bb8") {
			gameManager.closeCurrentGame();
		} else {
			gameManager.startGame("bb8");
		}
		holdTimer = null;
		}, gameManager.HOLD_DURATION); // 2000ms
	});

	const cancelHold = () => {
		if (holdTimer) {
		clearTimeout(holdTimer);
		holdTimer = null;
		}
	};

	themeOverlay.addEventListener("pointerup", cancelHold);
	themeOverlay.addEventListener("pointerleave", cancelHold);
	themeOverlay.addEventListener("pointercancel", cancelHold);
	}

  


	// =================================================================
	// END BUTTON HANDLERS
	// =================================================================
	let demoRunning = false
	let cheatActive = false

	svg.addEventListener('pointerdown',e=>{
		if(demoRunning) return
		const t = document.elementFromPoint(e.clientX,e.clientY)
		if(!t) return
		const btn = t.closest('.interactive')
		if(!btn) return
		press(btn)
	})

	function clear(){
		for(const b of pressed) release(b)
	}

	svg.addEventListener('pointerup',clear)
	svg.addEventListener('pointercancel',clear)

	const konami = ['up','up','down','down','left','right','left','right','x','o','select','start']
	let k = 0
	let timer = null

	function reset(){
		k = 0
		if(timer){
			clearTimeout(timer)
			timer = null
		}
	}

	function register(id){
		// Note: Boxing and Soccer games are now handled by the overlay hold-to-start system
		// The register function only handles Konami code detection for these buttons

		// Konami code detection
		if(id === konami[k]){
			k++
			if(k === konami.length){
				reset()
				activate()
				return
			}
		}else{
			k = id === konami[0] ? 1 : 0
		}
		if(timer) clearTimeout(timer)
		timer = setTimeout(reset,1200)
	}

	function activate(){
		if(cheatActive) return
		cheatActive = true
		document.body.classList.add('cheat')
		setTimeout(()=>{
			document.body.classList.remove('cheat')
			cheatActive = false
		},10000)
	}

	demo.onclick = async ()=>{
		if(demoRunning || cheatActive) return
		demoRunning = true
		reset()

		for(const id of konami){
			const el = get(id)
			if(!el) continue
			press(el)
			await new Promise(r=>setTimeout(r,240))
			release(el)
			await new Promise(r=>setTimeout(r,120))
		}

		demoRunning = false
	}

})
