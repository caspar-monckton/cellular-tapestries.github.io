const colour_palette = [[200, 30, 30], [50, 200, 100], [30, 20, 200], [100, 40, 100], [0, 0, 0]];


class ComponentHandler {
	constructor(parent, display) {
		this.parent = parent;
		this.display = display;
		this.container = document.createElement("div");
		this.button_container = document.createElement("div");
		this.loaded = true;
		this.lazy_content = false;
		this.buttons = [];
		this.hidden_buttons = [];
		this.container.appendChild(this.display);
		this.container.appendChild(this.button_container);
		
		this.parent.appendChild(this.container);
	}
	
	update_display() {
		//console.log(this.hidden_buttons);
		for (let hidden_button of this.hidden_buttons) {
			//console.log("button refreshed: " + hidden_button);
			this.buttons[hidden_button].style.visibility = "visible";
		}
		this.hidden_buttons = [];
	}
	
	add_button(identifier, text, hideable, callback = (function () {console.log(identifier + " has been pressed.");})) {
		const button = document.createElement("button");
		button.innerHTML = text;
		button.setAttribute("id", identifier);
		button.addEventListener('click', callback);
		this.button_container.appendChild(button);
		this.buttons.push(button);

		
		if (hideable) {
			button.addEventListener('click', () => {
				button.style.visibility = "hidden"; 	this.hidden_buttons.push(this.buttons.length - 1);
			})

			//console.log(this.buttons.length - 1);
		}

	}
	
	// Code courtesy of Chisom Kanu on https://blog.openreplay.com/lazy-loading-in-javascript/
	isInViewport() {
		const rect = this.display.getBoundingClientRect();
		return rect.bottom > 0 && rect.top < window.innerHeight; 
	}
	
	set_lazy_content() {
		this.lazy_content = true;
		this.loaded = false;
		this.display.classList.add("lazy-content");
	}
}

class TapestryHandler extends ComponentHandler {
	constructor(pixel_size, tapestry, parent) {
		const tapestry_display = document.createElement('canvas');
		tapestry_display.width = tapestry.tape.length() * pixel_size;
		tapestry_display.height = tapestry.height * pixel_size;
		
		super(parent, tapestry_display);
		this.pixel_size = pixel_size;
		this.width = this.display.width;
		this.height = this.display.height;
		this.tapestry = tapestry;
		this.num_cell_width = this.tapestry.tape.length();
		this.num_cell_height = this.tapestry.height;
	
		this.num_iterations = this.tapestry.num_iterations;
		this.pixel_grid = this.tapestry.generate_grid_data();
	}
	
	reset_display(pixel_size, tapestry) {
		this.display.width = tapestry.tape.length() * pixel_size;
		this.display.height = tapestry.height * pixel_size;
		
		this.pixel_size = pixel_size;
		this.width = this.display.width;
		this.height = this.display.height;
		this.tapestry = tapestry;
		this.num_cell_width = this.tapestry.tape.length();
		this.num_cell_height = this.tapestry.height;
		this.num_iterations = this.tapestry.num_iterations;
		this.pixel_grid = this.tapestry.generate_grid_data();
	}
	
	update_display() {
		this.pixel_grid = this.tapestry.generate_grid_data();
		let ctx = this.display.getContext("2d");
		let cell_width = Math.floor(this.width / this.num_cell_width);
		let cell_height = Math.floor(this.height / this.num_cell_height);
		
		
		for (const [y, pixel_row] of this.pixel_grid.entries()) {
			for (const [x, pixel] of pixel_row.entries()) {
				let pixel_colour = [colour_palette[pixel][0], colour_palette[pixel][1], colour_palette[pixel][2]];
				
				ctx.fillStyle = `rgb(${pixel_colour[0]}, ${pixel_colour[1]}, ${pixel_colour[2]})`;
				ctx.fillRect(x * cell_width, y * cell_height, cell_width, cell_height);
			}
		}
		super.update_display();
	}
}

