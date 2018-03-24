
var modes = []
var actions = []
var houses = []
var road_start = null
// var toggles = []
var autoduplicate = true
var waiting_for_autoduplicate = false

function Mode(mode_name, canvas_onclick) {
	this.mode_name = mode_name
	this.canvas_onclick = canvas_onclick
	return this
}

function Action(action_name, handler) {
	this.action_name = action_name
	this.handler = handler
	return this
}

// function Toggle(toggle_name, values) {
// 	this.toggle_name = toggle_name
// 	this.values = values
// 	this.current_value = null
// 	return this
// }

function House(position) {
	this.position = position
	this.radius = 16
	this.occupied = true
	this.neighbors = []
	this.picked = false
	this.draw = function(view) {
		view.draw_circle(this.position, this.radius, 'white')
		view.draw_circle(this.position, this.radius, 'darkgrey', 2)

		if (this.picked) {
			view.draw_circle(this.position, this.radius * 1.25, 'black', 1)
		}

		if (this.occupied) {
			view.draw_circle(this.position, this.radius / 2, 'darkgreen')
		}
		
	}
	this.draw_roads = function(view) {
		this.neighbors.forEach((n) => {
			view.draw_line(this.position, n.position, 'black', 1)
		})
	}
	this.contains_point = function(point) {
		return (this.position.distance2(point) < this.radius ** 2)
	}
	this.too_close = function(point) {
		return (this.position.distance2(point) < (this.radius * 2.2) ** 2)
	}
	this.has_clear_path = function(house) {
		// clear = true
		// p1 = this.position
		// p2 = house.position
		// unit = p1.minus(p2).normalize()
		// perpendicular = unit.perpendicular()
		// houses.forEach((h) => {
		// 	if (h != this && h != house) {
		// 		distance_to_road = Math.abs(h.position.minus(p1).dot(perpendicular))
		// 		clear = clear && (distance_to_road > h.radius)
		// 	}
		// })
		// return clear

		return true
	}
	return this
}

function place_a_house(e, view) {
	position = view.get_canvas_position_from_event(e)
	overlaps = false
	houses.forEach((h) => {
		if (h.too_close(position)) {
			overlaps = true
		}
	})
	if (! overlaps) {
		h = new House(position)
		houses.push(h)
		update_render(view)
	}
}

function remove_a_house(e, view) {
	position = view.get_canvas_position_from_event(e)
	houses.forEach((h) => {
		if (h.contains_point(position)) {
			h.neighbors.forEach((n) => {
				// remove h from its neighbors
				n.neighbors.splice(n.neighbors.indexOf(h), 1)
			})
			// remove h from houses
			houses.splice(houses.indexOf(h), 1)
		}
	})
	update_render(view)
}

function create_road(house1, house2) {
	if (house1 != house2) {
		house1.neighbors.push(house2)
		house2.neighbors.push(house1)
	}
}

function place_a_road(e, view) {
	position = view.get_canvas_position_from_event(e)
	house = null
	houses.forEach((h) => {
		if (h.contains_point(position)) {
			house = h
		}
	})
	if (house != null) {
		if (road_start != null) {
			if (road_start.has_clear_path(house)) {
				create_road(road_start, house)
				road_start.picked = false
				road_start = null
			}
		} else {
			road_start = house
			house.picked = true

		}
		update_render(view)
	}
}

function remove_a_gremlin(e, view) {
	if (waiting_for_autoduplicate) {
		return
	}
	position = view.get_canvas_position_from_event(e)
	modified = false
	houses.forEach((h) => {
		if (h.contains_point(position) && h.occupied) {
			h.occupied = false
			modified = true
		}
	})
	if (autoduplicate) {
		waiting_for_autoduplicate = true
		window.setTimeout(() => {
			duplicate_the_gremlins(view, null) // todo fix this null when you fix autoduplicate toggle
			waiting_for_autoduplicate = false
		}, 500)
	}
	if (modified) {
		update_render(view)
	}
}

function place_a_gremlin(e, view) {
	position = view.get_canvas_position_from_event(e)
	houses.forEach((h) => {
		if (h.contains_point(position)) {
			h.occupied = true
		}
	})
	update_render(view)
}

place_houses = new Mode("Place Houses", place_a_house)
place_roads = new Mode("Place Roads", place_a_road)
remove_gremlins = new Mode("Remove Gremlins", remove_a_gremlin)
place_gremlins = new Mode("Place Gremlins", place_a_gremlin)
remove_houses = new Mode("Remove Houses", remove_a_house)

modes.push(place_houses)
modes.push(place_roads)
modes.push(place_gremlins)
modes.push(remove_gremlins)
modes.push(remove_houses)


// autoduplicate = new Toggle("autoduplicate", true)

// toggles.push(autoduplicate)


function spawn_the_gremlins(view, t_d) {
	houses.forEach((h) => {
		h.occupied = true
	})
	// todo only update when at least one house changed
	update_render(view)
}

function clear_the_gremlins(view, t_d) {
	houses.forEach((h) => {
		h.occupied = false
	})
	// todo only update when at least one house changed
	update_render(view)
}

function duplicate_the_gremlins(view, t_d) {
	new_occupied = []
	houses.forEach((h) => {
		if (h.occupied) {
			h.neighbors.forEach((n) => {
				new_occupied.push(n)
			})
		}
		h.occupied = false
	})
	new_occupied.forEach((h) => {
		h.occupied = true
	})
	// todo only update when at least one house changed
	update_render(view)
}

