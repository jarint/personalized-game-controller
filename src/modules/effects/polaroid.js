// Polaroid Photo Effect - CodePen Integration
// Shake-to-develop polaroid animation

export function showPolaroid() {
	const tvScreen = document.getElementById('tv_screen');
	if (!tvScreen) return;

	// Create container
	const container = document.createElement('div');
	container.className = 'polaroid-container';
	container.id = 'polaroid-container-instance';
	container.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		margin: 0;
		overflow: auto;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
	`;

	// Add Google Fonts
	if (!document.querySelector('link[href*="Permanent+Marker"]')) {
		const fontLink = document.createElement('link');
		fontLink.href = 'https://fonts.googleapis.com/css?family=Permanent+Marker|Raleway';
		fontLink.rel = 'stylesheet';
		document.head.appendChild(fontLink);
	}

	// Add styles
	const style = document.createElement('style');
	style.id = 'polaroid-styles';
	style.textContent = `
		.polaroid-container {
			font-family: 'Raleway', sans-serif;
		}
		.polaroid-container #info {
			position: absolute;
			top: 10px;
			width: 100%;
			text-align: center;
			color: rgba(255, 255, 255, 0.8);
			font-size: 14px;
			pointer-events: none;
			z-index: 100;
		}
		.polaroid-container h1 {
			margin: 0 auto;
			margin-top: 15px;
			text-align: center;
			width: 100%;
			font-family: 'Raleway', sans-serif;
			color: #fff;
			font-size: 24px;
		}
		.polaroid-container h3 {
			font-family: 'Permanent Marker', cursive;
		}
		.polaroid-container .table {
			position: relative;
			display: block;
			width: 90%;
			height: 100%;
			margin: 0 auto;
			padding-bottom: 20px;
		}
		.polaroid-container ul {
			position: relative;
			margin: 0 auto;
			text-align: center;
			display: block;
			padding: 0;
			list-style: none;
		}
		.polaroid-container li.poloroid {
			display: inline-block;
			position: relative;
			left: 0%;
			margin: 2%;
		}
		.polaroid-container li.poloroid:nth-child(odd) {
			transform: rotate(2deg);
		}
		.polaroid-container li.poloroid:nth-child(even) {
			transform: rotate(-2deg);
		}
		.polaroid-container .poloroid {
			display: inline-block;
			position: relative;
			width: 180px;
			height: 220px;
			background: white;
			border-radius: 2%;
			box-shadow: 0 4px 15px rgba(0,0,0,0.3);
			transition: transform 0.3s ease;
		}
		.polaroid-container .poloroid:hover {
			transform: scale(1.05) rotate(0deg) !important;
			z-index: 10;
		}
		.polaroid-container .poloroid h3 {
			position: absolute;
			display: block;
			z-index: 100;
			bottom: 8px;
			left: 0;
			right: 0;
			width: 90%;
			margin: 0 auto;
			text-align: center;
			font-size: 12px;
			color: #333;
		}
		.polaroid-container li.poloroid:hover .photo img,
		.polaroid-container li.poloroid:active .photo img {
			animation: develop-picture 2s ease-in forwards;
		}
		.polaroid-container .photo img.developed {
			opacity: 1;
			filter: sepia(0%) brightness(1);
			animation: none;
		}
		.polaroid-container .photo {
			position: absolute;
			width: 160px;
			height: 160px;
			background: #111;
			z-index: 10;
			top: 10px;
			left: 10px;
			border: 1px solid #222;
		}
		.polaroid-container .photo img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			opacity: 0;
			background: #111;
		}
		@keyframes develop-picture {
			0% {
				opacity: 0;
				filter: sepia(100%) brightness(0.3);
			}
			50% {
				opacity: 0.6;
				filter: sepia(50%) brightness(0.7);
			}
			100% {
				opacity: 1;
				filter: sepia(0%) brightness(1);
			}
		}
		/* Shake animation */
		.polaroid-container .shake-slow {
			animation: shake-slow 4s ease-in-out infinite;
		}
		.polaroid-container .shake-slow:hover {
			animation: shake-fast 0.3s ease-in-out infinite;
		}
		@keyframes shake-slow {
			0%, 100% { transform: rotate(2deg); }
			25% { transform: rotate(-1deg); }
			50% { transform: rotate(1deg); }
			75% { transform: rotate(-2deg); }
		}
		@keyframes shake-fast {
			0%, 100% { transform: rotate(0deg) scale(1.05); }
			25% { transform: rotate(-3deg) scale(1.05); }
			50% { transform: rotate(3deg) scale(1.05); }
			75% { transform: rotate(-3deg) scale(1.05); }
		}
	`;
	document.head.appendChild(style);

	// Random photo captions
	const captions = [
		"Do you remember?",
		"Good times!",
		"We had so much fun",
		"Let's go back",
		"Miss you! xxx",
		"Best day ever",
		"Never forget",
		"Memories ❤️"
	];

	// Generate random photos with unique URLs
	const getRandomCaption = () => captions[Math.floor(Math.random() * captions.length)];
	const timestamp = Date.now();

	// Add HTML structure
	container.innerHTML = `
		<div id="info">
			<span style="opacity: 0.7;">Hover over photos to develop • Hold any button for 2s to exit</span>
		</div>
		<h1>📸 Shake to Develop</h1>
		<div class="table">
			<ul class="photos">
				<li class="poloroid shake-slow">
					<div class="photo"><img src="https://picsum.photos/300/300?random=${timestamp + 1}" alt="shake to develop"/></div>
					<h3>${getRandomCaption()}</h3>
				</li>
				<li class="poloroid shake-slow">
					<div class="photo"><img src="https://picsum.photos/300/300?random=${timestamp + 2}" alt="shake to develop"/></div>
					<h3>${getRandomCaption()}</h3>
				</li>
			</ul>
			<ul class="photos">
				<li class="poloroid shake-slow">
					<div class="photo"><img src="https://picsum.photos/300/300?random=${timestamp + 3}" alt="shake to develop"/></div>
					<h3>${getRandomCaption()}</h3>
				</li>
				<li class="poloroid shake-slow">
					<div class="photo"><img src="https://picsum.photos/300/300?random=${timestamp + 4}" alt="shake to develop"/></div>
					<h3>${getRandomCaption()}</h3>
				</li>
			</ul>
		</div>
	`;

	tvScreen.appendChild(container);

	// Add event listeners to make photos stay developed after shaking
	const photos = container.querySelectorAll('.poloroid');
	photos.forEach(photo => {
		const img = photo.querySelector('.photo img');
		if (img) {
			// When animation ends, mark as developed so it stays visible
			img.addEventListener('animationend', () => {
				img.classList.add('developed');
			});
			// Also mark as developed on mouseenter after a delay
			photo.addEventListener('mouseenter', () => {
				setTimeout(() => {
					img.classList.add('developed');
				}, 2000); // Match animation duration
			});
		}
	});

	// Close when any controller button is held for 2 seconds, then start that button's game
	const controllerButtons = [
		{ selector: '#triangle_camera', game: 'dna' },
		{ selector: '#football_o_button', game: 'soccer' },
		{ selector: '#boxing_x_button', game: 'boxing' },
		{ selector: '#theme_square_button', game: 'bb8' }
	];

	let holdTimeout = null;
	let activeButtonGame = null;
	const HOLD_DURATION = 2000;

	// Mark that polaroid is active globally
	window._blackHoleActive = true;

	const closePolaroid = (startGame = null) => {
		window._blackHoleActive = false;
		container.remove();
		style.remove();
		// Remove button listeners
		controllerButtons.forEach(({ selector }) => {
			const btn = document.querySelector(selector);
			if (btn) {
				btn.removeEventListener('pointerdown', handleButtonDown, true);
				btn.removeEventListener('pointerup', handleButtonUp, true);
				btn.removeEventListener('pointerleave', handleButtonUp, true);
				btn.removeEventListener('pointercancel', handleButtonUp, true);
			}
		});

		// Start the game for the button that was held
		if (startGame) {
			import('../gameManager.js').then(({ gameManager }) => {
				gameManager.startGame(startGame);
			});
		}
	};

	const handleButtonDown = (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		e.preventDefault();

		const buttonConfig = controllerButtons.find(({ selector }) =>
			e.currentTarget.matches(selector)
		);
		activeButtonGame = buttonConfig ? buttonConfig.game : null;

		holdTimeout = setTimeout(() => {
			closePolaroid(activeButtonGame);
		}, HOLD_DURATION);
	};

	const handleButtonUp = (e) => {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if (holdTimeout) {
			clearTimeout(holdTimeout);
			holdTimeout = null;
		}
		activeButtonGame = null;
	};

	controllerButtons.forEach(({ selector }) => {
		const btn = document.querySelector(selector);
		if (btn) {
			btn.addEventListener('pointerdown', handleButtonDown, true);
			btn.addEventListener('pointerup', handleButtonUp, true);
			btn.addEventListener('pointerleave', handleButtonUp, true);
			btn.addEventListener('pointercancel', handleButtonUp, true);
		}
	});

	return container;
}
