// Sketch/Drawing Effect - CodePen Integration
// 3D Pencil drawing animation with Three.js

export function showSketch() {
	const tvScreen = document.getElementById('tv_screen');
	if (!tvScreen) return;

	// Create container
	const container = document.createElement('div');
	container.className = 'sketch-container';
	container.id = 'sketch-container-instance';
	container.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		margin: 0;
		overflow: hidden;
		background-color: #f7f4f0;
		cursor: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/cursor.png'), auto;
	`;

	// Add styles
	const style = document.createElement('style');
	style.id = 'sketch-styles';
	style.textContent = `
		.sketch-container canvas {
			display: block;
		}
		.sketch-container #info {
			position: absolute;
			top: 15px;
			width: 100%;
			text-align: center;
			color: rgba(0, 0, 0, 0.6);
			font-size: 16px;
			letter-spacing: 0.5px;
			pointer-events: none;
			z-index: 100;
		}
		.sketch-container .colours {
			bottom: 20px;
			display: flex;
			left: 50%;
			list-style-type: none;
			padding-left: 0;
			margin: 0;
			position: absolute;
			transform: translateX(-50%);
			z-index: 10;
		}
		.sketch-container .colours li {
			border-radius: 50%;
			display: inline-block;
			height: 20px;
			margin: 0 8px;
			width: 20px;
			cursor: pointer;
			border: 2px solid transparent;
			transition: transform 0.2s, border-color 0.2s;
		}
		.sketch-container .colours li:hover {
			transform: scale(1.2);
		}
		.sketch-container .colours li.active {
			border-color: #333;
		}
		.sketch-container .colours li:nth-child(1) { background-color: #100c08; }
		.sketch-container .colours li:nth-child(2) { background-color: #759BA9; }
		.sketch-container .colours li:nth-child(3) { background-color: #77dd77; }
		.sketch-container .colours li:nth-child(4) { background-color: #ff6961; }
		.sketch-container .colours li:nth-child(5) { background-color: #ffd1dc; }
		.sketch-container .sketch-btn {
			background-color: rgba(255,255,255,0.8);
			border: 1px solid rgba(0,0,0,0.2);
			border-radius: 4px;
			cursor: pointer;
			font-size: 12px;
			letter-spacing: 0.05em;
			outline: none;
			padding: 8px 16px;
			text-transform: uppercase;
			position: absolute;
			bottom: 20px;
			z-index: 10;
			transition: background-color 0.2s;
		}
		.sketch-container .sketch-btn:hover {
			background-color: rgba(255,255,255,1);
		}
		.sketch-container .pencil__refresh {
			left: 20px;
		}
		.sketch-container .pencil__submit {
			right: 20px;
		}
	`;
	document.head.appendChild(style);

	// Add HTML structure
	container.innerHTML = `
		<div id="info">
			Sketch Pad<br>
			<span style="font-size: 12px; opacity: 0.7;">Click and drag to draw • Hold any button for 2s to exit</span>
		</div>
		<ul class="colours">
			<li class="active"></li>
			<li></li>
			<li></li>
			<li></li>
			<li></li>
		</ul>
		<button class="pencil__refresh sketch-btn">Clear</button>
		<button class="pencil__submit sketch-btn">Save</button>
	`;

	tvScreen.appendChild(container);

	// Colors
	const colors = ["#100c08", "#759BA9", "#77dd77", "#ff6961", "#ffd1dc"];
	let currentColorIndex = 0;

	// Set up color buttons
	const colorButtons = container.querySelectorAll('.colours li');
	colorButtons.forEach((btn, index) => {
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			colorButtons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			currentColorIndex = index;
		});
	});

	// Create drawing canvas
	const drawingCanvas = document.createElement('canvas');
	const containerRect = container.getBoundingClientRect();
	drawingCanvas.width = containerRect.width;
	drawingCanvas.height = containerRect.height;
	drawingCanvas.style.cssText = `
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
	`;
	container.appendChild(drawingCanvas);

	const drawingCtx = drawingCanvas.getContext('2d');

	let isDrawing = false;
	let newlyUp = false;
	let lastPoint = null;

	const pencilPathDefaults = { minThickness: 0.2, maxThickness: 2 };
	const pencilPathCurrent = { thickness: 0.2 };
	const pencilPathTarget = { thickness: 0.2 };

	// Drawing handlers
	const handleMouseDown = (e) => {
		if (e.target.tagName === 'BUTTON' || e.target.tagName === 'LI') return;
		isDrawing = true;
		pencilPathTarget.thickness = pencilPathDefaults.maxThickness;

		const rect = container.getBoundingClientRect();
		const xPos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
		const yPos = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

		const currentPoint = { x: xPos, y: yPos };

		drawingCtx.beginPath();
		drawingCtx.fillStyle = colors[currentColorIndex];
		drawingCtx.globalAlpha = 0.9;
		drawingCtx.arc(currentPoint.x, currentPoint.y, pencilPathDefaults.maxThickness, 0, Math.PI * 2);
		drawingCtx.fill();

		lastPoint = currentPoint;
	};

	const handleMouseUp = () => {
		newlyUp = true;
		isDrawing = false;
		pencilPathTarget.thickness = pencilPathDefaults.minThickness;
		setTimeout(() => { newlyUp = false; }, 50);
	};

	const handleMouseMove = (e) => {
		if (!isDrawing && !newlyUp) return;

		const rect = container.getBoundingClientRect();
		const xPos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
		const yPos = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

		const currentPoint = { x: xPos, y: yPos };

		if (!lastPoint) {
			lastPoint = currentPoint;
			return;
		}

		// Interpolate thickness
		pencilPathCurrent.thickness += (pencilPathTarget.thickness - pencilPathCurrent.thickness) * 0.2;

		const dist = Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2));
		const angle = Math.atan2(currentPoint.x - lastPoint.x, currentPoint.y - lastPoint.y);

		for (let i = 0; i < dist; i += 0.3) {
			const x = lastPoint.x + Math.sin(angle) * i;
			const y = lastPoint.y + Math.cos(angle) * i;

			drawingCtx.beginPath();
			drawingCtx.fillStyle = colors[currentColorIndex];
			drawingCtx.globalAlpha = 0.15 + Math.random() * 0.1;
			drawingCtx.arc(x, y, pencilPathCurrent.thickness, 0, Math.PI * 2);
			drawingCtx.fill();
		}

		lastPoint = currentPoint;
	};

	container.addEventListener('mousedown', handleMouseDown);
	container.addEventListener('touchstart', handleMouseDown);
	container.addEventListener('mouseup', handleMouseUp);
	container.addEventListener('touchend', handleMouseUp);
	container.addEventListener('mousemove', handleMouseMove);
	container.addEventListener('touchmove', handleMouseMove);

	// Clear button
	const refreshBtn = container.querySelector('.pencil__refresh');
	refreshBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
	});

	// Save button
	const submitBtn = container.querySelector('.pencil__submit');
	submitBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		const freshCanvas = document.createElement('canvas');
		freshCanvas.width = drawingCanvas.width;
		freshCanvas.height = drawingCanvas.height;
		const freshCtx = freshCanvas.getContext('2d');
		freshCtx.fillStyle = "#f7f4f0";
		freshCtx.fillRect(0, 0, freshCanvas.width, freshCanvas.height);
		freshCtx.drawImage(drawingCanvas, 0, 0);
		
		const imageDataURL = freshCanvas.toDataURL();
		const link = document.createElement('a');
		link.download = 'sketch.png';
		link.href = imageDataURL;
		link.click();
	});

	// Load Three.js for 3D pencil (optional enhancement)
	Promise.all([
		import('three'),
		import('three/addons/loaders/MTLLoader.js'),
		import('three/addons/loaders/OBJLoader.js'),
	]).then(([THREE, MTLLoaderModule, OBJLoaderModule]) => {
		const { MTLLoader } = MTLLoaderModule;
		const { OBJLoader } = OBJLoaderModule;

		// Create 3D renderer for pencil
		const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		renderer.setClearColor(0x000000, 0);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(containerRect.width, containerRect.height);
		renderer.domElement.style.cssText = `
			position: absolute;
			left: 0;
			top: 0;
			z-index: 5;
			pointer-events: none;
		`;
		container.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(8, containerRect.width / containerRect.height, 1, 10000);
		camera.position.z = 12;

		// Lighting
		const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
		hemiLight.position.set(0, 0, 50);
		scene.add(hemiLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(-0.5, 1, 10);
		scene.add(directionalLight);

		const spotLight = new THREE.SpotLight(0xffffff, 0.4);
		spotLight.position.set(-7, 1, 2);
		scene.add(spotLight);

		// Load pencil model
		const codepenAssetUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/605067/';
		let pencil = null;
		const mousePos = new THREE.Vector3(0, 0, 0);
		const mouse = { x: 0, y: 0 };

		const pencilDefaultPos = { height: 0.04, xRotate: 0, yRotate: 0, zRotate: 0 };
		const pencilPos = { height: 0.04, xRotate: 0, yRotate: 0, zRotate: 0 };
		const pencilTargetPos = { height: 0.04, xRotate: 0, yRotate: 0, zRotate: 0, heightRotate: 0 };

		const mtlLoader = new MTLLoader();
		mtlLoader.setPath(codepenAssetUrl);
		mtlLoader.load('pencil-multi.mtl', (materials) => {
			materials.preload();

			const objLoader = new OBJLoader();
			objLoader.setMaterials(materials);
			objLoader.setPath(codepenAssetUrl);
			objLoader.load('pencil-multi.obj', (obj) => {
				obj.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true;
					}
				});

				pencil = obj;

				// Initial rotation
				const rotateAroundWorldAxis = (object, axis, radians) => {
					const rotWorldMatrix = new THREE.Matrix4();
					rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
					rotWorldMatrix.multiply(object.matrix);
					object.matrix = rotWorldMatrix;
					object.setRotationFromMatrix(object.matrix);
				};

				rotateAroundWorldAxis(pencil, new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(90));
				rotateAroundWorldAxis(pencil, new THREE.Vector3(1, 0, 0), THREE.MathUtils.degToRad(-10));
				rotateAroundWorldAxis(pencil, new THREE.Vector3(0, 1, 0), THREE.MathUtils.degToRad(20));

				pencilDefaultPos.xRotate = pencil.rotation.x;
				pencilDefaultPos.yRotate = pencil.rotation.y;
				pencilDefaultPos.zRotate = pencil.rotation.z;

				scene.add(pencil);
			});
		});

		// Track mouse for pencil
		const trackMouse = (e) => {
			const rect = container.getBoundingClientRect();
			const xPos = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
			const yPos = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

			mouse.x = (xPos / rect.width) * 2 - 1;
			mouse.y = -(yPos / rect.height) * 2 + 1;

			const vector = new THREE.Vector3(mouse.x + 0.01, mouse.y - 0.01, 0.5);
			vector.unproject(camera);
			const dir = vector.sub(camera.position).normalize();
			const distance = -camera.position.z / dir.z;
			mousePos.copy(camera.position.clone().add(dir.multiplyScalar(distance)));

			if (isDrawing) {
				pencilTargetPos.height = 0;
				pencilTargetPos.heightRotate = 0.2;
			} else {
				pencilTargetPos.height = pencilDefaultPos.height;
				pencilTargetPos.heightRotate = 0;
			}
		};

		container.addEventListener('mousemove', trackMouse);
		container.addEventListener('touchmove', trackMouse);

		// Animation loop
		let animationId;
		const animate = () => {
			animationId = requestAnimationFrame(animate);

			if (pencil) {
				pencilPos.height += (pencilTargetPos.height - pencilPos.height) * 0.2;
				pencil.position.copy(mousePos);
				pencil.position.x += pencilPos.height;
				pencil.position.y += pencilPos.height;
				pencil.position.z += pencilPos.height;
			}

			renderer.render(scene, camera);
		};
		animate();

		// Store cleanup
		container._cleanup = () => {
			cancelAnimationFrame(animationId);
			renderer.dispose();
		};

	}).catch(error => {
		console.warn('3D pencil not loaded, using 2D drawing only:', error.message);
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

	// Mark that sketch is active globally
	window._blackHoleActive = true;

	const closeSketch = (startGame = null) => {
		window._blackHoleActive = false;
		if (container._cleanup) container._cleanup();
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
			closeSketch(activeButtonGame);
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