function toggle_the_autoduplicate(view, toggle_display) {
	// it was at this point that Hunter started wishing he had used MVC from the beginning
	autoduplicate = ! autoduplicate
	toggle_display.innerHTML = "autoduplicate = " + autoduplicate
}

function clear_the_houses(view, t_d) {
	houses = []
	update_render(view)
}

spawn_gremlins = new Action("Spawn Gremlins", spawn_the_gremlins)
clear_gremlins = new Action("Clear Gremlins", clear_the_gremlins)
duplicate_gremlins = new Action("Duplicate Gremlins", duplicate_the_gremlins)
toggle_autoduplicate = new Action("Toggle Autoduplicate", toggle_the_autoduplicate)
clear_houses = new Action("Clear Houses", clear_the_houses)


actions = []
actions.push(duplicate_gremlins)
actions.push(toggle_autoduplicate)
actions.push(spawn_gremlins)
actions.push(clear_gremlins)
actions.push(clear_houses)


function update_render(view) {
	view.clear()
	houses.forEach((h) => {
		h.draw_roads(view)
	})
	houses.forEach((h) => {
		h.draw(view)
	})
}

// function set_toggle(toggle, value) {

// }

function set_mode(new_mode, view, mode_display) {
	mode_display.innerHTML = "mode: " + new_mode.mode_name
	view.canvas.onclick = (e) => {
		new_mode.canvas_onclick(e, view)
	}
}

function create_button(name, todo) {
	btn = document.createElement("input")
	btn.type = "button"
	btn.value = name
	btn.onclick = todo
	return btn
}

function begin() {
	head = document.head
	title = document.createElement("title")
	title.innerHTML = "High-def Gremlins"
	head.appendChild(title)

	body = document.createElement("body")
	document.body = body

	mode_display = document.createElement("p")
	body.appendChild(mode_display)
	toggle_display = document.createElement("p")
	body.appendChild(toggle_display)

	const canvas = document.createElement("canvas")
	canvas.width = window.innerWidth * 0.7
	canvas.height = window.innerHeight * 0.7
	body.appendChild(canvas)

	view = new View(canvas)

	newline = document.createElement("p")
	body.appendChild(newline)

	modes.forEach((m) => {
		btn = create_button(m.mode_name, () => {
			set_mode(m, view, mode_display)
		})
		body.appendChild(btn)
	})

	a_pause_to_reflect_on_accomplishments = document.createElement("p")
	body.appendChild(a_pause_to_reflect_on_accomplishments)

	actions.forEach((a) => {
		btn = create_button(a.action_name, () => {
			a.handler(view, toggle_display)
		})
		body.appendChild(btn)
	})

	set_mode(modes[0], view, mode_display)
	toggle_the_autoduplicate(view, toggle_display)
}

window.onload = begin

///////////////////////////////////////////////////////////////////////////////

function Point2D(x, y) {
	this.x = x
	this.y = y
	this.distance2 = function(other) {
		return (this.x - other.x) ** 2 + (this.y - other.y) ** 2
	}
	this.minus = function(other) {
		return new Point2D(this.x - other.x, this.y - other.y)
	}
	this.normalize = function() {
		magnitude = Math.sqrt(this.x ** 2 + this.y ** 2)
		return new Point2D(this.x / magnitude, this.y / magnitude)
	}
	this.perpendicular = function() {
		return new Point2D(this.y, -this.x)
	}
	this.dot = function(other) {
		return this.x * other.x + this.y * other.y
	}
	return this
}

function View(canvas) {
	const ctx = canvas.getContext("2d");

	const width = canvas.width;
	const height = canvas.height;

	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	function draw_polygon(points, color, thickness, outline_color) {
		var stroked = false;
		var filled = true;

		if (typeof thickness !== 'undefined') {
			stroked = true;
			filled = false;
		}
		if (typeof outline_color !== 'undefined') {
			filled = true;
		} else {
			outline_color = color;
		}

		ctx.beginPath();
		last = points[points.length - 1];
		ctx.moveTo(last.x, last.y);
		points.forEach((p) => {
			ctx.lineTo(p.x, p.y);
		})

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		}

		if (stroked) {
			ctx.lineWidth = thickness;
			ctx.strokeStyle = outline_color;
			ctx.stroke();
		}
	}

	// defaults: no thick -> filled; no fill -> fill alpha/white
	function draw_circle(center, r, color, thickness, outline_color) {
		var stroked = false;
		var filled = true;

		if (typeof thickness !== 'undefined') {
			stroked = true;
			filled = false;
			r -= thickness;
		}
		if (typeof outline_color !== 'undefined') {
			filled = true;
		} else {
			outline_color = color;
		}

		ctx.beginPath();
		ctx.arc(center.x, center.y, r, 0, 2 * Math.PI);
		ctx.closePath();

		if (filled) {
			ctx.fillStyle = color;
			ctx.fill();
		}
		if (stroked) {
			ctx.lineWidth = thickness;
			ctx.strokeStyle = outline_color;
			ctx.stroke();
		}
	}

	function draw_line(start, end, color, thickness) {
		ctx.beginPath();
		ctx.moveTo(start.x, start.y); // ctx,moveTo(point1[0], point1[1]); 
		ctx.lineTo(end.x, end.y);
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.stroke();
	}

	function clear() {
		ctx.clearRect(0, 0, width, height);
	}

	function get_canvas_position_from_event(event) {
		rect = canvas.getBoundingClientRect()
		return new Point2D(event.clientX - rect.left, event.clientY - rect.top)
	}

	return {canvas, width, height, draw_circle, draw_line, draw_polygon, clear, get_canvas_position_from_event}
}