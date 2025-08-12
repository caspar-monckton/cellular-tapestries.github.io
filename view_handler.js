
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

function load_live_tape(tape_display, tape, context) {
	if (tape === null) {
		tape_display.innerHTML = "<h1>No Tape Loaded.</h1>"
	} else {
		tape_display.innerHTML = null;
		const colour_palette = [[200, 30, 30], [50, 200, 100], [30, 20, 200], [100, 40, 100], [0, 0, 0]];
		const start_buffer = document.createElement("div");
		start_buffer.classList.add("tape-buffer");
		const end_buffer = document.createElement("div");
		end_buffer.classList.add("tape-buffer");
		
		tape_display.appendChild(start_buffer);
		tape._values.entries().forEach(doub => {
			let tape_cell = doub[1];
			let tape_index = doub[0];
			
			let colour = colour_palette[tape_cell];
			const view_cell = document.createElement("button");
			view_cell.classList.add("tape-cell");
			view_cell.style.background=`rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
			view_cell.innerHTML = tape_cell;
			// This is so ugly, ideally I should only be changing the tape and the display should automatically update since they should be tied by reference...
			view_cell.onclick = function() {
				console.log(tape);
				tape._values[tape_index] = context.current_colour; 
				view_cell.style.background=`rgb(
					${colour_palette[context.current_colour][0]}, 
					${colour_palette[context.current_colour][1]}, 
					${colour_palette[context.current_colour][2]}
				)`;
			view_cell.innerHTML = context.current_colour;
			};
			
			tape_display.appendChild(view_cell);
		});
		tape_display.appendChild(end_buffer);
	}
}