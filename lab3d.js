/**
 * WealthViz Pro — Object-Oriented 3D Computer Graphics Engine
 * 
 * Modular Classes:
 * 1. Vector3: 3D vector operations (dot, cross, normalize, lerp)
 * 2. Matrix4: 4×4 affine & projective transformation matrices
 * 3. Mesh & Subclasses: CubeMesh, PyramidMesh, OctahedronMesh, AxesMesh, CompanyPrismsMesh
 * 4. Camera: Perspective & Orthographic projection with dynamic FOV calculation
 * 5. Renderer3D: Lambertian diffuse lighting, Back-Face Culling, Painter's algorithm depth sorting
 * 6. Interactive3DLab: Interactive controller with zoom/FOV sliders, speed controls, and matrix telemetry
 */

// ==========================================
// 1. VECTOR3 CLASS
// ==========================================

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  sub(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  multiplyScalar(s) {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) || 1e-6;
  }

  normalize() {
    const len = this.length();
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  toArray() {
    return [this.x, this.y, this.z];
  }
}

// ==========================================
// 2. MATRIX4 CLASS (4×4 Homogeneous Matrix)
// ==========================================

class Matrix4 {
  constructor(elements) {
    this.elements = elements || [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static identity() {
    return new Matrix4();
  }

  static rotationX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
      1,  0,  0, 0,
      0,  c, -s, 0,
      0,  s,  c, 0,
      0,  0,  0, 1
    ]);
  }

  static rotationY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
       c, 0,  s, 0,
       0, 1,  0, 0,
      -s, 0,  c, 0,
       0, 0,  0, 1
    ]);
  }

  static rotationZ(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Matrix4([
      c, -s, 0, 0,
      s,  c, 0, 0,
      0,  0, 1, 0,
      0,  0, 0, 1
    ]);
  }

  static translation(tx, ty, tz) {
    return new Matrix4([
      1, 0, 0, tx,
      0, 1, 0, ty,
      0, 0, 1, tz,
      0, 0, 0,  1
    ]);
  }

  static scaling(sx, sy, sz) {
    return new Matrix4([
      sx,  0,  0, 0,
       0, sy,  0, 0,
       0,  0, sz, 0,
       0,  0,  0, 1
    ]);
  }

  multiply(b) {
    const a = this.elements;
    const be = b.elements;
    const r = new Array(16);

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        r[row * 4 + col] =
          a[row * 4 + 0] * be[0 * 4 + col] +
          a[row * 4 + 1] * be[1 * 4 + col] +
          a[row * 4 + 2] * be[2 * 4 + col] +
          a[row * 4 + 3] * be[3 * 4 + col];
      }
    }

    return new Matrix4(r);
  }

  transformVector3(v) {
    const e = this.elements;
    const x = e[0] * v.x + e[1] * v.y + e[2] * v.z + e[3];
    const y = e[4] * v.x + e[5] * v.y + e[6] * v.z + e[7];
    const z = e[8] * v.x + e[9] * v.y + e[10] * v.z + e[11];
    const w = e[12] * v.x + e[13] * v.y + e[14] * v.z + e[15] || 1;
    return new Vector3(x / w, y / w, z / w);
  }

  toFormattedGrid(dim = 3) {
    const e = this.elements;
    const rows = [];
    for (let r = 0; r < dim; r++) {
      const line = [];
      for (let c = 0; c < dim; c++) {
        line.push(e[r * 4 + c].toFixed(2).padStart(6));
      }
      rows.push(`[ ${line.join(" ")} ]`);
    }
    return rows.join("\n");
  }
}

// ==========================================
// 3. MESH CLASS & SUBCLASSES
// ==========================================

class Mesh {
  constructor(name = "Mesh") {
    this.name = name;
    this.vertices = [];
    this.edges = [];
    this.faces = [];
  }
}

