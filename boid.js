class Boid {
	constructor(x, y, seperation=0.8, alignment=0.006, cohesion=0.007, obstacle_avoid=1) {
		this.loc = createVector(x,y);
		this.vel = p5.Vector.random2D().mult(3);
		this.acl = createVector();
		this.desired_vel = this.vel.copy();

		this.max_force = 0.6;
		this.max_vel = 3;
		this.goal = createVector(random(width), random(height));

		this.seperation = seperation;
		this.alignment = alignment;
		this.cohesion = cohesion;
		this.obstacle_avoid = obstacle_avoid;

		this.veiw_size = 100;
		this.veiw_angle = 2*PI/3;
		this.size = 12;
		this.turn_dir = random([0,1]);

		this.collider = new Circle(this.loc.x, this.loc.y, this.size/2);
		this.vision = new Circle(this.loc.x, this.loc.y, this.veiw_size);
	}

	update() {
		this.flock();
		this.obstacleAvoidance();
		this.steer();

		this.collisionHandling();

		this.vel.add(this.acl);
		this.vel.limit(this.max_vel);
		this.loc.add(this.vel);
		this.acl.mult(0);

		this.collider = new Circle(this.loc.x, this.loc.y, this.size/2);
		this.vision = new Circle(this.loc.x, this.loc.y, this.veiw_size);

		if (random() < 0.01) this.turn_dir *= -1;
	}

	flock() {
		this.desired_vel = this.vel.copy();
		let near = this.nearBoids();

		if (near.length > 0) {
			// Do Seperation
			for (let boid of near) {
				let to_boid = boid.loc.copy().sub(this.loc);
				to_boid.setMag(min(1/to_boid.mag(), this.max_vel)).mult(-this.seperation);
				this.desired_vel.add(to_boid);
			}
			this.desired_vel.limit(this.max_vel);

			// Do Alignment and try move heading slightly to match average velocity angle of neighbors
			let avg_ang = 0;
			for (let boid of near) {
				avg_ang += boid.vel.heading();
			}
			avg_ang /= near.length;
			this.desired_vel.rotate((avg_ang - this.vel.heading()) * -this.alignment);
			this.desired_vel.limit(this.max_vel);

			// Do Cohesion
			let mid = createVector();
			for (let boid of near) {
				mid.add(boid.loc);
			}
			mid.div(near.length);
			this.desired_vel.add(mid.copy().sub(this.loc).mult(this.cohesion));
			this.desired_vel.limit(this.max_vel);
		}

	}

	steer() {
		let change = this.desired_vel.copy().sub(this.vel);
		change.limit(this.max_force);
		this.acl.add(change);
	}

	nearBoids() {
		let near = [];
		for (let boid of flock) {
			if (this.inVision(boid.loc)) near.push(boid);
		}
		return near;
	}

	inVision(point) {
		if (this.loc.dist(point) < this.veiw_size) {
				let angle = abs(this.vel.heading() - point.copy().sub(this.loc).heading());
				if (angle < this.veiw_angle) return true;
		}
		return false;
	}

	nearObstacles() {
		let near = [];
		for (let obstacle of obstacles) {
			if (this.vision.colliding(obstacle)) near.push(obstacle);
		}
		return near;
	}

	obstacleAvoidance() {
		let near = this.nearObstacles();
		if (near.length == 0) return false;

		let dodge = false;

		let probe_num = 11; // plz make odd
		let unit = this.veiw_angle / (probe_num/2);
		let probe_v = this.vel.copy().setMag(this.veiw_size);
		let probe;

		for (let i = 0; i < probe_num; i++) {
			let probe_p = this.loc.copy().add(probe_v);
			probe = new Line(this.loc.x, this.loc.y, probe_p.x, probe_p.y);

			// stroke(200,150,150);
			// strokeWeight(0.5);
			// line(probe.p1.x, probe.p1.y, probe.p2.x, probe.p2.y);

			let is_clear = true;
			for (let obstacle of near) {
				if (probe.colliding(obstacle)) is_clear = false;
			}

			if (is_clear && i == 0) {
				dodge = false;
				break;
			} else if (is_clear) {
				dodge = true;
				break;
			}

			let sign = (i%2==this.turn_dir)*2 - 1;  // 1 if i is divisable by 2, -1 else
			let angle = sign * i * unit;

			probe_v.setHeading(this.vel.heading() + angle);
		}

		if (dodge) {
			let angle_dif = probe_v.heading() - this.desired_vel.heading();
			this.desired_vel.rotate(angle_dif * this.obstacle_avoid);
			this.desired_vel.limit(this.max_vel);
		}

		return true;
	}

	collisionHandling() {
		let near = this.nearObstacles();
		if (near.length == 0) return false;

		for (let obstacle of near) {
			if (this.collider.colliding(obstacle)) {
				let normal = obstacle.normal(this.loc);
				this.vel.reflect(normal);
				this.loc.add(obstacle.handleCollision(this.collider));

				// this.loc.add(normal.copy().setMag(this.size));
				// this.vel.mult(0.5);
			}
		}
		return true;
	}

	draw(special=false) {
		fill(200, 200, 220, 200);
		stroke(250);
		strokeWeight(1);

		push();
		translate(this.loc.x, this.loc.y);
		rotate(this.vel.heading());

		if (special) {
			fill(250, 50);
			stroke(0);
			strokeWeight(0.5);
			arc(0, 0, 2*this.veiw_size, 2*this.veiw_size, -this.veiw_angle, this.veiw_angle);

			fill(200, 50, 50);
			stroke(250, 60, 60);
			strokeWeight(1);
		}

		// if (this.nearObstacles().length == 0) fill(0, 0, 0);
		triangle(this.size/2, 0, -this.size/2, this.size/3, -this.size/2, -this.size/3);
		pop();

		// fill(200);
		// noStroke();
		// circle(this.loc.x, this.loc.y, this.size*2);
	}
}
