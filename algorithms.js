/**
 * WealthViz Pro — Data Visualization Algorithms Engine
 * 
 * Implements low-level rasterization and mathematical algorithms from scratch:
 * 1. Bresenham's Line Drawing Algorithm (Integer-only incremental rasterizer)
 * 2. Midpoint Circle Algorithm (8-way symmetry integer stepping)
 * 3. de Casteljau's Algorithm for Cubic Bézier Curves (recursive linear interpolation)
 * 4. 2D 3×3 Homogeneous Transformation Matrices (Translation, Rotation, Scale)
 * 5. Cohen–Sutherland Line Clipping Algorithm (Outcode region bitmask clipping)
 */

class CGAlgorithms {
  /**
   * Bresenham's Line Algorithm
   * Plots straight lines on canvas using pure integer decision variables.
   * Can plot single pixels or scaled pixel blocks.
   */
  static bresenhamLine(ctx, x0, y0, x1, y1, color = "#00e676", pixelSize = 1) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    if (ctx && ctx.save) ctx.save();
    if (ctx) ctx.fillStyle = color;

    const points = [];
    while (true) {
      if (ctx && ctx.fillRect) {
        if (pixelSize === 1) {
          ctx.fillRect(x0, y0, 1, 1);
        } else {
          ctx.fillRect(x0 * pixelSize, y0 * pixelSize, pixelSize, pixelSize);
        }
      }
      points.push({ x: x0, y: y0 });

      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    if (ctx && ctx.restore) ctx.restore();
    return points;
  }

  /**
   * Midpoint Circle Algorithm (Bresenham's Circle)
   * Rasterizes circles with 8-way octant symmetry using only integer arithmetic.
   */
  static midpointCircle(ctx, cx, cy, radius, color = "#40c4ff", pixelSize = 1) {
    cx = Math.round(cx);
    cy = Math.round(cy);
    radius = Math.round(radius);

    let x = 0;
    let y = radius;
    let d = 1 - radius; // Initial decision parameter

    if (ctx && ctx.save) ctx.save();
    if (ctx) ctx.fillStyle = color;

    const plotSymmetric = (px, py) => {
      const octants = [
        [cx + px, cy + py], [cx - px, cy + py],
        [cx + px, cy - py], [cx - px, cy - py],
        [cx + py, cy + px], [cx - py, cy + px],
        [cx + py, cy - px], [cx - py, cy - px]
      ];
      for (let i = 0; i < 8; i++) {
        const ox = octants[i][0];
        const oy = octants[i][1];
        if (ctx && ctx.fillRect) {
          if (pixelSize === 1) {
            ctx.fillRect(ox, oy, 1, 1);
          } else {
            ctx.fillRect(ox * pixelSize, oy * pixelSize, pixelSize, pixelSize);
          }
        }
      }
    };

    plotSymmetric(x, y);

    while (x < y) {
      x++;
      if (d < 0) {
        d += 2 * x + 1;
      } else {
        y--;
        d += 2 * (x - y) + 1;
      }
      plotSymmetric(x, y);
    }

    if (ctx && ctx.restore) ctx.restore();
  }

  /**
   * de Casteljau's Algorithm for Cubic Bézier Curve
   * Recursively evaluates polynomial curve point at parameter t in [0, 1].
   * Also returns intermediate construction points for visualization.
   */
  static deCasteljau(p0, p1, p2, p3, t) {
    const lerp = (a, b, factor) => ({
      x: (1 - factor) * a.x + factor * b.x,
      y: (1 - factor) * a.y + factor * b.y
    });

    // Level 1: 3 points
    const q0 = lerp(p0, p1, t);
    const q1 = lerp(p1, p2, t);
    const q2 = lerp(p2, p3, t);

    // Level 2: 2 points
    const r0 = lerp(q0, q1, t);
    const r1 = lerp(q1, q2, t);

    // Level 3: Point on cubic curve
    const b = lerp(r0, r1, t);

    return {
      point: b,
      level1: [q0, q1, q2],
      level2: [r0, r1]
    };
  }

