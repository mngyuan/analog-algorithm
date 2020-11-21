const randInt = (max) => Math.round(Math.random() * max);

let GRID_ROWS = 9;
let GRID_COLS = 9;
const CANVAS_W = 400;
const CANVAS_H = 400;
const BORDER = 40;
let GRID_W = CANVAS_W / (GRID_ROWS - 1);
let GRID_H = CANVAS_H / (GRID_COLS - 1);

function uniqBy(a, key = JSON.stringify) {
  // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
  var seen = {};
  return a.filter(function (item) {
    var k = key(item);
    return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  });
}

function rotatePoint(p, angle, center = [0, 0]) {
  const translatedP = [p[0] - center[0], p[1] - center[1]];
  const newP = [
    translatedP[0] * Math.cos(angle) - translatedP[1] * Math.sin(angle),
    translatedP[0] * Math.sin(angle) + translatedP[1] * Math.cos(angle),
  ];
  return [newP[0] + center[0], newP[1] + center[1]];
}

function intersect(p1, p2, p3, p4) {
  // from https://discourse.processing.org/t/check-if-line-intersects-a-polygon/16978/8
  uA =
    ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) /
    ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));
  uB =
    ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) /
    ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]));
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    secX = p1[0] + uA * (p2[0] - p1[0]);
    secY = p1[1] + uA * (p2[1] - p1[1]);
    return [secX, secY];
  }
}

function contains(formTemplate, p) {
  // from https://discourse.processing.org/t/check-if-line-intersects-a-polygon/16978/8
  // returns false for tangent points
  const [x, y] = p;
  let isInside = false;

  for (let i = 0; i < formTemplate.length; i++) {
    v1 = formTemplate[(i + 1) % formTemplate.length];
    v2 = formTemplate[i];

    if (v2[1] > y != v1[1] > y) {
      if (x < ((v1[0] - v2[0]) * (y - v2[1])) / (v1[1] - v2[1]) + v2[0]) {
        isInside = !isInside;
      }
    }
  }
  return isInside;
}

function formIntersect(formTemplate, p1, p2) {
  const intersectionPoints = formTemplate.reduce((agg, cur, i) => {
    intersection = intersect(
      cur,
      formTemplate[(i + 1) % formTemplate.length],
      p1,
      p2,
    );
    return intersection ? [...agg, intersection] : agg;
  }, []);
  // sometimes, the intersection occurs on a vertex, so it occurs on two lines
  // at once. we don't want to return the duplicates in this case
  return intersectionPoints.length > 2
    ? uniqBy(intersectionPoints)
    : intersectionPoints;
}

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
  // in this drawing of the grid, we actually care about the CELLS we're forming,
  // ie 9 grid ticks create 8 cells, so be mindful of this in calculation and use
  // GRID_COLS - 1
  stroke(255, 0, 0);
  for (let i = 0; i < GRID_ROWS; i++) {
    line(...gridToDrawCoord(0, i), ...gridToDrawCoord(GRID_COLS - 1, i));
    for (let j = 0; j < GRID_COLS; j++) {
      const midpt = gridToDrawCoord(j, i);
      line(
        midpt[0],
        Math.max(midpt[1] - GRID_H / 8, BORDER),
        midpt[0],
        Math.min(midpt[1] + GRID_H / 8, BORDER + GRID_H * (GRID_ROWS - 1)),
      );
    }
  }
}

function configGridToDrawCoord(
  grid_w = GRID_W,
  grid_h = GRID_H,
  offset_x = BORDER,
  offset_y = BORDER,
  rotate = 0,
  rotateCenter = [0, 0],
) {
  return (x, y) => {
    return rotatePoint(
      [x * grid_w + offset_x, y * grid_h + offset_y],
      rotate,
      rotateCenter,
    );
  };
}

function drawHatchGrid(angle) {
  strokeCap(ROUND);
  strokeWeight(6);
  stroke(0, 0, 255);
  const gtdc = configGridToDrawCoord(GRID_W, GRID_H, BORDER, BORDER, angle, [
    (CANVAS_W + BORDER * 2) / 2,
    (CANVAS_H + BORDER * 2) / 2,
  ]);
  for (let i = 1; i < GRID_ROWS - 1; i++) {
    line(...gtdc(0, i), ...gtdc(GRID_COLS - 1, i));
    for (let j = 1; j < GRID_COLS - 1; j++) {
      line(...gtdc(j, 0), ...gtdc(j, GRID_ROWS - 1));
    }
  }
}

const gridToDrawCoord = configGridToDrawCoord();

