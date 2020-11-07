const GRID_ROWS = 8;
const GRID_COLS = 8;
const CANVAS_W = 400;
const CANVAS_H = 400;
const BORDER = 40;
const GRID_W = CANVAS_W / GRID_ROWS;
const GRID_H = CANVAS_H / GRID_COLS;

function setup() {
  createCanvas(CANVAS_W + BORDER * 2, CANVAS_H + BORDER * 2);
}

function drawGrid() {
  // draw grid
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      stroke(255);
      point(i * GRID_W + GRID_W / 2 + BORDER, j * GRID_H + GRID_H / 2 + BORDER);
    }
  }
}

function gridToDrawCoord(x, y) {
  return [x * GRID_W + BORDER + GRID_W / 2, y * GRID_H + BORDER + GRID_H / 2];
}

// assume square grid
const INCREMENT = 1 / GRID_COLS;
function transform(x, y) {
  // bottom
  if (y == GRID_ROWS - 1) {
    // bottom right corner
    if (x == GRID_COLS - 1) {
      return [x, Math.max(0, y - INCREMENT)];
    }
    return [Math.min(x + INCREMENT, GRID_COLS - 1), y];
  }
  // right
  if (x == GRID_COLS - 1) {
    // top right corner
    if (y == 0) {
      return [Math.ma(0, x - INCREMENT), y];
    }
    return [x, Math.max(0, y - INCREMENT)];
  }
  if (y == 0) {
    // top left corner
    if (x == 0) {
      return [x, Math.min(y + INCREMENT, GRID_ROWS - 1)];
    }
    // top
    return [Math.max(0, x - INCREMENT), y];
  }
  // left
  if (x == 0) {
    // bottom left corner
    if (y == GRID_ROWS - 1) {
      return [Math.min(x + INCREMENT, GRID_COLS - 1), y];
    }
    return [x, Math.min(y + INCREMENT, GRID_ROWS - 1)];
  }
}

let [x1, y1] = [0, 0];
let [x2, y2] = [0, GRID_COLS - 1];
let [x3, y3] = [GRID_ROWS - 1, GRID_COLS - 1];

function draw() {
  background(0);
  fill(255, 0, 0);
  noStroke();
  beginShape();
  vertex(...gridToDrawCoord(x1, y1));
  vertex(...gridToDrawCoord(x2, y2));
  vertex(...gridToDrawCoord(x3, y3));
  endShape(CLOSE);

  [x1, y1] = transform(x1, y1);
  [x2, y2] = transform(x2, y2);
  [x3, y3] = transform(x3, y3);

  drawGrid();
}
