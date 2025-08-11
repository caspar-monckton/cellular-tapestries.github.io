
function display_tapestry(canvas, pixel_grid) {
	let ctx = canvas.getContext("2d");
	let cell_width = Math.floor(canvas.width / pixel_grid[0].length);
	let cell_height = Math.floor(canvas.height / pixel_grid.length);
	
	
	for (const [y, pixel_row] of pixel_grid.entries()) {
		for (const [x, pixel] of pixel_row.entries()) {
			ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
			ctx.fillRect(x * cell_width, y * cell_height, cell_width, cell_height);
		}
	}
}

// Code courtesy of Chisom Kanu on https://blog.openreplay.com/lazy-loading-in-javascript/
function isElementInViewport(element) {
	const rect = element.getBoundingClientRect();
	return rect.bottom > 0 && rect.top < window.innerHeight; 
}



function lazyLoadContent() {
	
	const lazyContentElements = document.querySelectorAll(".lazy-content");
 
	lazyContentElements.forEach((element) => {
		if (isElementInViewport(element) && element.getAttribute("loaded") === "false") {
			const rule = JSON.parse(element.getAttribute("rule"));
			const tape = JSON.parse(element.getAttribute("tape"));
			display_tapestry(element, generate_tapestry_data(new Rule(rule, env.num_states), new Tape(4, tape), tape.length));
			element.setAttribute("loaded", "true");
		}
	});
	
	const remainingUnloaded = document.querySelectorAll(".lazy-content[loaded='false']");
	console.log(remainingUnloaded)
    if (remainingUnloaded.length === 0) {
        window.removeEventListener("scroll", lazyLoadContent);
        console.log("All elements loaded, scroll listener removed");
    }
}