  /**
   * Draws a complete cubic Bézier curve via de Casteljau sampling
   */
  static drawBezierDeCasteljau(ctx, p0, p1, p2, p3, steps = 80, color = "#ff80ab") {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();

    const start = this.deCasteljau(p0, p1, p2, p3, 0).point;
    ctx.moveTo(start.x, start.y);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const pt = this.deCasteljau(p0, p1, p2, p3, t).point;
      ctx.lineTo(pt.x, pt.y);
    }

    ctx.stroke();
    ctx.restore();
  }

  /**
   * Cohen–Sutherland Line Clipping Algorithm
   * Clips a line segment against an axis-aligned rectangular viewport.
   */
  static cohenSutherlandClip(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
    const INSIDE = 0; // 0000
    const LEFT = 1;   // 0001
    const RIGHT = 2;  // 0010
    const BOTTOM = 4; // 0100
    const TOP = 8;    // 1000

    const computeOutCode = (x, y) => {
      let code = INSIDE;
      if (x < xmin) code |= LEFT;
      else if (x > xmax) code |= RIGHT;
      if (y < ymin) code |= BOTTOM;
      else if (y > ymax) code |= TOP;
      return code;
    };

    let code0 = computeOutCode(x0, y0);
    let code1 = computeOutCode(x1, y1);
    let accept = false;

    while (true) {
      if ((code0 | code1) === 0) {
        // Trivial accept: both endpoints inside rectangle
        accept = true;
        break;
      } else if ((code0 & code1) !== 0) {
        // Trivial reject: both endpoints share outside zone
        break;
      } else {
        // Line needs clipping. Pick outside point.
        let x, y;
        const outcodeOut = code0 !== 0 ? code0 : code1;

        if (outcodeOut & TOP) {
          x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
          y = ymax;
        } else if (outcodeOut & BOTTOM) {
          x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
          y = ymin;
        } else if (outcodeOut & RIGHT) {
          y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
          x = xmax;
        } else if (outcodeOut & LEFT) {
          y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
          x = xmin;
        }

        if (outcodeOut === code0) {
          x0 = x;
          y0 = y;
          code0 = computeOutCode(x0, y0);
        } else {
          x1 = x;
          y1 = y;
          code1 = computeOutCode(x1, y1);
        }
      }
    }

    return accept ? { visible: true, x0, y0, x1, y1 } : { visible: false };
  }
}

/**
 * 2D Homogeneous Transformation Matrix (3×3)
 * M = [ m00  m01  m02 ]
 *     [ m10  m11  m12 ]
 *     [ m20  m21  m22 ]
 */
class Matrix3x3 {
  constructor(elements) {
    this.elements = elements || [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ];
  }

  static identity() {
    return new Matrix3x3();
  }

  static translation(tx, ty) {
    return new Matrix3x3([
      1, 0, tx,
      0, 1, ty,
      0, 0, 1
    ]);
  }

  static rotation(radians) {
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    return new Matrix3x3([
      c, -s, 0,
      s,  c, 0,
      0,  0, 1
    ]);
  }

  static scaling(sx, sy) {
    return new Matrix3x3([
      sx,  0, 0,
       0, sy, 0,
       0,  0, 1
    ]);
  }

  multiply(b) {
    const a = this.elements;
    const be = b.elements;
    const r = new Array(9);

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        r[row * 3 + col] =
          a[row * 3 + 0] * be[0 * 3 + col] +
          a[row * 3 + 1] * be[1 * 3 + col] +
          a[row * 3 + 2] * be[2 * 3 + col];
      }
    }

    return new Matrix3x3(r);
  }

  transformPoint(x, y) {
    const e = this.elements;
    const newX = e[0] * x + e[1] * y + e[2] * 1;
    const newY = e[3] * x + e[4] * y + e[5] * 1;
    const w = e[6] * x + e[7] * y + e[8] * 1 || 1;
    return { x: newX / w, y: newY / w };
  }

  toFormattedString() {
    const e = this.elements.map(v => v.toFixed(2).padStart(6));
    return [
      `[ ${e[0]}  ${e[1]}  ${e[2]} ]`,
      `[ ${e[3]}  ${e[4]}  ${e[5]} ]`,
      `[ ${e[6]}  ${e[7]}  ${e[8]} ]`
    ].join("\n");
  }
}

