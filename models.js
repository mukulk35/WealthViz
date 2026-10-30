/**
 * WealthViz Pro — Object-Oriented Domain Models
 * 
 * Demonstrates:
 * 1. Abstract Base Class with new.target enforcement (Entity)
 * 2. Strict Encapsulation with ES2022 Private Fields (#field) & Accessor Getters
 * 3. Polymorphism via toRowHtml() and toDetailHtml() implementations
 * 4. Multi-Currency Financial Domain Conversion (CurrencyConverter)
 */

class CurrencyConverter {
  static rates = {
    USD: 1.0,
    EUR: 0.92,
    INR: 84.0,
    GBP: 0.77
  };

  static symbols = {
    USD: "$",
    EUR: "€",
    INR: "₹",
    GBP: "£"
  };

  static convert(amount, from = "USD", to = "USD") {
    if (from === to) return amount;
    const inUSD = amount / (this.rates[from] || 1.0);
    return inUSD * (this.rates[to] || 1.0);
  }

  static formatBillions(amountInUSD, targetCurrency = "USD") {
    const sym = this.symbols[targetCurrency] || "$";
    const converted = this.convert(amountInUSD, "USD", targetCurrency);
    if (Math.abs(converted) >= 1000) {
      return `${sym}${(converted / 1000).toFixed(2)}T`;
    }
    return `${sym}${converted.toFixed(1)}B`;
  }