class TapeHandler extends ComponentHandler {
	constructor(tape, selected_rule, parent) {
		const tape_display = document.createElement("div");
		tape_display.classList.add("live-tape-editor");
		super(parent, tape_display);
		
		this.selected_rule = selected_rule;
		this.start_buffer = document.createElement("div");
		this.start_buffer.classList.add("tape-buffer");
		this.end_buffer = document.createElement("div");
		this.end_buffer.classList.add("tape-buffer");
		this.tapestry_width = 100;
		this.tapestry_height = 100;
		this.cell_size = 2;
		
		const width_input = document.createElement("div");
		const height_input = document.createElement("div");
		const cell_size_input = document.createElement("div");
		
		width_input.innerHTML = '<label for="width">Width:</label><input type="number" id="width" min="1" max="3000" value="100">'
		height_input.innerHTML = '<label for="height">Height:</label><input type="number" id="height" min="1" max="3000" value="100">'
		cell_size_input.innerHTML = '<label for="cell-size">Cell Size:</label><input type="number" id="cell-size" min="1" max="5" value="2">'
		
		
		width_input.addEventListener("change", (event) => {
			this.tapestry_width = parseInt(event.target.value);
			this.tape = null;
			this.init_display();
			this.update_display();
			
		});
		
		height_input.addEventListener("change", (event) => {
			this.tapestry_height = parseInt(event.target.value);
			this.tape = null;
			this.init_display();
			this.update_display();
		});
		
		cell_size_input.addEventListener("change", (event) => {
			this.cell_size = parseInt(event.target.value);
		});
		
		this.container.appendChild(width_input);
		this.container.appendChild(height_input);
		this.container.appendChild(cell_size_input);
		
		
		
		this.add_button("generate-random", "generate random tape", false, () => {
			this.tape = generate_random_tape(4, this.tapestry_width);
			this.init_display();
			//console.log(this.tape);
			this.update_display();
		});
		
		this.add_button("generate-blank", "generate blank tape", false, () => {
			this.tape = generate_blank_tape(0, 4, this.tapestry_width);
			this.init_display();
			//console.log(this.tape);
			this.update_display();
		});
		
		this.add_button("simulate", "simulate", false, () => {
			if (this.getSimulator() === null) {
				this.simulator = new TapestryHandler(this.cell_size, new Tapestry(this.selected_rule, this.currentTape, this.tapestry_height), this.container);
			} else {
				this.simulator.reset_display(this.cell_size, new Tapestry(this.selected_rule, this.currentTape, this.tapestry_height));
			}
			this.simulator.update_display();
		});
		
		this.view_cells = [];
		this.tape = tape;
		this.init_display();
		this.simulator = null;
	}
	
	getSimulator() {
		return this.simulator;
	}
	
	get currentTape() {
		return this.tape;
	}
	
	init_display() {
		this.view_cells = [];
		
		this.display.appendChild(this.start_buffer);
		
		if (this.tape === null) {
			this.display.innerHTML = "No tape selected.";
		} else {
			this.display.innerHTML = null;
			
			this.tape._values.entries().forEach(doub => {
				let tape_cell = doub[1];
				let tape_index = doub[0];
				
				let colour = colour_palette[tape_cell];
				const view_cell = document.createElement("button");
				view_cell.classList.add("tape-cell");
				view_cell.style.background=`rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
				view_cell.innerHTML = tape_cell;
				view_cell.addEventListener('click', () => {
					const tape = this.currentTape;
					tape._values[tape_index] = (tape._values[tape_index] + 1) % tape._num_states;
					this.update_display();
				});

				
				this.view_cells.push(view_cell);
				this.display.appendChild(view_cell);
			});
			this.display.appendChild(this.end_buffer);
		}
	}
	
	update_display() {
		
		if (this.tape !== null) {
			this.tape._values.entries().forEach(doub => {
				let tape_cell = doub[1];
				let tape_index = doub[0];
				
				let colour = colour_palette[tape_cell];
				let view_cell = this.view_cells[tape_index];
				view_cell.style.background=`rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;
				view_cell.innerHTML = tape_cell;
			});
			super.update_display();
		}
	}
}

class GalleryHandler extends ComponentHandler {
	constructor(gallery_items, parent) {
		const gallery_view = document.createElement("div");
		gallery_view.classList.add("gallery");
		super(parent, gallery_view);
		this.gallery_items = gallery_items;
		this.gallery_views = [];
		
		for (let tapestry of this.gallery_items.gallery_elements) {
			const gallery_item = new TapestryHandler(1, tapestry, this.display);
			gallery_item.set_lazy_content();
			gallery_item.container.classList.add("gallery-box");
			gallery_item.add_button("explore", "explore", false, function () {
				window.location.href='explore.html'; 
				localStorage.setItem('selectedRule', JSON.stringify(tapestry.rule._instructions));
			})
			this.gallery_views.push(gallery_item);
		}
	}
	
