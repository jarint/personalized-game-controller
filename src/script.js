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

	// =================================================================
	// BUTTON HANDLERS - Add custom functionality for each button here
	// =================================================================

	// Triangle Button Handler (Camera)
	const cameraHandler = {
		setup() {
			// Makes camera behave like other buttons: pressed visuals + register("triangle")
			const camera = document.querySelector("#triangle_camera .camera");
			if (!camera) return;

			camera.addEventListener("pointerdown", (e) => {
				if (demoRunning) return;
				e.preventDefault();

				// Register as if triangle was pressed (no pressed visuals)
				register("triangle");

				// Flash animation
				camera.classList.remove("is_flashing");
				void camera.offsetWidth; // Restart animation
				camera.classList.add("is_flashing");
			});

			// Remove is_flashing when the animation finishes
			const light = camera.querySelector(".light");
			if (light) {
				light.addEventListener("animationend", (e) => {
					if (e.animationName === "flash") camera.classList.remove("is_flashing");
				});
			}
		}
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

	// Initialize handlers
	cameraHandler.setup();

	// Setup football overlay click handler
	const footballOverlay = document.querySelector("#football_o_button .football-icon");
	if (footballOverlay) {
		footballOverlay.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();
			register("o");
		});
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
		// Route button presses to their handlers
		if(id === 'o') {
			soccerHandler.handle();
		}
		
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
