let flock = [];
let center;

let box_d = 10;
let sides = [];
let obstacles = [];

let c;

let fr;

let m;
let last_m;
let draw_f = 3;


function setup() {
	createCanvas(1100, 900);
	center = createVector(width/2, height/2);
	m = createVector(mouseX, mouseY);
	last_m = createVector(mouseX, mouseY);

	obstacles.push(new Line(box_d    , box_d     , width-box_d, box_d     ));
	obstacles.push(new Line(width-box_d, box_d    , width-box_d, height-box_d));
	obstacles.push(new Line(width-box_d, height-box_d, box_d    , height-box_d));
	obstacles.push(new Line(box_d    , height-box_d, box_d    , box_d     ));

	// obstacles.push(new Line(200, 200, 600, 600));
	// obstacles.push(new Circle(400, 400, 100));

	obstacles.push(new Line(0, 0, 10, 10));

		for (let i = 0; i < 75; i++) {
			flock.push(new Boid(random(box_d, width-box_d), random(box_d, height-box_d)));
		}

	c = new Circle(0, 0, 60);
}

function draw() {
	background(40);

	m = createVector(mouseX, mouseY);
	if (frameCount%draw_f == 0 && mouseIsPressed && m.x > 0 && m.x < width && m.y > 0 && m.y < height) {
		// obstacles.push(new Line(last_m.x, last_m.y, m.x, m.y));
		obstacles.push(new Circle(m.x, m.y, 8));
	}

	for (let boid of flock) {
		boid.update();
	}

	for (let i = 0; i < flock.length; i++) {
		if (i > 0) {
			flock[i].draw();
		} else {
			flock[i].draw(true);
		}
	}

	for (let foo of obstacles) {
		if (foo.constructor.name == "Line") {
			stroke(200, 100, 100, 200);
			strokeWeight(6);
			line(foo.p1.x, foo.p1.y, foo.p2.x, foo.p2.y);
		} else if (foo.constructor.name == "Circle") {
			noStroke();
			fill(200, 100, 100, 200);
			circle(foo.loc.x, foo.loc.y, foo.r*2);
		}
	}

	// c = new Circle(mouseX, mouseY, 60);
	// fill(50, 150);
	// stroke(0);
	// strokeWeight(1);
	// for (let obstacle of obstacles) {
	// 	if (c.colliding(obstacle)) fill(255, 150);
	// }
	// console.log(c.collidingLine(obstacles[1]))
	// circle(c.loc.x, c.loc.y, c.r*2);


	if (frameCount%6==0) fr = frameRate();
	fill(200);
	stroke(255);
	strokeWeight(2);
	textSize(24);
	textAlign(LEFT, TOP);
	text(floor(fr), 40, 40);

	if (frameCount%draw_f==0) last_m = m.copy();
}