  static formatStockPrice(nativePrice, nativeCurrency = "USD", targetCurrency = "USD") {
    const sym = this.symbols[targetCurrency] || "$";
    const converted = this.convert(nativePrice, nativeCurrency, targetCurrency);
    return `${sym}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Abstract Base Class Entity
 */
class Entity {
  #id;
  #name;
  #lastUpdated;

  constructor(id, name) {
    if (new.target === Entity) {
      throw new Error("Cannot instantiate abstract class Entity directly. Subclass must be used.");
    }
    if (!id || !name) {
      throw new Error("Entity constructor requires valid 'id' and 'name' parameters.");
    }
    this.#id = id;
    this.#name = name;
    this.#lastUpdated = new Date();
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get lastUpdated() { return this.#lastUpdated; }

  protectedUpdateTimestamp() {
    this.#lastUpdated = new Date();
  }

  // Abstract methods to be overridden by subclasses
  update() {
    throw new Error(`Abstract method update() must be implemented by subclass ${this.constructor.name}.`);
  }

  toRowHtml(options = {}) {
    throw new Error(`Abstract method toRowHtml() must be implemented by subclass ${this.constructor.name}.`);
  }

  toDetailHtml(options = {}) {
    throw new Error(`Abstract method toDetailHtml() must be implemented by subclass ${this.constructor.name}.`);
  }
}

/**
 * Concrete Subclass: Billionaire
 */
class Billionaire extends Entity {
  #rank;
  #netWorth;
  #prevWorth;
  #change;
  #changePct;
  #source;
  #country;
  #company;
  #website;
  #history;

  constructor(data) {
    super(data.id, data.name);
    this.#rank = data.rank || 0;
    this.#netWorth = Number(data.netWorth) || 0;
    this.#prevWorth = this.#netWorth;
    this.#change = 0;
    this.#changePct = 0;
    this.#source = data.source || "Diversified";
    this.#country = data.country || "Global";
    this.#company = data.company || data.source;
    this.#website = data.website || "#";
    this.#history = this._generateInitialHistory(this.#netWorth);
  }

  get rank() { return this.#rank; }
  set rank(val) { this.#rank = Number(val); }

  get netWorth() { return this.#netWorth; }
  get prevWorth() { return this.#prevWorth; }
  get change() { return this.#change; }
  get changePct() { return this.#changePct; }
  get source() { return this.#source; }
  get country() { return this.#country; }
  get company() { return this.#company; }
  get website() { return this.#website; }
  get history() { return [...this.#history]; }

  _generateInitialHistory(base) {
    const hist = [];
    let current = base * 0.92;
    for (let i = 0; i < 14; i++) {
      current += (Math.random() - 0.48) * base * 0.015;
      hist.push(+current.toFixed(2));
    }
    hist.push(base);
    return hist;
  }

  update() {
    // Simulated micro-fluctuation drift (±0.3% max)
    const drift = (Math.random() - 0.49) * this.#netWorth * 0.003;
    this.#prevWorth = this.#netWorth;
    this.#netWorth = +(this.#netWorth + drift).toFixed(2);
    this.#change = +(this.#netWorth - this.#prevWorth).toFixed(2);
    this.#changePct = +((this.#change / this.#prevWorth) * 100).toFixed(2);
    
    this.#history.push(this.#netWorth);
    if (this.#history.length > 20) this.#history.shift();
    
    this.protectedUpdateTimestamp();
  }

  toRowHtml(options = {}) {
    const currency = options.currency || "USD";
    const customRank = options.customRank !== undefined ? options.customRank : this.#rank;
    const isPositive = this.#change >= 0;
    const cls = isPositive ? "positive" : "negative";
    const sign = isPositive ? "+" : "";

    const formattedWorth = CurrencyConverter.formatBillions(this.#netWorth, currency);
    const convertedChange = CurrencyConverter.convert(this.#change, "USD", currency);
    const sym = CurrencyConverter.symbols[currency] || "$";
    const formattedChange = `${sign}${sym}${Math.abs(convertedChange).toFixed(2)}B`;

    return `
      <tr data-type="billionaire" data-id="${this.id}" data-change="${this.#change}" tabindex="0" role="row">
        <td class="rank" aria-label="Rank ${customRank}">#${customRank}</td>
        <td class="name-cell">
          <div style="font-weight:600">${this.name}</div>
        </td>
        <td class="worth">${formattedWorth}</td>
        <td class="change ${cls}">${formattedChange}</td>
        <td class="muted-cell">${this.#source}</td>
        <td><span class="country-pill">${this.#country}</span></td>
      </tr>
    `.trim();
  }

  toDetailHtml(options = {}) {
    const currency = options.currency || "USD";
    const isPositive = this.#change >= 0;
    const cls = isPositive ? "positive" : "negative";
    const sign = isPositive ? "+" : "";
    const sym = CurrencyConverter.symbols[currency] || "$";

    const formattedWorth = CurrencyConverter.formatBillions(this.#netWorth, currency);
    const convertedChange = CurrencyConverter.convert(this.#change, "USD", currency);
    const formattedChange = `${sign}${sym}${Math.abs(convertedChange).toFixed(2)}B (${sign}${this.#changePct.toFixed(2)}%)`;

    return `
      <div class="detail-header">
        <div class="detail-avatar" aria-hidden="true">${this.name.charAt(0)}</div>
        <div class="detail-title">
          <h2 id="modalTitle">${this.name}</h2>
          <div class="sub">Global Rank #${this.#rank} · ${this.#country}</div>
        </div>
      </div>
      <div class="detail-stats">
        <div class="stat-box">
          <div class="label">Simulated Net Worth</div>
          <div class="value">${formattedWorth}</div>
        </div>
        <div class="stat-box">
          <div class="label">24h Simulated Change</div>
          <div class="value ${cls}">${formattedChange}</div>
        </div>
        <div class="stat-box">
          <div class="label">Primary Wealth Source</div>
          <div class="value" style="font-size:0.95rem">${this.#source}</div>
        </div>
        <div class="stat-box">
          <div class="label">Affiliated Enterprise</div>
          <div class="value" style="font-size:0.95rem">${this.#company}</div>
        </div>
      </div>
      <div class="detail-links">
        <a href="${this.#website}" target="_blank" rel="noopener noreferrer">
          Enterprise Profile ↗
        </a>
      </div>
    `.trim();
  }
}

/**
 * Concrete Subclass: Company
 */
class Company extends Entity {
  #ticker;
  #price;
  #prevPrice;
  #change;
  #changePct;
  #marketCap;
  #sector;
  #ceo;
  #website;
  #history;
  #currency;

  constructor(data) {
    super(data.ticker, data.name);
    this.#ticker = data.ticker;
    this.#price = Number(data.price) || 0;
    this.#prevPrice = this.#price;
    this.#change = 0;
    this.#changePct = 0;
    this.#marketCap = Number(data.marketCap) || 0; // in billions USD
    this.#sector = data.sector || "General";
    this.#ceo = data.ceo || "—";
    this.#website = data.website || "#";
    this.#currency = data.currency || "USD";
    this.#history = this._generateInitialHistory(this.#price);
  }

  get ticker() { return this.#ticker; }
  get price() { return this.#price; }
  get prevPrice() { return this.#prevPrice; }
  get change() { return this.#change; }
  get changePct() { return this.#changePct; }
  get marketCap() { return this.#marketCap; }
  get sector() { return this.#sector; }
  get ceo() { return this.#ceo; }
  get website() { return this.#website; }
  get currency() { return this.#currency; }
  get history() { return [...this.#history]; }

  _generateInitialHistory(base) {
    const hist = [];
    let current = base * 0.94;
    for (let i = 0; i < 14; i++) {
      current += (Math.random() - 0.48) * base * 0.02;
      hist.push(+current.toFixed(2));
    }
    hist.push(base);
    return hist;
  }

  update() {
    // Simulated price fluctuation drift (±0.6% max)
    const drift = (Math.random() - 0.49) * this.#price * 0.006;
    this.#prevPrice = this.#price;
    this.#price = +(this.#price + drift).toFixed(2);
    this.#change = +(this.#price - this.#prevPrice).toFixed(2);
    this.#changePct = +((this.#change / this.#prevPrice) * 100).toFixed(2);
    this.#marketCap = +(this.#marketCap * (1 + this.#changePct / 100)).toFixed(1);

    this.#history.push(this.#price);
    if (this.#history.length > 20) this.#history.shift();

    this.protectedUpdateTimestamp();
  }

  toRowHtml(options = {}) {
    const targetCurrency = options.currency || "USD";
    const isPositive = this.#change >= 0;
    const cls = isPositive ? "positive" : "negative";
    const sign = isPositive ? "+" : "";

    const formattedPrice = CurrencyConverter.formatStockPrice(this.#price, this.#currency, targetCurrency);
    const formattedCap = CurrencyConverter.formatBillions(this.#marketCap, targetCurrency);
    const nativeNotice = this.#currency !== targetCurrency ? ` (${this.#currency} ${this.#price.toFixed(1)})` : "";

    return `
      <tr data-type="company" data-id="${this.#ticker}" data-change="${this.#change}" tabindex="0" role="row">
        <td class="ticker">${this.#ticker}</td>
        <td class="name-cell">${this.name}</td>
        <td class="price" title="Native: ${this.#currency} ${this.#price.toFixed(2)}">${formattedPrice}</td>
        <td class="change ${cls}">${sign}${this.#changePct.toFixed(2)}%</td>
        <td class="worth">${formattedCap}</td>
        <td class="muted-cell">${this.#ceo}</td>
        <td><span class="sector-pill sector-${this.#sector.toLowerCase()}">${this.#sector}</span></td>
      </tr>
    `.trim();
  }

  toDetailHtml(options = {}) {
    const targetCurrency = options.currency || "USD";
    const isPositive = this.#change >= 0;
    const cls = isPositive ? "positive" : "negative";
    const sign = isPositive ? "+" : "";

    const formattedPrice = CurrencyConverter.formatStockPrice(this.#price, this.#currency, targetCurrency);
    const formattedCap = CurrencyConverter.formatBillions(this.#marketCap, targetCurrency);

    return `
      <div class="detail-header">
        <div class="detail-avatar" aria-hidden="true">${this.#ticker.substring(0, 2)}</div>
        <div class="detail-title">
          <h2 id="modalTitle">${this.name}</h2>
          <div class="sub">${this.#ticker} · ${this.#sector} · Currency: ${this.#currency}</div>
        </div>
      </div>
      <div class="detail-stats">
        <div class="stat-box">
          <div class="label">Simulated Price (${targetCurrency})</div>
          <div class="value">${formattedPrice}</div>
        </div>
        <div class="stat-box">
          <div class="label">24h Simulated Drift</div>
          <div class="value ${cls}">${sign}${this.#changePct.toFixed(2)}%</div>
        </div>
        <div class="stat-box">
          <div class="label">Market Capitalization</div>
          <div class="value">${formattedCap}</div>
        </div>
        <div class="stat-box">
          <div class="label">Chief Executive Officer</div>
          <div class="value" style="font-size:0.95rem">${this.#ceo}</div>
        </div>
      </div>
      <div class="detail-links">
        <a href="${this.#website}" target="_blank" rel="noopener noreferrer">
          Official Corporate Portal ↗
        </a>
      </div>
    `.trim();
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.CurrencyConverter = CurrencyConverter;
  window.Entity = Entity;
  window.Billionaire = Billionaire;
  window.Company = Company;
}
