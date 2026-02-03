// Boxing Game Handler - X Button boxing animation using Lottie
export const boxingGame = {
	tvScreen: null,
	anim: null,
	isHitting: false,
	nextPunchLeft: true,
	container: null,

	init() {
		this.tvScreen = document.getElementById('tv_screen');
	},

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
	},

	handleAction() {
		this.punch();
	}
};
