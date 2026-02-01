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

	// camera overlay (triangle replacement)
	// makes camera behave like other buttons: pressed visuals + register("triangle")
	const camera = document.querySelector("#triangle_camera .camera");
	if (camera) {
		camera.addEventListener("pointerdown", (e) => {
			if (demoRunning) return;
			e.preventDefault();

			// register as if triangle was pressed (no pressed visuals)
			register("triangle");

			// flash animation
			camera.classList.remove("is_flashing");
			void camera.offsetWidth; // restart animation
			camera.classList.add("is_flashing");
		});

		// remove is_flashing when the animation finishes
		const light = camera.querySelector(".light");
		if (light) {
			light.addEventListener("animationend", (e) => {
				if (e.animationName === "flash") {
					camera.classList.remove("is_flashing");
				}
			});
		}
	}

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
