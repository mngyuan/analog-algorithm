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
  for (let i = 0; i < GRID_ROWS; i++) {
    for (let j = 0; j < GRID_COLS; j++) {
      stroke(255);
      point(...gridToDrawCoord(i, j));
    }
  }
}

function drawLineGrid() {
  stroke(255, 0, 0);
  for (let i = 0; i < GRID_ROWS; i++) {
    line(...gridToDrawCoord(0, i), ...gridToDrawCoord(GRID_COLS - 1, i));
    for (let j = 0; j < GRID_COLS; j++) {
      const midpt = gridToDrawCoord(j, i);
      line(
        midpt[0],
        Math.max(midpt[1] - GRID_H / 8, BORDER + GRID_H / 2),
        midpt[0],
        Math.min(
          midpt[1] + GRID_H / 8,
          BORDER + GRID_H / 2 + GRID_H * (GRID_ROWS - 1),
        ),
      );
    }
  }
}

function gridToDrawCoord(x, y) {
  return [x * GRID_W + BORDER + GRID_W / 2, y * GRID_H + BORDER + GRID_H / 2];
}

// assume square grid
const INCREMENT = 1 / GRID_COLS;

const exercises = {
  '01.02.02': {
    draw: (function () {
      let [x1, y1] = [0, 0];
      let [x2, y2] = [0, GRID_COLS - 1];
      let [x3, y3] = [GRID_ROWS - 1, GRID_COLS - 1];
      return function () {
        background(0);
        fill(255, 0, 0);
        noStroke();
        beginShape();
        vertex(...gridToDrawCoord(x1, y1));
        vertex(...gridToDrawCoord(x2, y2));
        vertex(...gridToDrawCoord(x3, y3));
        endShape(CLOSE);

        [x1, y1] = this.transform(x1, y1);
        [x2, y2] = this.transform(x2, y2);
        [x3, y3] = this.transform(x3, y3);

        drawGrid();
      };
    })(),
    transform: function (x, y) {
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
          return [Math.max(0, x - INCREMENT), y];
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
    },
  },
  '01.02.05': {
    draw: function () {
      background(255);
      fill(0);
      noStroke();
      beginShape();
      vertex(...gridToDrawCoord(0, 0));
      vertex(...gridToDrawCoord(0, GRID_ROWS - 1));
      vertex(...gridToDrawCoord(GRID_COLS / 8, GRID_ROWS - 1));
      vertex(...gridToDrawCoord(GRID_COLS - 1, GRID_ROWS / 2));
      vertex(...gridToDrawCoord(GRID_COLS - 1, 0));
      endShape(CLOSE);
      drawLineGrid();
    },
  },
};

function draw() {
  exercises['01.02.02'].draw();
  exercises['01.02.05'].draw();
}
