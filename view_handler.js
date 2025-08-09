function display_tapestry(canvas, pixel_grid) {
	let ctx = canvas.getContext("2d");
	let cell_width = Math.floor(canvas.width / pixel_grid[0].length);
	let cell_height = Math.floor(canvas.height / pixel_grid.length);
	
	console.log(cell_width);
	console.log(cell_height);
	
	for (const [y, pixel_row] of pixel_grid.entries()) {
		for (const [x, pixel] of pixel_row.entries()) {
			ctx.fillStyle = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
			ctx.fillRect(x * cell_width, y * cell_height, cell_width, cell_height);
		}
	}
}