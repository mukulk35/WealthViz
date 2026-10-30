/**
 * WealthViz Pro — Dashboard Controller
 * 
 * Orchestrates:
 * 1. Polymorphic Table Rendering via reusable renderTableHelper
 * 2. Sortable Table Columns (Rank, Name, Worth/Price, Change, Source, Country)
 * 3. Performance Optimization: Selective visible-view rendering & RAF loop pausing
 * 4. Zero-Dependency Canvas Detail Chart Fallback (100% offline resilient)
 * 5. Interactive Canvas Donut Chart for Global Wealth Distribution
 * 6. Multi-Currency Conversion Toggle (USD, EUR, INR, GBP)
 * 7. Light/Dark Theme Switcher
 * 8. Full Accessibility (ARIA, focus trap, Esc-key modal dismissal, search keyboard navigation)
 */

class DashboardController {
  constructor(svc) {
    this.svc = svc;
    this.currentView = "home";
    this.currentCountry = "USA";
    this.currentCurrency = "USD";
    this.currentTheme = "dark";
    this.activeSearchIndex = -1;
    this.searchDebounceTimer = null;
    this.previouslyFocusedElement = null;

    // Sorting state per table
    this.sortState = {
      homeB: { col: "rank", asc: true },
      homeC: { col: "marketCap", asc: false },
      allB: { col: "rank", asc: true },
      countryB: { col: "rank", asc: true },
      allC: { col: "marketCap", asc: false }
    };

    // Subsystems
    this.compGraphics = null;
    this.lab3d = null;
    this.chartInstance = null;

    this._initDom();
    this._bindNavigation();
    this._bindSearch();
    this._bindModal();
    this._bindControls();
    this._bindSortableHeaders();
    this._populateCountrySelect();

    // Initialize graphics engines
    this.compGraphics = new CompanyGraphicsRenderer(this.svc);
    this.lab3d = new Interactive3DLab(this.svc);
    this.algorithmsLab = typeof AlgorithmsVisualizer !== "undefined" ? new AlgorithmsVisualizer() : null;

    // Initial render
    this.renderAllViews();

    // Start 8-second simulated live interval
    this.intervalId = setInterval(() => {
      this.svc.refreshAll();
      this.onDataTick();
    }, 8000);
  }

  _initDom() {
    // Set theme attribute
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  }

  // ==========================================
  // VIEW & NAVIGATION MANAGEMENT
  // ==========================================