const ccw_transform = (x, y) => {
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
};

const formTemplates = [
  [
    [0, 0],
    [0, 8],
    [1, 8],
    [8, 4],
    [8, 0],
  ],
  [
    [0, 1],
    [6, 0],
    [8, 0],
    [8, 5],
    [7, 8],
    [1, 8],
    [0, 6],
  ],
  [
    [0, 3],
    [1, 0],
    [8, 0],
    [8, 7],
    [6, 8],
    [1, 8],
    [0, 7],
  ],
];

const formFromTemplate = (formTemplate) => ({
  fillColor,
  grid_rows,
  grid_cols,
  grid_w,
  grid_h,
  offset_x,
  offset_y,
}) => {
  const gtdc = configGridToDrawCoord(grid_w, grid_h, offset_x, offset_y);
  fill(...(Array.isArray(fillColor) ? fillColor : [fillColor]));
  noStroke();
  beginShape();
  formTemplate.forEach(([x, y]) => {
    vertex(...gtdc((x * (grid_cols - 1)) / 8, (y * (grid_rows - 1)) / 8));
  });
  endShape(CLOSE);
};

const forms = formTemplates.map(formFromTemplate);

const randomSeptaForm = () => {
  const xset = [randInt(4), 4 + randInt(4)];
  const lset = [randInt(4), 4 + randInt(4)];
  const rset = [randInt(4), 4 + randInt(4)];
  return formFromTemplate([
    [0, lset[0]],
    [randInt(8), 0],
    [8, rset[0]],
    [8, rset[1]],
    [xset[1], 8],
    [xset[0], 8],
    [0, lset[1]],
  ]);
};

const lineFormFromTemplate = (formTemplate) => ({
  strokeColor,
  grid_rows,
  grid_cols,
  grid_w,
  grid_h,
  offset_x,
  offset_y,
}) => {
  const gtdc = configGridToDrawCoord(grid_w, grid_h, offset_x, offset_y);
  const lines = [...Array(grid_cols).keys()].map((i) =>
    formIntersect(formTemplate, [i, 0], [i, grid_rows]),
  );
  const endlines = [...Array(grid_cols).keys()].map((i) =>
    formIntersect(formTemplate, [i + 1 / 3, 0], [i + 1 / 3, grid_rows]),
  );
  strokeWeight(1);
  stroke(...(Array.isArray(strokeColor) ? strokeColor : [strokeColor]));
  lines.forEach((formLine, i) => {
    if (endlines[i][0] && endlines[i][1]) {
      fill(...(Array.isArray(strokeColor) ? strokeColor : [strokeColor]));
      noStroke();
      beginShape();
      vertex(...gtdc(...formLine[0]));
      vertex(...gtdc(...formLine[1]));
      vertex(...gtdc(...endlines[i][1]));
      vertex(...gtdc(...endlines[i][0]));
      endShape(CLOSE);
    } else {
      line(...gtdc(...formLine[0]), ...gtdc(...formLine[1]));
    }
  });
};

// assume square grid
const INCREMENT = 1 / GRID_COLS;

