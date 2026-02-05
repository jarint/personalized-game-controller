// Konami Code Handler - Secret cheat code functionality
export const konamiCode = {
	sequence: ['up','up','down','down','left','right','left','right','x','o','select','start'],
	currentIndex: 0,
	timer: null,
	isActive: false,

	reset() {
		this.currentIndex = 0;
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
	},

	register(id) {
		if (id === this.sequence[this.currentIndex]) {
			this.currentIndex++;
			if (this.currentIndex === this.sequence.length) {
				this.reset();
				this.activate();
				return;
			}
		} else {
			this.currentIndex = id === this.sequence[0] ? 1 : 0;
		}
		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(() => this.reset(), 1200);
	},

	activate() {
		if (this.isActive) return;
		this.isActive = true;
		document.body.classList.add('cheat');
		setTimeout(() => {
			document.body.classList.remove('cheat');
			this.isActive = false;
		}, 10000);
	}
};
