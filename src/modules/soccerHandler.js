// Soccer Game Handler - O Button soccer kick mini-game
import { gameManager } from './gameManager.js';

export const soccerHandler = {
	tvScreen: null,
	ball: null,
	goalPost: null,
	state: 0,
	intervals: { goalPost: null, ball: null },

	init() {
		this.tvScreen = document.getElementById('tv_screen');
	},

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
			if (gameManager.activeGame !== 'soccer') return;
			if (this.ball) this.ball.remove();
			if (this.goalPost) this.goalPost.remove();
			this.ball = null;
			this.goalPost = null;
			this.state = 0;
			// Restart the game for another kick
			this.start();
		}, 2000);
	},

	cleanup() {
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
	},

	handleAction() {
		if (this.state === 0) this.start();
		else if (this.state === 1) this.kick();
	}
};
