// DNA Helix Animation - Interactive 3D DNA visualization using Zdog
export const dnaHelix = {
	tvScreen: null,
	canvas: null,
	scene: null,
	raf: null,
	_on_resize: null,

	init() {
		this.tvScreen = document.getElementById("tv_screen");
	},

	resizeCanvasToTv() {
		if (!this.canvas || !this.tvScreen) return;
				
		const rect = this.tvScreen.getBoundingClientRect();
				
		this.canvas.width = Math.floor(rect.width);
		this.canvas.height = Math.floor(rect.height);

			
		if (this.scene) {
			this.scene.setSize(this.canvas.width, this.canvas.height);
		}
	},

	start() {
		if (!this.tvScreen) return;
		if (this.scene) return; // already running

		// Create canvas 
		this.canvas = document.createElement("canvas");
		this.canvas.className = "dna_canvas";
		this.tvScreen.appendChild(this.canvas);

		this.resizeCanvasToTv();

		this._on_resize = () => this.resizeCanvasToTv();
		window.addEventListener("resize", this._on_resize);

		const { Illustration, TAU, Shape } = window.Zdog;

		// IMPORTANT: do NOT use fullscreen
		this.scene = new Illustration({
			element: this.canvas,
			dragRotate: true,
			resize: false, // resize to canvas element
		});

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
			this.canvas.remove(); 
			this.canvas = null;
		}

		if (this._on_resize) {
			window.removeEventListener("resize", this._on_resize);
			this._on_resize = null;
		}
	}
};