	update_display() {
		for (let gallery_view of this.gallery_views) {
			gallery_view.update_display();
		}
		super.update_display();
	}
}

class EvolutionEnvironmentHandler extends ComponentHandler {
	constructor(evolution_env, parent) {
		const display = document.createElement("div");
		
		super(parent, display);
		this.evolution_env = evolution_env;
		
		const parent_control_box = document.createElement("div");
		const child_control_box = document.createElement("div");
		
		
		const parent_box = document.createElement("div");		
		parent_box.classList.add("component-box");
		const child_box = document.createElement("div");
		child_box.classList.add("component-box");
		
		const parent_reload_button = document.createElement("button");
		const children_reload_button = document.createElement("button");
		const new_tape_button = document.createElement("button");
		parent_reload_button.innerHTML = "reload both parents";
		children_reload_button.innerHTML = "reload all children";
		new_tape_button.innerHTML = "new starting tape";
		
		
		parent_reload_button.addEventListener("click", () => {
			for (const [index, parent] of this.evolution_env.parents.entries()) {
				this.evolution_env.select_parent(index);
			}
			this.evolution_env.generate_children();
			this.update_display();
		});
		
		children_reload_button.addEventListener("click", () => {
			this.evolution_env.generate_children();
			this.update_display();
		});
		
		new_tape_button.addEventListener("click", () => {
			this.evolution_env.select_new_tape();
			this.update_display();
		});
		
		parent_control_box.appendChild(parent_reload_button);
		child_control_box.appendChild(children_reload_button);
		parent_control_box.appendChild(new_tape_button);
		
		
		
		this.parent_views = [];
		this.children_views = [];
		
		for (const [index, parent] of this.evolution_env.parents.entries()) {
			const parent_view = new TapestryHandler(2, 
					new Tapestry(
						parent, 
						this.evolution_env.current_tape, 
						this.evolution_env.tape_resolution
					), 
					parent_box
				)
			
			parent_view.add_button("reload", "reload", false, () => {
				//console.log("reloading parent " + index);
				this.evolution_env.select_parent(index);
				parent_view.tapestry.rule = this.evolution_env.parents[index];
				parent_view.update_display();
			});
			parent_view.add_button("remove", "remove from gene pool", true, () => {
				this.evolution_env.remove_parent(index);
				this.evolution_env.select_parent(index);
				parent_view.tapestry.rule = this.evolution_env.parents[index];
				parent_view.update_display();
			});		
			
			this.parent_views.push(parent_view);
		}
		
		for (const [index, child] of this.evolution_env.children.entries()) {
			const child_view = 	new TapestryHandler(2, 
				new Tapestry(
					child, 
					this.evolution_env.current_tape, 
					this.evolution_env.tape_resolution
				), 
				child_box
			)
			
			child_view.add_button("regenerate", "regenerate", false, () => {
				//console.log("reloading child " + index);
				this.evolution_env.regenerate_child(index);
				child_view.tapestry.rule = this.evolution_env.children[index];
				child_view.update_display();
			});
			child_view.add_button("add", "add to gene pool", true, () => {
				//console.log("reloading parent " + index);
				this.evolution_env.add_child(index);
				child_view.tapestry.rule = this.evolution_env.children[index];
				child_view.update_display();
			});
			
			
			this.children_views.push(child_view);
		}
		
		parent_control_box.appendChild(parent_box);
		child_control_box.appendChild(child_box);
		
		
		this.display.appendChild(parent_control_box);
		this.display.appendChild(child_control_box);	
	}
	
	init_display() {
		
	}
	
	// Expensive, better to just update the individual displays in the callbacks.
	update_display() {
		for (const [index, parent_view] of this.parent_views.entries()) {
			parent_view.tapestry.rule = this.evolution_env.parents[index];
			parent_view.tapestry.tape = this.evolution_env.current_tape;
			
			parent_view.update_display();
		}
		
		for (const [index, child_view] of this.children_views.entries()) {
			child_view.tapestry.rule = this.evolution_env.children[index];
			child_view.tapestry.tape = this.evolution_env.current_tape;
			
			child_view.update_display();
		}
		super.update_display();
	}
}

function lazyLoadContent(elements, event_listener) {
	if (elements.filter((element) => (element.loaded === false)).length === 0) {
		window.removeEventListener("scroll", event_listener);
		return;
	}
	
	elements.forEach((element) => {
		if (element.isInViewport() && element.loaded === false) {
			element.update_display();
			element.loaded = true;
		}
	});
}
