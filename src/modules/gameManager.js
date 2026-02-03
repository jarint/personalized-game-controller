// Central game manager - coordinates all games and handles timing
export const gameManager = {
	activeGame: null,  // null, 'boxing', 'soccer', 'dna', or 'bb8'
	inactivityTimer: null,
	holdTimer: null,
	HOLD_DURATION: 2000,  // 2 seconds to start a game
	INACTIVITY_TIMEOUT: 10000,  // 10 seconds of no interaction
	
	// Registry of game handlers - populated by registerGame()
	games: {},

	/**
	 * Register a game handler with the manager
	 * @param {string} name - Game identifier
	 * @param {object} handler - Game handler with start/cleanup methods
	 */
	registerGame(name, handler) {
		this.games[name] = handler;
	},

	/**
	 * Reset the inactivity timer - call this on any user interaction
	 */
	resetInactivityTimer() {
		if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
		if (this.activeGame) {
			this.inactivityTimer = setTimeout(() => {
				this.closeCurrentGame();
			}, this.INACTIVITY_TIMEOUT);
		}
	},

	/**
	 * Close the currently active game and cleanup
	 */
	closeCurrentGame() {
		if (this.activeGame && this.games[this.activeGame]) {
			const handler = this.games[this.activeGame];
			if (handler.cleanup) handler.cleanup();
		}
		this.activeGame = null;
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
			this.inactivityTimer = null;
		}
	},

	/**
	 * Start a specific game
	 * @param {string} game - Name of the game to start
	 */
	startGame(game) {
		// Close current game if different
		if (this.activeGame && this.activeGame !== game) {
			this.closeCurrentGame();
		}

		if (this.activeGame === game) return; // Already active

		this.activeGame = game;
		const handler = this.games[game];
		if (handler && handler.start) {
			handler.start();
		}
		this.resetInactivityTimer();
	},

	/**
	 * Handle an action for the currently active game
	 * @param {string} game - Name of the game
	 */
	handleAction(game) {
		if (this.activeGame !== game) return;

		this.resetInactivityTimer();
		const handler = this.games[game];
		if (handler && handler.handleAction) {
			handler.handleAction();
		}
	}
};
