// Personality Analysis Panel Module
// Shows personality insights based on which button the user interacts with

const PERSONALITY_DATA = {
	camera: {
		title: '📸 Camera - DNA Helix',
		icon: '△',
		color: '#4CAF50',
		description: `
			<p><strong>Hold for 2 seconds</strong> to trigger the DNA helix visualization.</p>
			<p>Watch the double helix of life spin and glow—a mesmerizing display of the building blocks that make us who we are. Inspired by classic sci-fi games and their love of science visualizations.</p>
		`
	},
	soccer: {
		title: '⚽ Football - Penalty Shootout',
		icon: '○',
		color: '#2196F3',
		description: `
			<p><strong>Hold for 2 seconds</strong> to start the penalty kick game.</p>
			<p>Time your shot and beat the moving goalpost! A classic arcade-style football mini-game where precision and timing are everything. Score goals and prove your skills.</p>
		`
	},
	boxing: {
		title: '🥊 Boxing - Punch the Bag',
		icon: '✕',
		color: '#f44336',
		description: `
			<p><strong>Hold for 2 seconds</strong> to start the boxing game.</p>
			<p>Unleash combinations on the punching bag! A satisfying, arcade-inspired workout where every click lands a punch. Keep the rhythm going and watch your score climb.</p>
		`
	},
	bb8: {
		title: '🤖 Paula - BB-8 Droid',
		icon: '□',
		color: '#FF9800',
		description: `
			<p><strong>Hold for 2 seconds</strong> to activate the BB-8 simulation.</p>
			<p>Meet the adorable droid from Star Wars! Watch BB-8 roll across the desert sands in this charming tribute to sci-fi gaming and the galaxy far, far away.</p>
		`
	}
};

let currentButton = null;

/**
 * Initialize the personality panel
 */
export function init() {
	setupButtonListeners();
}

/**
 * Set up hover and click listeners on controller buttons
 */
function setupButtonListeners() {
	const buttonMappings = [
		{ selector: '#triangle_camera', id: 'camera' },
		{ selector: '#football_o_button', id: 'soccer' },
		{ selector: '#boxing_x_button', id: 'boxing' },
		{ selector: '#bb8_square_button, #theme_square_button', id: 'bb8' }
	];
	
	buttonMappings.forEach(({ selector, id }) => {
		const elements = document.querySelectorAll(selector);
		elements.forEach(el => {
			if (!el) return;
			
			el.addEventListener('mouseenter', () => showPersonality(id));
			el.addEventListener('focus', () => showPersonality(id));
		});
	});
}

/**
 * Show personality info for a button
 * @param {string} buttonId - The button ID
 */
export function showPersonality(buttonId) {
	const panel = document.getElementById('personality-content');
	if (!panel) return;
	
	const data = PERSONALITY_DATA[buttonId];
	if (!data) return;
	
	currentButton = buttonId;
	
	panel.innerHTML = `
		<div class="personality-card" style="--accent-color: ${data.color}">
			<h4>${data.title}</h4>
			<div class="personality-description">
				${data.description}
			</div>
		</div>
	`;
	
	// Add animation class
	panel.querySelector('.personality-card')?.classList.add('fade-in');
}

/**
 * Reset to placeholder
 */
export function reset() {
	const panel = document.getElementById('personality-content');
	if (!panel) return;
	
	currentButton = null;
	panel.innerHTML = `
		<div class="personality-placeholder">
			<p>Hover over or click a button to learn more about what it represents.</p>
		</div>
	`;
}

/**
 * Get current active button
 */
export function getCurrentButton() {
	return currentButton;
}