class CubeMesh extends Mesh {
  constructor(s = 65) {
    super("Cube");
    this.vertices = [
      new Vector3(-s, -s, -s), new Vector3( s, -s, -s),
      new Vector3( s,  s, -s), new Vector3(-s,  s, -s),
      new Vector3(-s, -s,  s), new Vector3( s, -s,  s),
      new Vector3( s,  s,  s), new Vector3(-s,  s,  s)
    ];
    this.edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    this.faces = [
      { indices: [0, 1, 2, 3], baseRgb: [64, 196, 255] },
      { indices: [5, 4, 7, 6], baseRgb: [179, 136, 255] },
      { indices: [4, 0, 3, 7], baseRgb: [0, 230, 118] },
      { indices: [1, 5, 6, 2], baseRgb: [255, 215, 64] },
      { indices: [4, 5, 1, 0], baseRgb: [255, 128, 171] },
      { indices: [3, 2, 6, 7], baseRgb: [255, 171, 64] }
    ];
  }
}

class PyramidMesh extends Mesh {
  constructor(s = 65) {
    super("Pyramid");
    this.vertices = [
      new Vector3(-s, s * 0.7, -s),
      new Vector3( s, s * 0.7, -s),
      new Vector3( s, s * 0.7,  s),
      new Vector3(-s, s * 0.7,  s),
      new Vector3( 0, -s * 0.9, 0)
    ];
    this.edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4]
    ];
    this.faces = [
      { indices: [3, 2, 1, 0], baseRgb: [179, 136, 255] }, // Base
      { indices: [0, 1, 4], baseRgb: [64, 196, 255] },
      { indices: [1, 2, 4], baseRgb: [0, 230, 118] },
      { indices: [2, 3, 4], baseRgb: [255, 215, 64] },
      { indices: [3, 0, 4], baseRgb: [255, 128, 171] }
    ];
  }
}

class OctahedronMesh extends Mesh {
  constructor(s = 72) {
    super("Octahedron");
    this.vertices = [
      new Vector3( s,  0,  0), // 0: +X
      new Vector3(-s,  0,  0), // 1: -X
      new Vector3( 0,  s,  0), // 2: +Y
      new Vector3( 0, -s,  0), // 3: -Y
      new Vector3( 0,  0,  s), // 4: +Z
      new Vector3( 0,  0, -s)  // 5: -Z
    ];
    this.edges = [
      [0, 2], [2, 1], [1, 3], [3, 0],
      [0, 4], [1, 4], [2, 4], [3, 4],
      [0, 5], [1, 5], [2, 5], [3, 5]
    ];
    this.faces = [
      { indices: [0, 2, 4], baseRgb: [64, 196, 255] },
      { indices: [2, 1, 4], baseRgb: [179, 136, 255] },
      { indices: [1, 3, 4], baseRgb: [255, 128, 171] },
      { indices: [3, 0, 4], baseRgb: [255, 215, 64] },
      { indices: [2, 0, 5], baseRgb: [0, 230, 118] },
      { indices: [1, 2, 5], baseRgb: [64, 196, 255] },
      { indices: [3, 1, 5], baseRgb: [179, 136, 255] },
      { indices: [0, 3, 5], baseRgb: [255, 82, 82] }
    ];
  }
}

class AxesMesh extends Mesh {
  constructor(s = 90) {
    super("Axes");
    this.vertices = [
      new Vector3(0, 0, 0),
      new Vector3(s, 0, 0),
      new Vector3(0, -s, 0),
      new Vector3(0, 0, s)
    ];
    this.edges = [[0, 1], [0, 2], [0, 3]];
    this.faces = [];
  }
}