/**
 * Interactive Data Visualization Algorithms Lab Controller
 * Drives live interactive visualizers for Bresenham, Midpoint Circle,
 * de Casteljau's Bézier, and Cohen-Sutherland clipping.
 */
class AlgorithmsVisualizer {
  constructor() {
    this.bresenhamP0 = { x: 3, y: 3 };
    this.bresenhamP1 = { x: 23, y: 13 };
    this.circleRadius = 18;
    this.bezierT = 0.5;
    this.clipP0 = { x: 30, y: 150 };
    this.clipP1 = { x: 260, y: 30 };

    this._bindControls();
    this.renderAll();
  }

  _bindControls() {
    const tSlider = document.getElementById("algoBezierTSlider");
    if (tSlider) {
      tSlider.oninput = (e) => {
        this.bezierT = Number(e.target.value) / 100;
        this.renderBezier();
      };
    }

    const rSlider = document.getElementById("algoCircleRSlider");
    if (rSlider) {
      rSlider.oninput = (e) => {
        this.circleRadius = Number(e.target.value);
        this.renderCircle();
      };
    }
  }

  renderAll() {
    this.renderBresenham();
    this.renderCircle();
    this.renderBezier();
    this.renderClipping();
  }

  renderBresenham() {
    const cv = document.getElementById("cvAlgoBresenham");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);

    const cellSize = 12;
    const cols = Math.floor(w / cellSize);
    const rows = Math.floor(h / cellSize);

