/**
 * WealthViz Pro — Data Visualization Renderer
 * 
 * Implements:
 * 1. Logo Strategy Pattern with destination-out composite mode
 * 2. Canvas Hi-DPI (devicePixelRatio) pixel scaling for retina displays
 * 3. Dynamic Sector Filters generated from active company dataset (Automotive, Conglomerate, etc.)
 * 4. Distinct .sector-btn class preventing navigation conflict
 * 5. Proportional mouse coordinate mapping: y * (logicalH / rect.height)
 * 6. Dynamic market cap ceiling derived from real company data (no fixed 3500)
 * 7. Reuse of custom rendering utilities (line for axes, circle for gauges)
 * 8. State isolation with ctx.save() / ctx.restore() preventing alignment leaks
 */

// ==========================================
// LOGO STRATEGY PATTERN IMPLEMENTATION
// ==========================================

class LogoStrategy {
  draw(ctx, ticker) {
    throw new Error("LogoStrategy.draw() must be implemented.");
  }
}

class AppleLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    // 1. Draw Apple solid body
    ctx.fillStyle = "#e0e0e0";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.bezierCurveTo(-9, -12, -14, -4, -14, 4);
    ctx.bezierCurveTo(-14, 13, -7, 18, 0, 18);
    ctx.bezierCurveTo(7, 18, 14, 13, 14, 4);
    ctx.bezierCurveTo(14, -4, 9, -12, 0, -12);
    ctx.fill();

    // 2. CG TECHNIQUE: Carve out the bite using destination-out composite mode
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(12, 1, 6, 0, Math.PI * 2);
    ctx.fill();

    // 3. Reset composite operation to draw leaf on top
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.quadraticCurveTo(5, -20, 8, -19);
    ctx.quadraticCurveTo(4, -14, 0, -13);
    ctx.fillStyle = "#e0e0e0";
    ctx.fill();
    ctx.restore();
  }
}

class MicrosoftLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    const sz = 8;
    ctx.fillStyle = "#f25022"; ctx.fillRect(-sz - 1, -sz - 1, sz, sz);
    ctx.fillStyle = "#7fba00"; ctx.fillRect(1, -sz - 1, sz, sz);
    ctx.fillStyle = "#00a4ef"; ctx.fillRect(-sz - 1, 1, sz, sz);
    ctx.fillStyle = "#ffb900"; ctx.fillRect(1, 1, sz, sz);
    ctx.restore();
  }
}

class NvidiaLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#76b900";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0.3 * Math.PI, 1.7 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#76b900";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class GoogleLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    const gr = 13;
    ctx.lineWidth = 4;
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#ea4335";
    ctx.beginPath(); ctx.arc(0, 0, gr, 1.15 * Math.PI, 1.65 * Math.PI); ctx.stroke();
    ctx.strokeStyle = "#fbbc05";
    ctx.beginPath(); ctx.arc(0, 0, gr, 0.65 * Math.PI, 1.15 * Math.PI); ctx.stroke();
    ctx.strokeStyle = "#34a853";
    ctx.beginPath(); ctx.arc(0, 0, gr, 0.15 * Math.PI, 0.65 * Math.PI); ctx.stroke();
    ctx.strokeStyle = "#4285f4";
    ctx.beginPath(); ctx.arc(0, 0, gr, 1.65 * Math.PI, 2.15 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(gr, 0); ctx.stroke();
    ctx.restore();
  }
}

class AmazonLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.font = "bold 18px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("a", -2, 0);
    ctx.strokeStyle = "#ff9900";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, -2, 14, 0.3 * Math.PI, 0.7 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#ff9900";
    ctx.beginPath();
    const ax = 14 * Math.cos(0.7 * Math.PI), ay = -2 + 14 * Math.sin(0.7 * Math.PI);
    ctx.arc(ax + 2, ay - 1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class MetaLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#40c4ff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.1) {
      const denom = 1 + Math.sin(t) * Math.sin(t);
      const lx = (17 * Math.cos(t)) / denom;
      const ly = (13 * Math.sin(t) * Math.cos(t)) / denom;
      if (t === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

class TeslaLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#e82127";
    ctx.beginPath();
    ctx.moveTo(-15, -11);
    ctx.quadraticCurveTo(0, -7, 15, -11);
    ctx.quadraticCurveTo(0, -14, -15, -11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-13, -6);
    ctx.lineTo(13, -6);
    ctx.lineTo(3, 3);
    ctx.lineTo(1, 15);
    ctx.lineTo(-1, 15);
    ctx.lineTo(-3, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class BerkshireLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#ffd740";
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(-14, -5);
    ctx.lineTo(14, -5);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(-12, -3, 5, 13);
    ctx.fillRect(-2, -3, 4, 13);
    ctx.fillRect(7, -3, 5, 13);
    ctx.fillRect(-15, 11, 30, 4);
    ctx.restore();
  }
}

class TsmcLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#40c4ff";
    ctx.lineWidth = 1.8;
    ctx.strokeRect(-11, -11, 22, 22);
    ctx.fillStyle = "rgba(64,196,255,0.2)";
    ctx.fillRect(-7, -7, 14, 14);
    ctx.fillStyle = "#40c4ff";
    for (let p = -8; p <= 8; p += 8) {
      ctx.fillRect(p - 1, -15, 2, 3);
      ctx.fillRect(p - 1, 12, 2, 3);
      ctx.fillRect(-15, p - 1, 3, 2);
      ctx.fillRect(12, p - 1, 3, 2);
    }
    ctx.restore();
  }
}

class LillyLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke();
    ctx.strokeStyle = "#ff80ab";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

class VisaLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.font = "italic 900 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#ffd740";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("V", 0, 2);
    ctx.strokeStyle = "#40c4ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.lineTo(12, 10);
    ctx.stroke();
    ctx.restore();
  }
}

class JPMorganLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#b388ff";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x = Math.cos(a) * 14;
      const y = Math.sin(a) * 14;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = "#b388ff";
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }
}

class ExxonLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-12, -10); ctx.lineTo(-2, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(-12, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -10); ctx.lineTo(12, 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, -10); ctx.lineTo(2, 10); ctx.stroke();
    ctx.restore();
  }
}

class RelianceLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.fillStyle = "#00e676";
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.quadraticCurveTo(10, -5, 6, 8);
    ctx.quadraticCurveTo(0, 14, -6, 8);
    ctx.quadraticCurveTo(-10, -5, 0, -14);
    ctx.fill();
    ctx.fillStyle = "#40c4ff";
    ctx.beginPath();
    ctx.arc(0, 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class OracleLogoStrategy extends LogoStrategy {
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "#ff5252";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-6, 0, 9, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.lineTo(6, -9);
    ctx.arc(6, 0, 9, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.lineTo(-6, 9);
    ctx.stroke();
    ctx.restore();
  }
}

class DefaultLogoStrategy extends LogoStrategy {
  draw(ctx, ticker) {
    ctx.save();
    ctx.strokeStyle = "#ffd740";
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((ticker || "").slice(0, 3), 0, 0);
    ctx.restore();
  }
}

class LogoStrategyRegistry {
  static strategies = new Map([
    ["AAPL", new AppleLogoStrategy()],
    ["MSFT", new MicrosoftLogoStrategy()],
    ["NVDA", new NvidiaLogoStrategy()],
    ["GOOGL", new GoogleLogoStrategy()],
    ["AMZN", new AmazonLogoStrategy()],
    ["META", new MetaLogoStrategy()],
    ["TSLA", new TeslaLogoStrategy()],
    ["BRK.B", new BerkshireLogoStrategy()],
    ["TSM", new TsmcLogoStrategy()],
    ["LLY", new LillyLogoStrategy()],
    ["V", new VisaLogoStrategy()],
    ["JPM", new JPMorganLogoStrategy()],
    ["XOM", new ExxonLogoStrategy()],
    ["RELIANCE", new RelianceLogoStrategy()],
    ["ORCL", new OracleLogoStrategy()]
  ]);

  static defaultStrategy = new DefaultLogoStrategy();

  static get(ticker) {
    return this.strategies.get(ticker) || this.defaultStrategy;
  }
}

// ==========================================
// COMPANY VISUALIZATION & MARKET VISUALIZER
// ==========================================

class CompanyGraphicsRenderer {
  constructor(svc) {
    this.svc = svc;
    this.angle = 0;
    this.selectedSector = "ALL";
    this.hoveredComp = null;
    this.currency = "USD";
    this.isRunning = false;
    this.animationId = null;

    // Offscreen cached layers for static elements (logos + gauges)
    this.staticLayers = new Map();

    this._initCards();
    this._initSectorFilters();
    this._bindMarketCanvas();
  }

  setCurrency(curr) {
    this.currency = curr;
    this.invalidateStaticCache();
    this.updateAll();
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

  invalidateStaticCache() {
    this.staticLayers.clear();
  }

  getMaxMarketCap() {
    return Math.max(...this.svc.companies.map(c => c.marketCap), 100);
  }

  _initCards() {
    const grid = document.getElementById("companySymbolsGrid");
    if (!grid) return;

    grid.innerHTML = this.svc.companies.map(c => `
      <div class="company-cg-card" data-ticker="${c.ticker}" role="button" tabindex="0" aria-label="${c.name} graphics card">
        <canvas id="cgCanvas_${c.ticker}" width="160" height="135" aria-label="${c.name} vector symbol and trend"></canvas>
        <div class="cg-cname" title="${c.name}">${c.name}</div>
        <div class="cg-cinfo">
          <span class="cg-price" id="cgPrice_${c.ticker}">
            ${CurrencyConverter.formatStockPrice(c.price, c.currency, this.currency)}
          </span>
          <span class="cg-change ${c.change >= 0 ? 'positive' : 'negative'}" id="cgChange_${c.ticker}">
            ${c.change >= 0 ? '+' : ''}${c.changePct.toFixed(2)}%
          </span>
        </div>
        <div class="cg-sector" id="cgCap_${c.ticker}">
          ${c.ticker} · ${CurrencyConverter.formatBillions(c.marketCap, this.currency)}
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".company-cg-card").forEach(card => {
      const showCardDetail = () => {
        if (window.dashboard) window.dashboard.showCompany(card.dataset.ticker);
      };
      card.onclick = showCardDetail;
      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showCardDetail();
        }
      };
    });

    this.invalidateStaticCache();
  }

  /**
   * BUG FIX: Dynamically generate sector filter buttons from active company dataset.
   * Generates buttons for ALL sectors (including Automotive, Conglomerate, etc.)
   * Uses class .sector-btn instead of .nav-btn so it NEVER clashes with view navigation!
   */
  _initSectorFilters() {
    const filters = document.getElementById("cgSectorFilters");
    if (!filters) return;

    // Extract all distinct sectors dynamically from data
    const sectorsSet = new Set(this.svc.companies.map(c => c.sector));
    const allSectors = ["ALL", ...Array.from(sectorsSet)];

    filters.innerHTML = allSectors.map(sec => `
      <button class="sector-btn ${sec === this.selectedSector ? 'active' : ''}" data-sector="${sec}" style="padding:0.25rem 0.65rem;font-size:0.78rem">
        ${sec === "ALL" ? "All" : sec}
      </button>
    `).join("");

    filters.querySelectorAll(".sector-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        filters.querySelectorAll(".sector-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedSector = btn.dataset.sector;
        this.drawMarketVisualizer();
      };
    });
  }

  _bindMarketCanvas() {
    const mc = document.getElementById("cvCompanyMarket");
    if (mc) {
      // BUG FIX: Accurate coordinate scaling for CSS-resized canvas: y * (340 / rect.height)
      mc.addEventListener("mousemove", (e) => {
        const rect = mc.getBoundingClientRect();
        if (rect.height === 0) return;
        const scaleY = 340 / rect.height;
        const y = (e.clientY - rect.top) * scaleY;

        const comps = this._getFilteredCompanies();
        const rowH = 19;
        const startY = 32;
        const idx = Math.floor((y - startY) / rowH);

        if (idx >= 0 && idx < comps.length) {
          this.hoveredComp = comps[idx].ticker;
        } else {
          this.hoveredComp = null;
        }
      });

      mc.addEventListener("mouseleave", () => {
        this.hoveredComp = null;
      });

      mc.addEventListener("click", () => {
        if (this.hoveredComp && window.dashboard) {
          window.dashboard.showCompany(this.hoveredComp);
        }
      });
    }
  }

  _getFilteredCompanies() {
    const list = [...this.svc.companies].sort((a, b) => b.marketCap - a.marketCap);
    if (this.selectedSector === "ALL") return list;
    return list.filter(c => c.sector === this.selectedSector);
  }

  updateAll() {
    this.svc.companies.forEach(c => {
      const pEl = document.getElementById(`cgPrice_${c.ticker}`);
      const chEl = document.getElementById(`cgChange_${c.ticker}`);
      const capEl = document.getElementById(`cgCap_${c.ticker}`);

      if (pEl) {
        pEl.textContent = CurrencyConverter.formatStockPrice(c.price, c.currency, this.currency);
      }
      if (chEl) {
        chEl.className = `cg-change ${c.change >= 0 ? 'positive' : 'negative'}`;
        chEl.textContent = `${c.change >= 0 ? '+' : ''}${c.changePct.toFixed(2)}%`;
      }
      if (capEl) {
        capEl.textContent = `${c.ticker} · ${CurrencyConverter.formatBillions(c.marketCap, this.currency)}`;
      }
    });

    this.invalidateStaticCache();
  }

  _animate() {
    if (!this.isRunning) return;

    this.angle += 0.015;
    this.drawCompanyCards();
    this.drawMarketVisualizer();

    this.animationId = requestAnimationFrame(() => this._animate());
  }

  _getOrCreateStaticLayer(company, w, h, dpr) {
    if (this.staticLayers.has(company.ticker)) {
      return this.staticLayers.get(company.ticker);
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = Math.round(w * dpr);
    offscreen.height = Math.round(h * dpr);
    const octx = offscreen.getContext("2d");
    octx.scale(dpr, dpr);

    // Card background
    octx.fillStyle = "rgba(11,8,32,0.85)";
    octx.fillRect(0, 0, w, h);

    // Draw Vector Brand Logo via Strategy Pattern
    octx.save();
    octx.translate(45, 36);
    const strategy = LogoStrategyRegistry.get(company.ticker);
    strategy.draw(octx, company.ticker);
    octx.restore();

    // Draw Radial Market Cap Valuation Gauge
    this._drawValuationGauge(octx, 124, 36, company);

    this.staticLayers.set(company.ticker, offscreen);
    return offscreen;
  }

  drawCompanyCards() {
    const dpr = window.devicePixelRatio || 1;
    const logicalW = 160;
    const logicalH = 135;

    this.svc.companies.forEach(c => {
      const canvas = document.getElementById(`cgCanvas_${c.ticker}`);
      if (!canvas) return;

      if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
        canvas.width = Math.round(logicalW * dpr);
        canvas.height = Math.round(logicalH * dpr);
      }

      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.scale(dpr, dpr);

      // Blit cached static logo & gauge layer (PERFORMANCE OPTIMIZATION)
      const staticCanvas = this._getOrCreateStaticLayer(c, logicalW, logicalH, dpr);
      ctx.drawImage(staticCanvas, 0, 0, logicalW, logicalH);

      // Render dynamic animated sparkline & pulsing endpoint
      this._drawSparkline(ctx, logicalW, logicalH, c);

      ctx.restore();
    });
  }

  _drawValuationGauge(ctx, cx, cy, c) {
    ctx.save();
    const r = 20;

    // ALGORITHM REUSE: Use custom Midpoint Circle to draw calibration background track
    if (typeof CGAlgorithms !== "undefined") {
      CGAlgorithms.midpointCircle(ctx, cx, cy, r, "rgba(255,255,255,0.08)");
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 3.5;
      ctx.stroke();
    }

    // Dynamic ceiling: compute max from actual company dataset
    const maxCap = this.getMaxMarketCap();
    const pct = Math.min(1, Math.max(0.05, c.marketCap / maxCap));

    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, "#40c4ff");
    grad.addColorStop(1, "#b388ff");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Value text inside gauge
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const capStr = CurrencyConverter.formatBillions(c.marketCap, this.currency);
    ctx.fillText(capStr, cx, cy);

    // Ticker label above gauge (safe hex color)
    ctx.fillStyle = "#a89cc8";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText(c.ticker, cx, cy - 25);

    ctx.restore();
  }

  /**
   * Bézier sparkline with quadratic smoothing through midpoints
   */
  _drawSparkline(ctx, w, h, c) {
    ctx.save();
    const hist = c.history || [c.price];
    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const span = (max - min) || 1;
    const padX = 12;
    const topY = 78, botY = 126;
    const hRange = botY - topY;

    const pts = hist.map((v, i) => ({
      x: padX + (i / Math.max(1, hist.length - 1)) * (w - padX * 2),
      y: botY - ((v - min) / span) * hRange
    }));

    const isPos = c.change >= 0;
    const strokeColor = isPos ? "#00e676" : "#ff5252";

    // Gradient fill under curve
    const areaGrad = ctx.createLinearGradient(0, topY, 0, botY);
    areaGrad.addColorStop(0, isPos ? "rgba(0,230,118,0.25)" : "rgba(255,82,82,0.25)");
    areaGrad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.beginPath();
    ctx.moveTo(pts[0].x, botY);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(pts[pts.length - 1].x, botY);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Stroke the trend line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Pulse dot at latest point
    const last = pts[pts.length - 1];
    const pulse = 2.5 + Math.sin(this.angle * 3.5) * 1.0;
    ctx.beginPath();
    ctx.arc(last.x, last.y, pulse, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  drawMarketVisualizer() {
    const canvas = document.getElementById("cvCompanyMarket");
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = 940;
    const logicalH = 340;

    if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const comps = this._getFilteredCompanies();
    const maxCap = this.getMaxMarketCap();
    const startY = 32;
    const rowH = 19;
    const labelW = 85;
    const rightPad = 145;
    const barMaxW = logicalW - labelW - rightPad - 20;

    // ALGORITHM REUSE: Use custom Bresenham line to draw the baseline axis
    if (typeof CGAlgorithms !== "undefined") {
      CGAlgorithms.bresenhamLine(ctx, 15, 24, logicalW - 15, 24, "rgba(255,255,255,0.08)");
    }

    // Header labels
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("TICKER", 15, 14);
    ctx.fillText(`MARKET CAPITALIZATION (${this.currency})`, labelW + 15, 14);
    ctx.textAlign = "right";
    ctx.fillText(`PRICE (${this.currency}) / 24H`, logicalW - 18, 14);

    comps.forEach((c, idx) => {
      const y = startY + idx * rowH;
      const isHov = this.hoveredComp === c.ticker;
      const barLen = Math.max(12, (c.marketCap / maxCap) * barMaxW);

      if (isHov) {
        ctx.fillStyle = "rgba(179,136,255,0.15)";
        ctx.fillRect(8, y - 2, logicalW - 16, rowH);
      }

      // Ticker
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isHov ? "#ffd740" : "#ffffff";
      ctx.font = isHov ? "bold 11px monospace" : "11px monospace";
      ctx.fillText(c.ticker, 15, y + 8);

      // Color palette per sector
      let c1 = "#40c4ff", c2 = "#7c4dff";
      if (c.sector === "Financial") { c1 = "#b388ff"; c2 = "#6200ea"; }
      else if (c.sector === "Consumer") { c1 = "#ffab40"; c2 = "#ff6d00"; }
      else if (c.sector === "Automotive") { c1 = "#ff5252"; c2 = "#d50000"; }
      else if (c.sector === "Healthcare") { c1 = "#ff80ab"; c2 = "#c51162"; }
      else if (c.sector === "Energy") { c1 = "#ffd740"; c2 = "#ffab00"; }
      else if (c.sector === "Conglomerate") { c1 = "#00e676"; c2 = "#00b0ff"; }

      // Market Cap bar
      const bGrad = ctx.createLinearGradient(labelW + 15, 0, labelW + 15 + barLen, 0);
      bGrad.addColorStop(0, c1);
      bGrad.addColorStop(1, c2);
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.roundRect(labelW + 15, y, barLen, 12, 4);
      ctx.fill();

      // Market Cap label
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "10px 'Segoe UI', system-ui, sans-serif";
      const capTxt = CurrencyConverter.formatBillions(c.marketCap, this.currency);
      ctx.fillText(capTxt, labelW + 22 + barLen, y + 7);

      // Price & Change
      ctx.textAlign = "right";
      const chgColor = c.change >= 0 ? "#00e676" : "#ff5252";
      const formattedPrice = CurrencyConverter.formatStockPrice(c.price, c.currency, this.currency);
      ctx.fillStyle = "#ffd740";
      ctx.font = "bold 10px monospace";
      ctx.fillText(formattedPrice, logicalW - 85, y + 7);

      ctx.fillStyle = chgColor;
      ctx.font = "10px monospace";
      ctx.fillText(`${c.change >= 0 ? '+' : ''}${c.changePct.toFixed(1)}%`, logicalW - 18, y + 7);
    });

    ctx.restore();
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.LogoStrategyRegistry = LogoStrategyRegistry;
  window.CompanyGraphicsRenderer = CompanyGraphicsRenderer;
}