class CompanyPrismsMesh extends Mesh {
  constructor(companies = []) {
    super("Company Valuation Prisms");

    // Use TOP 8 companies by market cap
    const sorted = [...companies].sort((a, b) => b.marketCap - a.marketCap).slice(0, 8);
    const maxCap = sorted.length ? Math.max(...sorted.map(c => c.marketCap)) : 3500;

    const n = sorted.length || 8;
    const R = 75;
    const bw = 9;

    sorted.forEach((c, i) => {
      const ang = (i * 2 * Math.PI) / n;
      const cx = Math.cos(ang) * R;
      const cz = Math.sin(ang) * R;

      // Dynamic scale: scale height proportionally to maximum market cap
      const h = Math.max(22, (c.marketCap / maxCap) * 95);
      const b = this.vertices.length;

      // Base vertices at y = +45
      this.vertices.push(
        new Vector3(cx - bw, 45, cz - bw),
        new Vector3(cx + bw, 45, cz - bw),
        new Vector3(cx + bw, 45, cz + bw),
        new Vector3(cx - bw, 45, cz + bw)
      );

      // Top vertices at y = 45 - h (upward)
      this.vertices.push(
        new Vector3(cx - bw, 45 - h, cz - bw),
        new Vector3(cx + bw, 45 - h, cz - bw),
        new Vector3(cx + bw, 45 - h, cz + bw),
        new Vector3(cx - bw, 45 - h, cz + bw)
      );

      this.edges.push(
        [b + 0, b + 1], [b + 1, b + 2], [b + 2, b + 3], [b + 3, b + 0],
        [b + 4, b + 5], [b + 5, b + 6], [b + 6, b + 7], [b + 7, b + 4],
        [b + 0, b + 4], [b + 1, b + 5], [b + 2, b + 6], [b + 3, b + 7]
      );

      let baseColor = [64, 196, 255];
      if (c.sector === "Financial") baseColor = [179, 136, 255];
      else if (c.sector === "Consumer") baseColor = [255, 171, 64];
      else if (c.sector === "Automotive") baseColor = [255, 82, 82];
      else if (c.sector === "Energy") baseColor = [255, 215, 64];
      else if (c.sector === "Healthcare") baseColor = [255, 128, 171];

      const capLabel = c.marketCap >= 1000
        ? `$${(c.marketCap / 1000).toFixed(2)}T`
        : `$${c.marketCap.toFixed(0)}B`;

      this.faces.push(
        // Top face with ticker & valuation label
        { indices: [b + 4, b + 5, b + 6, b + 7], baseRgb: baseColor, ticker: `${c.ticker}\n${capLabel}` },
        // Side faces
        { indices: [b + 0, b + 1, b + 5, b + 4], baseRgb: baseColor },
        { indices: [b + 1, b + 2, b + 6, b + 5], baseRgb: baseColor },
        { indices: [b + 2, b + 3, b + 7, b + 6], baseRgb: baseColor },
        { indices: [b + 3, b + 0, b + 4, b + 7], baseRgb: baseColor }
      );
    });
  }
}

// ==========================================
// 4. CAMERA CLASS
// ==========================================

class Camera {
  constructor(options = {}) {
    this.distance = options.distance || 260; // Focal distance d
    this.isOrthographic = options.isOrthographic || false;
    this.orthoScale = options.orthoScale || 1.15;
  }

  getFovDegrees(viewportWidth = 460) {
    // Exact mathematical FOV derived from viewport width and focal distance d:
    // tan(FOV / 2) = (W / 2) / d  =>  FOV = 2 * atan(W / (2d))
    const halfW = viewportWidth / 2;
    return (2 * Math.atan(halfW / this.distance) * 180) / Math.PI;
  }

  setFovDegrees(fovDeg, viewportWidth = 460) {
    const fovRad = (fovDeg * Math.PI) / 180;
    const halfW = viewportWidth / 2;
    this.distance = halfW / Math.tan(fovRad / 2);
  }

