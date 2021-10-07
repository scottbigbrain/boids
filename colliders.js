// much thanks to Jeff Thompson for his guide on this https://jeffreythompson.org/collision-detection/


class Circle {
	constructor(x, y, r) {
		this.loc = createVector(x, y);
		this.r = r;
	}

	collidingPoint(point) {
		return this.loc.dist(point) < this.r;
	}

	collidingCircle(c) {
		return this.loc.dist(c.loc) < this.r + c.r;
	}

	collidingRect(rect) {
		let testX = this.loc.x;
		let testY = this.loc.y;

		if (this.loc.x < rect.left) {
			testX = rect.left;
		} else if (this.loc.x > rect.right) {
			testX = rect.right;
		}

		if (this.loc.y < rect.top) {
			testY = rect.top;
		} else if (this.loc.y > rect.bottom) {
			testY = rect.bottom;
		}

		// console.log(this.loc.dist(createVector(testX, testY)));

		if (this.loc.dist(createVector(testX, testY)) < this.r) {
			return true;
		}
		return false;
	}

	collidingLine(line) {
		if (this.collidingPoint(line.p1) || this.collidingPoint(line.p2)) {
			return true;
		}

		if (this.loc.x+this.r > line.p1.x && this.loc.x-this.r < line.p2.x) {
			// dot product stoofs to find nearest point of line and check intersection
			let line_v = line.p2.copy().sub(line.p1);
			let c_v = line.p1.copy().sub(this.loc);
			let dot = line_v.dot(c_v);
			let test_mag = dot / line_v.mag();

			let test_v = line_v.copy().setMag(-test_mag);
			let test_p = test_v.copy().add(line.p1);
			return this.collidingPoint(test_p);
		}
		return false;
	}

	colliding(foo) {
		let type = foo.constructor.name;
		if (type == "Line") {
			return this.collidingLine(foo);
		} else if (type == "Circle") {
			return this.collidingCircle(foo);
		} else if (type == "Point") {
			return this.collidingPoint(foo);
		}
	}

	normal(point) {
		return point.copy().sub(this.loc).normalize();
	}

	handleCollision(collider) {
		if (collider.constructor.name == "Circle") {
			let normal = this.normal(collider.loc);
			let overlap = this.r - this.loc.dist(collider.loc);
			return normal.mult(overlap + collider.r + 0.1);
		}
	}
}


class Line {
	constructor(x1, y1, x2, y2, buffer=0.5) {
		if (x1 <= x2) {
			this.p1 = createVector(x1, y1);
			this.p2 = createVector(x2, y2);
		} else {
			this.p1 = createVector(x2, y2);
			this.p2 = createVector(x1, y1);
		}
		this.length = this.p1.dist(this.p2);

		this.buffer = buffer;
		this.line_v = this.p2.copy().sub(this.p1).normalize();
		this.center = this.p1.copy().add(this.line_v.copy().div(2));
	}

	collidingPoint(point) {
		let total_dist = this.p1.dist(point) + this.p2.dist(point);
		if (total_dist >= this.length && total_dist <= this.length + this.buffer) {
			return true;
		}
		return false;
	}

	// explaination thing: https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect
	collidingLine(line) {
		let q = this.p1.copy();
		let p = line.p1.copy();

		let s = this.p2.copy().sub(this.p1);
		let r = line.p2.copy().sub(line.p1);

		let r_cross_s = cross(r, s);
		let t = cross(q.copy().sub(p), r) / r_cross_s;
		let u = cross(q.copy().sub(p), s) / r_cross_s;

		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return true;
		}
		return false;
	}

	collidingCircle(c) {
		return c.collidingLine(this);
	}

	colliding(foo) {
		let type = foo.constructor.name;
		if (type == "Line") {
			return this.collidingLine(foo);
		} else if (type == "Circle") {
			return this.collidingCircle(foo);
		} else if (type == "Point") {
			return this.collidingPoint(foo);
		}
	}

	normal(point) {
		let normal = createVector(this.line_v.y, -this.line_v.x);
		let cen = this.p1.copy().add(this.line_v.copy().div(2));
		let foo = normal.dot(this.center.copy().sub(point));
		if (foo <= 0) normal.mult(-1);
		return normal;
	}

	handleCollision(collider) {
		if (collider.constructor.name == "Circle") {
			let normal = this.normal(collider.loc);
			let overlap = collider.r - normal.dot(this.center.copy().sub(collider.loc));
			return normal.mult(this.buffer + overlap + 0.1).mult(-1);
		}
	}
}

function cross(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}







class Rect {
	constructor(x, y, w, h) {
		this.loc = createVector(x, y);
		this.w = w;
		this.h = h;

		this.center = this.loc.copy().add(createVector(this.w/2, this.h/2));
		this.right = this.loc.x;
		this.left = this.loc.x + this.w;
		this.top = this.loc.y;
		this.bottom = this.loc.y + this.h;
	}

	collidingPoint(point) {
		if (point.x > this.right &&
			point.x < this.left &&
			point.y > this.top &&
			point.y < this.bottom) {
			return true;
		}
		return false;
	}

	collidingCircle(c) {
		return c.collidingRect(this);
	}

	collidingRect(rect) {
		if (this.right  > rect.left   &&
			this.left   < rect.right  &&
			this.top    > rect.bottom &&
			this.bottom < rect.top      ) {
			return true;
		}
		return false;
	}
}