const exercises = {
  '01.02.02': {
    draw: (() => {
      let [x1, y1] = [0, 0];
      let [x2, y2] = [0, GRID_COLS - 1];
      let [x3, y3] = [GRID_ROWS - 1, GRID_COLS - 1];
      return () => {
        background(0);
        fill(255, 0, 0);
        noStroke();
        beginShape();
        vertex(...gridToDrawCoord(x1, y1));
        vertex(...gridToDrawCoord(x2, y2));
        vertex(...gridToDrawCoord(x3, y3));
        endShape(CLOSE);

        [x1, y1] = ccw_transform(x1, y1);
        [x2, y2] = ccw_transform(x2, y2);
        [x3, y3] = ccw_transform(x3, y3);

        drawGrid();
      };
    })(),
  },
  '01.02.05': {
    draw: function () {
      background(255);
      forms[0]({fillColor: 0, grid_rows: 9, grid_cols: 9});
      drawLineGrid();
    },
  },
  '01.02.05a': {
    draw: (function () {
      let direction = false;
      return function () {
        exercises['01.02.05'].draw();
        if (GRID_COLS === 8 || GRID_COLS === 32) {
          direction = !direction;
        }
        if (direction) {
          GRID_COLS = GRID_COLS + 1;
          GRID_ROWS = GRID_ROWS + 1;
        } else {
          GRID_COLS = GRID_COLS - 1;
          GRID_ROWS = GRID_ROWS - 1;
        }
        GRID_W = CANVAS_W / (GRID_ROWS - 1);
        GRID_H = CANVAS_H / (GRID_COLS - 1);
      };
    })(),
  },
  '029': {
    designation: '01.02.05 isolated forms',
    draw: (() => {
      const grid_cells_col = GRID_COLS - 1;
      const grid_cells_row = GRID_ROWS - 1;
      let [x1, y1] = [0, grid_cells_row / 2 - grid_cells_row / 8];
      let [x2, y2] = [grid_cells_col / 2, 0];
      let [x3, y3] = [grid_cells_col, grid_cells_row / 2 + grid_cells_row / 8];
      let [x4, y4] = [grid_cells_col / 2 + grid_cells_col / 8, grid_cells_row];
      let [x5, y5] = [0, grid_cells_row - grid_cells_row / 8];
      return () => {
        background(255);
        fill(0);
        noStroke();
        beginShape();
        vertex(...gridToDrawCoord(x1, y1));
        vertex(...gridToDrawCoord(x2, y2));
        vertex(...gridToDrawCoord(x3, y3));
        vertex(...gridToDrawCoord(x4, y4));
        vertex(...gridToDrawCoord(x5, y5));
        endShape(CLOSE);
        drawLineGrid();
        [x1, y1] = ccw_transform(x1, y1);
        [x2, y2] = ccw_transform(x2, y2);
        [x3, y3] = ccw_transform(x3, y3);
        [x4, y4] = ccw_transform(x4, y4);
        [x5, y5] = ccw_transform(x5, y5);
      };
    })(),
  },
  '030': {
    designation: '01.02.05 isolated forms',
    draw: (() => {
      form2 = randomSeptaForm();
      return () => {
        background(255);
        forms[1]({
          fillColor: [255, 0, 0],
          grid_rows: 9,
          grid_cols: 9,
          grid_w: (GRID_W * 4) / 8,
          grid_h: (GRID_H * 4) / 8,
        });
        form2({
          fillColor: [255, 0, 0],
          grid_rows: 9,
          grid_cols: 9,
          grid_w: (GRID_W / 8) * 2,
          grid_h: (GRID_H / 8) * 2,
          offset_x: BORDER + GRID_W * 4,
        });
      };
    })(),
  },
  '030a': {
    designation: '01.02.05 isolated forms',
    draw: (() => {
      generatedForms = Array(4).fill(0).map(randomSeptaForm);
      return () => {
        GRID_COLS = 11;
        GRID_ROWS = 11;
        GRID_W = CANVAS_W / (GRID_ROWS - 1);
        GRID_H = CANVAS_H / (GRID_COLS - 1);
        background(255);
        forms[1]({
          fillColor: [255, 0, 0],
          grid_rows: 9,
          grid_cols: 9,
          grid_w: (GRID_W * 2) / 8,
          grid_h: (GRID_H * 2) / 8,
          offset_y: BORDER + GRID_H * 4,
        });
        for (let i = 1; i < 5; i++) {
          generatedForms[i - 1]({
            fillColor: 0,
            grid_rows: 9,
            grid_cols: 9,
            grid_w: (GRID_W * 2) / 8,
            grid_h: (GRID_H * 2) / 8,
            offset_x: BORDER + GRID_W * 2 * i,
            offset_y: BORDER + GRID_H * 4,
          });
        }
      };
    })(),
  },
};

const expansions = {
  putnam: {
    draw: () => {
      background(255);
      drawHatchGrid();
      drawHatchGrid(frameCount / 100);
    },
  },
  testLineForm: {
    draw: () => {
      const curForm = Math.floor(frameCount / 120) % forms.length;
      background(255);
      forms[curForm]({
        fillColor: [0, 0, 255],
        grid_rows: GRID_ROWS,
        grid_cols: GRID_COLS,
        grid_w: GRID_W,
        grid_h: GRID_H,
        offset_x: BORDER,
        offset_y: BORDER,
      });
      lineFormFromTemplate(formTemplates[curForm])({
        strokeColor: [255, 0, 0],
        grid_rows: GRID_ROWS,
        grid_cols: GRID_COLS,
        grid_w: GRID_W,
        grid_h: GRID_H,
        offset_x: BORDER,
        offset_y: BORDER,
      });
    },
  },
};

function draw() {
  //exercises['01.02.02'].draw();
  //exercises['01.02.05'].draw();
  //exercises['01.02.05a'].draw();
  //exercises['029'].draw();
  //exercises['030a'].draw();
  //expansions['putnam'].draw();
  expansions['testLineForm'].draw();
}