  project(point3D, viewportWidth = 460, viewportHeight = 300) {
    const cx = viewportWidth / 2;
    const cy = viewportHeight / 2;
    const d = this.distance;

    if (this.isOrthographic) {
      // Parallel orthographic rays without depth division
      return {
        x: point3D.x * this.orthoScale + cx,
        y: point3D.y * this.orthoScale + cy,
        z: point3D.z,
        scale: 1.0
      };
    }

    // Perspective Projection with depth division (focal length f = d)
    const factor = d / (d + point3D.z);
    return {
      x: point3D.x * factor + cx,
      y: point3D.y * factor + cy,
      z: point3D.z,
      scale: factor
    };
  }
}

// ==========================================
// 5. RENDERER3D CLASS
// ==========================================

class Renderer3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.logicalW = 460;
    this.logicalH = 300;

    // CG Options
    this.showFaces = true;
    this.showEdges = true;
    this.showAxes = true;
    this.backFaceCulling = false;
    this.enableLighting = true;

    // Directional Light Vector (pointing down-forward from upper-right)
    this.lightVector = new Vector3(0.48, -0.72, -0.49).normalize();
  }

  render(mesh, camera, rotAngles) {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const logicalW = this.logicalW;
    const logicalH = this.logicalH;

    if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }

    const ctx = this.ctx;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const cx = logicalW / 2;
    const cy = logicalH / 2;

    // 1. COMPOSITE EULER ROTATION MATRIX
    // Execution order in pipeline: First Yaw Ry(φ), then Pitch Rx(θ), then Roll Rz(ψ)
    // Composite matrix M = Rz(ψ) * Rx(θ) * Ry(φ)
    const mRy = Matrix4.rotationY(rotAngles.y);
    const mRx = Matrix4.rotationX(rotAngles.x);
    const mRz = Matrix4.rotationZ(rotAngles.z);
    const mRot = mRz.multiply(mRx).multiply(mRy);

    // Background Reticle
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.moveTo(cx - 130, cy); ctx.lineTo(cx + 130, cy);
    ctx.moveTo(cx, cy - 130); ctx.lineTo(cx, cy + 130);
    ctx.stroke();

    // 2. TRANSFORM VERTICES TO CAMERA VIEW SPACE
    const worldTransformed = mesh.vertices.map(v => mRot.transformVector3(v));
    const projVertices = worldTransformed.map(v => camera.project(v, logicalW, logicalH));

    // 3. RENDER 3D RGB AXES
    if (this.showAxes) {
      ctx.save();
      const aLen = 75;
      const o = camera.project(mRot.transformVector3(new Vector3(0, 0, 0)), logicalW, logicalH);
      const px = camera.project(mRot.transformVector3(new Vector3(aLen, 0, 0)), logicalW, logicalH);
      const py = camera.project(mRot.transformVector3(new Vector3(0, -aLen, 0)), logicalW, logicalH);
      const pz = camera.project(mRot.transformVector3(new Vector3(0, 0, aLen)), logicalW, logicalH);

      const drawAxis = (p, color, label) => {
        ctx.beginPath();
        ctx.moveTo(o.x, o.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Safe isolated text alignment
        ctx.fillStyle = color;
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(label, p.x + 5, p.y);
      };

      drawAxis(px, "#ff5252", "+X");
      drawAxis(py, "#00e676", "+Y");
      drawAxis(pz, "#40c4ff", "+Z");
      ctx.restore();
    }

    // 4. FACE NORMALS, LAMBERTIAN LIGHTING & BACK-FACE CULLING
    if (this.showFaces && mesh.faces.length > 0) {
      const visibleFaces = [];

      mesh.faces.forEach(face => {
        const v0 = worldTransformed[face.indices[0]];
        const v1 = worldTransformed[face.indices[1]];
        const v2 = worldTransformed[face.indices[2]];

        // Cross Product for Face Normal Vector: N = (v1 - v0) × (v2 - v0)
        const u = v1.sub(v0);
        const v = v2.sub(v0);
        const normal = u.cross(v).normalize();

        // BACK-FACE CULLING CHECK:
        // In camera view space looking along +Z, a back-facing polygon satisfies normal.z >= 0
        if (this.backFaceCulling && normal.z >= 0) {
          return; // Cull back-facing polygon
        }

        // LAMBERTIAN DIFFUSE SHADING: Intensity = max(0, N · L)
        const dot = normal.dot(this.lightVector);
        const ambient = 0.28;
        const diffuse = 0.72;
        const intensity = this.enableLighting
          ? Math.max(ambient, Math.min(1.0, ambient + diffuse * Math.max(0, dot)))
          : 0.75;

        // Centroid depth Z for Painter's algorithm
        const avgZ = face.indices.reduce((sum, idx) => sum + projVertices[idx].z, 0) / face.indices.length;
        const avgX = face.indices.reduce((sum, idx) => sum + projVertices[idx].x, 0) / face.indices.length;
        const avgY = face.indices.reduce((sum, idx) => sum + projVertices[idx].y, 0) / face.indices.length;

        // Shaded RGB
        const [r, g, b] = face.baseRgb || [64, 196, 255];
        const shadedR = Math.round(r * intensity);
        const shadedG = Math.round(g * intensity);
        const shadedB = Math.round(b * intensity);
        const color = `rgba(${shadedR}, ${shadedG}, ${shadedB}, 0.88)`;

        visibleFaces.push({ ...face, avgZ, avgX, avgY, color, normal });
      });

      // Painter's Algorithm: Sort back-to-front by centroid depth
      visibleFaces.sort((a, b) => b.avgZ - a.avgZ);

      // Render rasterized faces and draw their border edges inline to fix depth occlusion!
      visibleFaces.forEach(face => {
        ctx.beginPath();
        face.indices.forEach((idx, i) => {
          const pt = projVertices[idx];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = face.color;
        ctx.fill();

        // Stroke face edges inside depth loop to respect occlusion!
        if (this.showEdges) {
          ctx.strokeStyle = "rgba(255,255,255,0.28)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Ticker & market cap label on top faces
        if (face.ticker) {
          ctx.save();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const lines = face.ticker.split("\n");
          if (lines.length > 1) {
            ctx.fillText(lines[0], face.avgX, face.avgY - 5);
            ctx.fillStyle = "#ffd740";
            ctx.fillText(lines[1], face.avgX, face.avgY + 5);
          } else {
            ctx.fillText(face.ticker, face.avgX, face.avgY);
          }
          ctx.restore();
        }
      });
    } else if (this.showEdges) {
      // Wireframe fallback mode
      ctx.lineWidth = 1.8;
      mesh.edges.forEach(edge => {
        const p1 = projVertices[edge[0]];
        const p2 = projVertices[edge[1]];
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, "#40c4ff");
        grad.addColorStop(1, "#b388ff");
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
    }

    // Vertex points (drawn only in wireframe mode or front-most)
    if (!this.showFaces && this.showEdges) {
      projVertices.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1.8, 3.0 * pt.scale), 0, Math.PI * 2);
        ctx.fillStyle = "#ffd740";
        ctx.fill();
      });
    }

    ctx.restore();

    return {
      rotMatrices: { mRy, mRx, mRz, mRot },
      verticesCount: mesh.vertices.length,
      facesCount: mesh.faces.length
    };
  }
}