  _bindNavigation() {
    const navButtons = document.querySelectorAll("[data-view]");
    navButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetView = btn.dataset.view;
        if (!targetView) return; // Strictly ignore buttons without data-view
        this.switchView(targetView);
      });
    });

    // Mobile Hamburger Toggle
    const mobileBtn = document.getElementById("mobileMenuToggle");
    const sidebar = document.querySelector(".sidebar");
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener("click", () => {
        const isExpanded = sidebar.classList.toggle("mobile-open");
        mobileBtn.setAttribute("aria-expanded", isExpanded);
      });
    }
  }

  switchView(viewName) {
    if (!viewName || this.currentView === viewName) return;
    this.currentView = viewName;

    // Update button states
    document.querySelectorAll("[data-view]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    // Update view panels
    document.querySelectorAll(".view").forEach(vw => {
      vw.classList.toggle("active", vw.id === `view-${viewName}`);
    });

    // Close mobile drawer if open
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("mobile-open");

    // PERFORMANCE OPTIMIZATION: Pause RAF loops when view-cg is hidden
    if (viewName === "cg") {
      if (this.compGraphics) this.compGraphics.start();
      if (this.lab3d) this.lab3d.start();
      if (this.algorithmsLab) this.algorithmsLab.renderAll();
    } else {
      if (this.compGraphics) this.compGraphics.stop();
      if (this.lab3d) this.lab3d.stop();
    }

    // Render the specific view upon activation
    this.renderActiveView();
  }

  _bindControls() {
    // Currency Selector
    const currSelect = document.getElementById("currencySelect");
    if (currSelect) {
      currSelect.value = this.currentCurrency;
      currSelect.addEventListener("change", (e) => {
        this.currentCurrency = e.target.value;
        if (this.compGraphics) this.compGraphics.setCurrency(this.currentCurrency);
        this.renderAllViews();
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", this.currentTheme);
        themeBtn.textContent = this.currentTheme === "dark" ? "🌙 Dark" : "☀️ Light";
        if (this.compGraphics) this.compGraphics.invalidateStaticCache();
        if (this.currentView === "countries") this._renderCountryDonut();
      });
    }

    // Country Filter
    const cSel = document.getElementById("countrySelect");
    if (cSel) {
      cSel.addEventListener("change", (e) => {
        this.currentCountry = e.target.value;
        this._renderCountryView();
      });
    }
  }

  _populateCountrySelect() {
    const sel = document.getElementById("countrySelect");
    if (!sel) return;
    sel.innerHTML = "";
    this.svc.getCountries().forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = `${c} (${this.svc.topByCountry(c, 100).length})`;
      sel.appendChild(opt);
    });
    sel.value = "USA";
  }

  // ==========================================
  // TABLE SORTING & REUSABLE RENDERING
  // ==========================================

  _bindSortableHeaders() {
    document.querySelectorAll("th[data-sort]").forEach(th => {
      th.addEventListener("click", () => {
        const tableKey = th.closest("table").dataset.tableKey;
        const sortKey = th.dataset.sort;
        if (!tableKey || !sortKey) return;

        const current = this.sortState[tableKey] || { col: "rank", asc: true };
        if (current.col === sortKey) {
          current.asc = !current.asc;
        } else {
          current.col = sortKey;
          current.asc = true;
        }
        this.sortState[tableKey] = current;

        // Update header indicator icons
        th.closest("tr").querySelectorAll("th").forEach(h => {
          h.classList.remove("sorted-asc", "sorted-desc");
        });
        th.classList.add(current.asc ? "sorted-asc" : "sorted-desc");

        this.renderActiveView();
      });
    });
  }

  _sortEntities(items, tableKey) {
    const cfg = this.sortState[tableKey];
    if (!cfg) return items;

    return [...items].sort((a, b) => {
      let valA, valB;
      switch (cfg.col) {
        case "rank":
          valA = a.rank !== undefined ? a.rank : 0;
          valB = b.rank !== undefined ? b.rank : 0;
          break;
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "worth":
          valA = a.netWorth !== undefined ? a.netWorth : 0;
          valB = b.netWorth !== undefined ? b.netWorth : 0;
          break;
        case "price":
          valA = a.price !== undefined ? a.price : 0;
          valB = b.price !== undefined ? b.price : 0;
          break;
        case "change":
          valA = a.change !== undefined ? a.change : 0;
          valB = b.change !== undefined ? b.change : 0;
          break;
        case "marketCap":
          valA = a.marketCap !== undefined ? a.marketCap : 0;
          valB = b.marketCap !== undefined ? b.marketCap : 0;
          break;
        case "country":
          valA = (a.country || "").toLowerCase();
          valB = (b.country || "").toLowerCase();
          break;
        case "source":
          valA = (a.source || a.sector || "").toLowerCase();
          valB = (b.source || b.sector || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (valA < valB) return cfg.asc ? -1 : 1;
      if (valA > valB) return cfg.asc ? 1 : -1;
      return 0;
    });
  }

  /**
   * Reusable polymorphic table rendering helper
   */
  renderTableHelper(tbodyId, items, tableKey, customRankStart = null) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const sortedItems = this._sortEntities(items, tableKey);

    tbody.innerHTML = sortedItems.map((item, idx) => {
      const customRank = customRankStart !== null ? customRankStart + idx : undefined;
      return item.toRowHtml({
        currency: this.currentCurrency,
        customRank
      });
    }).join("");

    // Attach click and keyboard listeners to rows
    tbody.querySelectorAll("tr").forEach(tr => {
      const id = tr.dataset.id;
      const type = tr.dataset.type;
      const change = parseFloat(tr.dataset.change);

      // Trigger animation flash on change
      if (Math.abs(change) > 0.001) {
        tr.classList.add(change >= 0 ? "flash-up" : "flash-down");
        setTimeout(() => tr.classList.remove("flash-up", "flash-down"), 900);
      }

      const showDetail = () => {
        if (type === "billionaire") this.showBillionaire(id);
        else this.showCompany(id);
      };

      tr.onclick = showDetail;
      tr.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showDetail();
        }
      };
    });
  }

  // ==========================================
  // VIEW RENDERING
  // ==========================================

  renderActiveView() {
    switch (this.currentView) {
      case "home":
        this._renderHomeView();
        break;
      case "billionaires":
        this._renderBillionairesView();
        break;
      case "countries":
        this._renderCountryView();
        break;
      case "companies":
        this._renderCompaniesView();
        break;
      case "cg":
        if (this.compGraphics) this.compGraphics.updateAll();
        break;
    }
    this._updateHeaderStats();
  }

  renderAllViews() {
    this._renderHomeView();
    this._renderBillionairesView();
    this._renderCountryView();
    this._renderCompaniesView();
    if (this.compGraphics) this.compGraphics.updateAll();
    this._updateHeaderStats();
  }

  onDataTick() {
    // PERFORMANCE OPTIMIZATION: On 8-second tick, only update the active visible view
    this.renderActiveView();

    // Update simulated ticker timestamp
    const timeEl = document.getElementById("lastUpdate");
    if (timeEl) {
      timeEl.textContent = `Simulated Live (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`;
    }
  }

  _updateHeaderStats() {
    const totalEl = document.getElementById("statTotal");
    const wealthEl = document.getElementById("statWealth");
    const compEl = document.getElementById("statCompanies");
    const ctryEl = document.getElementById("statCountries");

    if (totalEl) totalEl.textContent = this.svc.billionaires.length;
    if (wealthEl) {
      wealthEl.textContent = CurrencyConverter.formatBillions(this.svc.totalWealth(), this.currentCurrency);
    }
    if (compEl) compEl.textContent = this.svc.companies.length;
    if (ctryEl) ctryEl.textContent = this.svc.getCountries().length;
  }

  _renderHomeView() {
    this.renderTableHelper("homeTop10", this.svc.billionaires.slice(0, 10), "homeB");
    this.renderTableHelper("homeCompanies", this.svc.companies, "homeC");
  }

  _renderBillionairesView() {
    this.renderTableHelper("allBillionaires", this.svc.billionaires, "allB");
  }

  _renderCountryView() {
    const topInCountry = this.svc.topByCountry(this.currentCountry, 10);
    this.renderTableHelper("countryTop10", topInCountry, "countryB", 1);
    this._renderCountryDonut();
  }

  _renderCompaniesView() {
    this.renderTableHelper("allCompanies", this.svc.companies, "allC");
  }

  // ==========================================
  // FEATURE: CANVASC-BASED WEALTH BY COUNTRY DONUT
  // ==========================================

  _renderCountryDonut() {
    const canvas = document.getElementById("cvCountryDonut");
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalW = 380;
    const logicalH = 260;

    if (canvas.width !== Math.round(logicalW * dpr) || canvas.height !== Math.round(logicalH * dpr)) {
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
    }

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicalW, logicalH);

    const { total, segments } = this.svc.getWealthByCountryData(5);
    const cx = 130;
    const cy = 130;
    const outerR = 95;
    const innerR = 56;

    const palette = [
      "#ffd740", // USA (gold)
      "#40c4ff", // China (cyan)
      "#00e676", // India (green)
      "#ff80ab", // France (pink)
      "#b388ff", // Germany (purple)
      "#a89cc8"  // Others (muted)
    ];

    let startAng = -Math.PI / 2;

    segments.forEach((seg, i) => {
      const sliceAng = (seg.wealth / total) * Math.PI * 2;
      const endAng = startAng + sliceAng;
      const color = palette[i % palette.length];

      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAng, endAng);
      ctx.arc(cx, cy, innerR, endAng, startAng, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = this.currentTheme === "dark" ? "#1a1440" : "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      startAng = endAng;
    });

    // Center text hole
    ctx.fillStyle = this.currentTheme === "dark" ? "#ffffff" : "#1a1440";
    ctx.font = "bold 13px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Combined", cx, cy - 9);
    ctx.font = "11px 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#a89cc8";
    ctx.fillText(CurrencyConverter.formatBillions(total, this.currentCurrency), cx, cy + 9);

    // Legend on right
    let legendY = 32;
    segments.forEach((seg, i) => {
      const color = palette[i % palette.length];
      ctx.fillStyle = color;
      ctx.fillRect(250, legendY, 10, 10);

      ctx.fillStyle = this.currentTheme === "dark" ? "#ffffff" : "#1a1440";
      ctx.font = "bold 10px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(seg.country, 266, legendY - 1);

      ctx.fillStyle = "#a89cc8";
      ctx.font = "9px 'Segoe UI', system-ui, sans-serif";
      ctx.fillText(`${seg.pct.toFixed(1)}% · ${CurrencyConverter.formatBillions(seg.wealth, this.currentCurrency)}`, 266, legendY + 12);

      legendY += 34;
    });

    ctx.restore();
  }

  // ==========================================
  // SEARCH WITH DEBOUNCE & KEYBOARD ARROW NAV
  // ==========================================

  _bindSearch() {
    const input = document.getElementById("searchInput");
    const box = document.getElementById("searchResults");
    if (!input || !box) return;

    input.addEventListener("input", () => {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        const query = input.value.trim();
        if (!query) {
          box.classList.add("hidden");
          this.activeSearchIndex = -1;
          return;
        }

        const hits = this.svc.search(query);
        this.activeSearchIndex = -1;

        if (hits.length === 0) {
          box.innerHTML = `<div class="search-item muted">No results found for "${query}"</div>`;
        } else {
          box.innerHTML = hits.map((h, i) => {
            const e = h.entity;
            const label = h.type === "billionaire"
              ? `${e.name} · ${CurrencyConverter.formatBillions(e.netWorth, this.currentCurrency)}`
              : `${e.ticker} · ${e.name}`;
            return `
              <div class="search-item" data-index="${i}" data-type="${h.type}" data-id="${h.type === 'billionaire' ? e.id : e.ticker}" role="option">
                <span>${label}</span>
                <span class="type type-${h.type}">${h.type}</span>
              </div>
            `;
          }).join("");
        }

        box.classList.remove("hidden");

        box.querySelectorAll(".search-item[data-type]").forEach(item => {
          item.onclick = () => {
            this._selectSearchResult(item, input, box);
          };
        });
      }, 180);
    });

    // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
    input.addEventListener("keydown", (e) => {
      const items = box.querySelectorAll(".search-item[data-type]");
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.activeSearchIndex = (this.activeSearchIndex + 1) % items.length;
        this._updateSearchActive(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.activeSearchIndex = (this.activeSearchIndex - 1 + items.length) % items.length;
        this._updateSearchActive(items);
      } else if (e.key === "Enter" && this.activeSearchIndex >= 0) {
        e.preventDefault();
        this._selectSearchResult(items[this.activeSearchIndex], input, box);
      } else if (e.key === "Escape") {
        box.classList.add("hidden");
        this.activeSearchIndex = -1;
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-box")) {
        box.classList.add("hidden");
        this.activeSearchIndex = -1;
      }
    });
  }

  _updateSearchActive(items) {
    items.forEach((item, idx) => {
      item.classList.toggle("selected", idx === this.activeSearchIndex);
      if (idx === this.activeSearchIndex) item.scrollIntoView({ block: "nearest" });
    });
  }

  _selectSearchResult(item, input, box) {
    box.classList.add("hidden");
    input.value = "";
    this.activeSearchIndex = -1;
    if (item.dataset.type === "billionaire") {
      this.showBillionaire(item.dataset.id);
    } else {
      this.showCompany(item.dataset.id);
    }
  }

  // ==========================================
  // DETAIL MODAL & ACCESSIBILITY
  // ==========================================

  _bindModal() {
    const modal = document.getElementById("detailModal");
    const closeBtn = document.getElementById("closeModal");

    if (closeBtn) closeBtn.onclick = () => this.closeModal();

    if (modal) {
      modal.onclick = (e) => {
        if (e.target.id === "detailModal") this.closeModal();
      };
    }

    // Accessible Escape Key Dismissal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
        this.closeModal();
      }
    });
  }

  closeModal() {
    const modal = document.getElementById("detailModal");
    if (modal) modal.classList.add("hidden");

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    // Restore focus
    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus();
      this.previouslyFocusedElement = null;
    }
  }

  showBillionaire(id) {
    const b = this.svc.getBillionaire(id);
    if (!b) return;

    this.previouslyFocusedElement = document.activeElement;
    const body = document.getElementById("detailBody");
    if (body) {
      body.innerHTML = b.toDetailHtml({ currency: this.currentCurrency });
    }

    const modal = document.getElementById("detailModal");
    if (modal) {
      modal.classList.remove("hidden");
      const closeBtn = document.getElementById("closeModal");
      if (closeBtn) closeBtn.focus();
    }

    this._renderDetailChart(b.history, `Net Worth History (${this.currentCurrency})`, b.change >= 0);
  }

  showCompany(ticker) {
    const c = this.svc.getCompany(ticker);
    if (!c) return;

    this.previouslyFocusedElement = document.activeElement;
    const body = document.getElementById("detailBody");
    if (body) {
      body.innerHTML = c.toDetailHtml({ currency: this.currentCurrency });
    }

    const modal = document.getElementById("detailModal");
    if (modal) {
      modal.classList.remove("hidden");
      const closeBtn = document.getElementById("closeModal");
      if (closeBtn) closeBtn.focus();
    }

    this._renderDetailChart(c.history, `Stock Price Trend (${c.currency})`, c.change >= 0);
  }

  // ==========================================
  // CHART.JS + ZERO-DEPENDENCY CANVAS CG FALLBACK
  // ==========================================

  _renderDetailChart(data, label, isPositive) {
    const canvas = document.getElementById("detailChart");
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const strokeColor = isPositive ? "#00e676" : "#ff5252";
    const fillColor = isPositive ? "rgba(0,230,118,0.14)" : "rgba(255,82,82,0.14)";

    // If Chart.js is loaded from CDN, use it
    if (typeof Chart !== "undefined") {
      this.chartInstance = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: data.map((_, i) => `T-${data.length - i}`),
          datasets: [{
            label,
            data,
            borderColor: strokeColor,
            backgroundColor: fillColor,
            fill: true,
            tension: 0.35,
            pointRadius: 2,
            borderWidth: 2.2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { display: false },
            y: {
              grid: { color: "rgba(255,255,255,0.06)" },
              ticks: { color: "#a89cc8", font: { size: 10 } }
            }
          }
        }
      });
    } else {
      // 100% OFFLINE-SAFE CG CANVAS FALLBACK RENDERER
      this._drawCustomCanvasChart(canvas, data, label, isPositive);
    }
  }

  _drawCustomCanvasChart(canvas, data, label, isPositive) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth || 460;
    const h = 180;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const span = (max - min) || 1;
    const padX = 24;
    const padY = 24;
    const plotW = w - padX * 2;
    const plotH = h - padY * 2;

    const strokeColor = isPositive ? "#00e676" : "#ff5252";
    const fillColor = isPositive ? "rgba(0,230,118,0.15)" : "rgba(255,82,82,0.15)";

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padY + (plotH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(w - padX, y);
      ctx.stroke();
    }

    const pts = data.map((v, i) => ({
      x: padX + (i / Math.max(1, data.length - 1)) * plotW,
      y: padY + plotH - ((v - min) / span) * plotH
    }));

    // Area fill
    ctx.beginPath();
    ctx.moveTo(pts[0].x, padY + plotH);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.lineTo(pts[pts.length - 1].x, padY + plotH);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Data points
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    });

    // Min / Max text
    ctx.fillStyle = "#a89cc8";
    ctx.font = "9px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Max: ${max.toFixed(1)}`, padX, 14);
    ctx.fillText(`Min: ${min.toFixed(1)}`, padX, h - 8);

    ctx.restore();
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.DashboardController = DashboardController;
}