    // Draw background grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath(); ctx.moveTo(c * cellSize, 0); ctx.lineTo(c * cellSize, h); ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * cellSize); ctx.lineTo(w, r * cellSize); ctx.stroke();
    }

    // Run Bresenham line algorithm
    const pts = CGAlgorithms.bresenhamLine(
      ctx,
      this.bresenhamP0.x, this.bresenhamP0.y,
      this.bresenhamP1.x, this.bresenhamP1.y,
      "rgba(0, 230, 118, 0.75)",
      cellSize
    );

    // Overlay ideal continuous mathematical line
    ctx.strokeStyle = "rgba(255, 215, 64, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo((this.bresenhamP0.x + 0.5) * cellSize, (this.bresenhamP0.y + 0.5) * cellSize);
    ctx.lineTo((this.bresenhamP1.x + 0.5) * cellSize, (this.bresenhamP1.y + 0.5) * cellSize);
    ctx.stroke();

    // Telemetry label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`Bresenham Line: (${this.bresenhamP0.x},${this.bresenhamP0.y}) to (${this.bresenhamP1.x},${this.bresenhamP1.y}) | Pixels: ${pts.length}`, 8, 14);
  }

  renderCircle() {
    const cv = document.getElementById("cvAlgoCircle");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);

    const cellSize = 6;
    const cx = Math.floor(w / (2 * cellSize));
    const cy = Math.floor(h / (2 * cellSize));

    // Run custom Midpoint Circle
    CGAlgorithms.midpointCircle(ctx, cx, cy, this.circleRadius, "#40c4ff", cellSize);

    // Center point & axes
    ctx.fillStyle = "#ffd740";
    ctx.fillRect(cx * cellSize - 2, cy * cellSize - 2, 4, 4);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`Midpoint Circle (8-Way Octant Symmetry): Radius = ${this.circleRadius}`, 8, 14);
  }

  renderBezier() {
    const cv = document.getElementById("cvAlgoBezier");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);

    const p0 = { x: 30, y: 150 };
    const p1 = { x: 80, y: 30 };
    const p2 = { x: 200, y: 40 };
    const p3 = { x: 260, y: 140 };

    // 1. Draw control polygon
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    // 2. Draw full cubic curve using custom de Casteljau
    CGAlgorithms.drawBezierDeCasteljau(ctx, p0, p1, p2, p3, 60, "#ff80ab");

    // 3. Evaluate and draw intermediate construction lines for parameter t
    const res = CGAlgorithms.deCasteljau(p0, p1, p2, p3, this.bezierT);

    // Level 1 construction lines (Q0-Q1, Q1-Q2)
    ctx.strokeStyle = "rgba(64, 196, 255, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(res.level1[0].x, res.level1[0].y);
    ctx.lineTo(res.level1[1].x, res.level1[1].y);
    ctx.lineTo(res.level1[2].x, res.level1[2].y);
    ctx.stroke();

    // Level 2 construction line (R0-R1)
    ctx.strokeStyle = "rgba(0, 230, 118, 0.7)";
    ctx.beginPath();
    ctx.moveTo(res.level2[0].x, res.level2[0].y);
    ctx.lineTo(res.level2[1].x, res.level2[1].y);
    ctx.stroke();

    // Curve point B(t)
    ctx.fillStyle = "#ffd740";
    ctx.beginPath();
    ctx.arc(res.point.x, res.point.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Control point circles
    [p0, p1, p2, p3].forEach((p, idx) => {
      ctx.fillStyle = "#b388ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(`de Casteljau Algorithm: Parameter t = ${this.bezierT.toFixed(2)}`, 8, 14);
  }

  renderClipping() {
    const cv = document.getElementById("cvAlgoClip");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    ctx.clearRect(0, 0, w, h);

    const xmin = 60, ymin = 40, xmax = 220, ymax = 140;

    // Viewport window
    ctx.fillStyle = "rgba(64, 196, 255, 0.08)";
    ctx.fillRect(xmin, ymin, xmax - xmin, ymax - ymin);
    ctx.strokeStyle = "#40c4ff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

    // Outcode region labels
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "8px monospace";
    ctx.fillText("1001", 15, 25);
    ctx.fillText("1000", 130, 25);
    ctx.fillText("1010", 235, 25);
    ctx.fillText("0001", 15, 95);
    ctx.fillText("0000 [INSIDE]", 105, 95);
    ctx.fillText("0010", 235, 95);

    // Multiple test line segments
    const lines = [
      { x0: 20, y0: 160, x1: 260, y1: 20 },
      { x0: 30, y0: 30, x1: 180, y1: 155 },
      { x0: 240, y0: 50, x1: 270, y1: 130 } // Trivial reject
    ];

    lines.forEach(line => {
      // Draw original unclipped line (faint red)
      ctx.strokeStyle = "rgba(255, 82, 82, 0.4)";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(line.x0, line.y0);
      ctx.lineTo(line.x1, line.y1);
      ctx.stroke();
      ctx.setLineDash([]);

      // Run Cohen-Sutherland Clipping
      const clipped = CGAlgorithms.cohenSutherlandClip(line.x0, line.y0, line.x1, line.y1, xmin, ymin, xmax, ymax);
      if (clipped.visible) {
        ctx.strokeStyle = "#00e676";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(clipped.x0, clipped.y0);
        ctx.lineTo(clipped.x1, clipped.y1);
        ctx.stroke();

        ctx.fillStyle = "#ffd740";
        ctx.beginPath(); ctx.arc(clipped.x0, clipped.y0, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(clipped.x1, clipped.y1, 3, 0, Math.PI * 2); ctx.fill();
      }
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText("Cohen–Sutherland Line Clipping (Outcodes)", 8, 14);
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.CGAlgorithms = CGAlgorithms;
  window.Matrix3x3 = Matrix3x3;
  window.AlgorithmsVisualizer = AlgorithmsVisualizer;
}