// ==========================================
// 6. INTERACTIVE 3D LAB CONTROLLER
// ==========================================

class Interactive3DLab {
  constructor(svc) {
    this.svc = svc;
    this.canvas = document.getElementById("cg3DCanvas");
    if (!this.canvas) return;

    this.rotAngles = { x: 0.45, y: 0.65, z: 0.0 };
    this.autoRotate = true;
    this.rotationSpeed = 1.0;
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.fps = 60;
    this.lastTime = performance.now();
    this.frameCount = 0;
    this.isRunning = false;
    this.animationId = null;

    // Subsystems
    this.camera = new Camera({ distance: 260 });
    this.renderer = new Renderer3D(this.canvas);

    // Cache pre-built meshes (PERFORMANCE OPTIMIZATION)
    this.meshes = new Map();
    this._rebuildMeshes();

    this.currentModelType = "companies3d";

    this._bindControls();
  }

  _rebuildMeshes() {
    this.meshes.set("companies3d", new CompanyPrismsMesh(this.svc ? this.svc.companies : []));
    this.meshes.set("cube", new CubeMesh());
    this.meshes.set("pyramid", new PyramidMesh());
    this.meshes.set("octahedron", new OctahedronMesh());
    this.meshes.set("axes", new AxesMesh());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  _bindControls() {
    // Model Select
    const modelSel = document.getElementById("cgModelSelect");
    if (modelSel) {
      modelSel.onchange = (e) => {
        this.currentModelType = e.target.value;
      };
    }

    // Shaded Faces Toggle
    const wire = document.getElementById("cgWireToggle");
    if (wire) {
      wire.onchange = (e) => {
        this.renderer.showFaces = e.target.checked;
      };
    }

    // Axes Toggle
    const axes = document.getElementById("cgAxesToggle");
    if (axes) {
      axes.onchange = (e) => {
        this.renderer.showAxes = e.target.checked;
      };
    }

    // Auto-Rotate Toggle
    const auto = document.getElementById("cgAutoRotate");
    if (auto) {
      auto.onchange = (e) => {
        this.autoRotate = e.target.checked;
      };
    }

    // BACK-FACE CULLING TOGGLE
    const cullToggle = document.getElementById("cgCullToggle");
    if (cullToggle) {
      cullToggle.onchange = (e) => {
        this.renderer.backFaceCulling = e.target.checked;
      };
    }

    // ZOOM SLIDER (controls camera distance d)
    const zoomSlider = document.getElementById("cgZoomSlider");
    if (zoomSlider) {
      zoomSlider.value = this.camera.distance;
      zoomSlider.oninput = (e) => {
        this.camera.distance = Number(e.target.value);
        this._syncFovSlider();
      };
    }

    // FOV SLIDER (controls field of view)
    const fovSlider = document.getElementById("cgFovSlider");
    if (fovSlider) {
      fovSlider.value = Math.round(this.camera.getFovDegrees(460));
      fovSlider.oninput = (e) => {
        this.camera.setFovDegrees(Number(e.target.value), 460);
        if (zoomSlider) zoomSlider.value = Math.round(this.camera.distance);
      };
    }

    // PROJECTION MODE (Perspective vs Orthographic)
    const projSelect = document.getElementById("cgProjToggle");
    if (projSelect) {
      projSelect.onchange = (e) => {
        this.camera.isOrthographic = e.target.value === "orthographic";
      };
    }

    // ROTATION SPEED SLIDER
    const speedSlider = document.getElementById("cgSpeedSlider");
    if (speedSlider) {
      speedSlider.oninput = (e) => {
        this.rotationSpeed = Number(e.target.value) / 10;
      };
    }

    // RESET CAMERA BUTTON
    const resetBtn = document.getElementById("cgResetBtn");
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.rotAngles = { x: 0.45, y: 0.65, z: 0.0 };
        this.camera.distance = 260;
        this.camera.isOrthographic = false;
        this.rotationSpeed = 1.0;
        if (zoomSlider) zoomSlider.value = 260;
        if (projSelect) projSelect.value = "perspective";
        if (speedSlider) speedSlider.value = 10;
        this._syncFovSlider();
      };
    }

    // Mouse-wheel zoom
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.25;
      this.camera.distance = Math.max(130, Math.min(500, this.camera.distance + zoomDelta));
      if (zoomSlider) zoomSlider.value = Math.round(this.camera.distance);
      this._syncFovSlider();
    }, { passive: false });

    // Drag to orbit
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.canvas.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      if (this.canvas) this.canvas.style.cursor = "grab";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.rotAngles.y += dx * 0.01;
      this.rotAngles.x += dy * 0.01;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
  }

  _syncFovSlider() {
    const fovSlider = document.getElementById("cgFovSlider");
    if (fovSlider) {
      fovSlider.value = Math.round(this.camera.getFovDegrees(460));
    }
  }

  _animate() {
    if (!this.isRunning) return;

    const now = performance.now();
    this.frameCount++;
    if (now - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = now;
    }

    if (this.autoRotate && !this.isDragging) {
      this.rotAngles.y += 0.012 * this.rotationSpeed;
      this.rotAngles.x += 0.006 * this.rotationSpeed;
    }

    const mesh = this.meshes.get(this.currentModelType) || this.meshes.get("companies3d");
    const renderStats = this.renderer.render(mesh, this.camera, this.rotAngles);

    // Update telemetry
    const tel = document.getElementById("cgTelemetry");
    if (tel) {
      const fovDeg = Math.round(this.camera.getFovDegrees(460));
      const projName = this.camera.isOrthographic ? "Ortho" : `Persp (d=${Math.round(this.camera.distance)}, FOV=${fovDeg}°)`;
      tel.textContent = `FPS: ${this.fps} | ${projName} | Verts: ${renderStats.verticesCount} | Faces: ${renderStats.facesCount} | Culling: ${this.renderer.backFaceCulling ? 'ON' : 'OFF'}`;
    }

    // Update mathematical matrix breakdown box
    const mBox = document.getElementById("cgMatrixBox");
    if (mBox && this.frameCount % 4 === 0) {
      const { mRy, mRx, mRz, mRot } = renderStats.rotMatrices;
      const degX = ((this.rotAngles.x * 180 / Math.PI) % 360).toFixed(1);
      const degY = ((this.rotAngles.y * 180 / Math.PI) % 360).toFixed(1);
      const degZ = ((this.rotAngles.z * 180 / Math.PI) % 360).toFixed(1);
      const fov = Math.round(this.camera.getFovDegrees(460));

      mBox.innerHTML = `
        <div style="color:var(--gold);font-weight:700">1. Individual Euler Rotation Matrices (Order: Ry &rarr; Rx &rarr; Rz)</div>
        <b>Yaw [Ry(${degY}°)]:</b><br/>${mRy.toFormattedGrid(3)}<br/>
        <b>Pitch [Rx(${degX}°)]:</b><br/>${mRx.toFormattedGrid(3)}<br/>
        <b>Roll [Rz(${degZ}°)]:</b><br/>${mRz.toFormattedGrid(3)}<br/>
        <div style="color:var(--blue);font-weight:700;margin-top:4px">2. Composite Rotation Matrix M = Rz · Rx · Ry</div>
        ${mRot.toFormattedGrid(3)}<br/>
        <div style="color:var(--pink);margin-top:4px">
          <b>Projection:</b> ${this.camera.isOrthographic ? 'Orthographic Parallel Rays' : `Perspective (focal length f = d = ${Math.round(this.camera.distance)}px, true FOV = ${fov}°)`}<br/>
          <b>Shading:</b> Lambertian Diffuse (I = 0.28 + 0.72 · max(0, N · L))
        </div>
      `;
    }

    this.animationId = requestAnimationFrame(() => this._animate());
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.Vector3 = Vector3;
  window.Matrix4 = Matrix4;
  window.Mesh = Mesh;
  window.CubeMesh = CubeMesh;
  window.PyramidMesh = PyramidMesh;
  window.OctahedronMesh = OctahedronMesh;
  window.AxesMesh = AxesMesh;
  window.CompanyPrismsMesh = CompanyPrismsMesh;
  window.Camera = Camera;
  window.Renderer3D = Renderer3D;
  window.Interactive3DLab = Interactive3DLab;
}
