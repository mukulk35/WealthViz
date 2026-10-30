/**
 * WealthViz Pro — Market Data Service
 * 
 * Manages billionaire & corporate entity state, search indexing,
 * country segmentation, and algorithmic simulated updates.
 */

class MarketDataService {
  constructor() {
    this.billionaires = [];
    this.companies = [];
    this.metadata = typeof DATASET_METADATA !== "undefined" ? DATASET_METADATA : {
      benchmarkDate: "October 2024",
      dataSource: "Curated Reference Snapshot",
      isSimulated: true
    };
    this._seed();
  }

  _seed() {
    const bRaw = typeof BILLIONAIRES_RAW_DATA !== "undefined" ? BILLIONAIRES_RAW_DATA : [];
    const cRaw = typeof COMPANIES_RAW_DATA !== "undefined" ? COMPANIES_RAW_DATA : [];

    // Map Billionaires
    this.billionaires = bRaw.map(([rank, name, netWorth, source, country]) => {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return new Billionaire({
        id,
        rank,
        name,
        netWorth,
        source,
        country,
        company: source,
        website: "https://en.wikipedia.org/wiki/" + encodeURIComponent(name.replace(/\s+/g, "_"))
      });
    });

    // BUG FIX #1: Sort immediately at the end of _seed() so first render has strictly sorted ranks!
    this.billionaires.sort((a, b) => b.netWorth - a.netWorth);
    this.billionaires.forEach((b, idx) => {
      b.rank = idx + 1;
    });

    // Map Companies
    this.companies = cRaw.map(c => new Company(c));
  }

  refreshAll() {
    // Perform simulated drift update on all entities
    this.billionaires.forEach(b => b.update());
    this.companies.forEach(c => c.update());

    // Re-rank billionaires strictly by updated net worth
    this.billionaires.sort((a, b) => b.netWorth - a.netWorth);
    this.billionaires.forEach((b, idx) => {
      b.rank = idx + 1;
    });
  }

  search(q) {
    if (!q) return [];
    const query = q.toLowerCase().trim();
    const results = [];

    // Search billionaires
    this.billionaires.forEach(b => {
      if (
        b.name.toLowerCase().includes(query) ||
        b.source.toLowerCase().includes(query) ||
        b.country.toLowerCase().includes(query)
      ) {
        results.push({ type: "billionaire", entity: b });
      }
    });

    // Search companies
    this.companies.forEach(c => {
      if (
        c.ticker.toLowerCase().includes(query) ||
        c.name.toLowerCase().includes(query) ||
        c.sector.toLowerCase().includes(query) ||
        c.ceo.toLowerCase().includes(query)
      ) {
        results.push({ type: "company", entity: c });
      }
    });

    return results.slice(0, 10);
  }

  getBillionaire(id) {
    return this.billionaires.find(b => b.id === id);
  }

  getCompany(ticker) {
    return this.companies.find(c => c.ticker === ticker);
  }

  getCountries() {
    const map = {};
    this.billionaires.forEach(b => {
      map[b.country] = (map[b.country] || 0) + 1;
    });
    return Object.keys(map).sort((a, b) => map[b] - map[a]);
  }

  topByCountry(country, limit = 10) {
    return this.billionaires
      .filter(b => b.country.toLowerCase() === country.toLowerCase())
      .slice(0, limit);
  }

  totalWealth() {
    return this.billionaires.reduce((sum, b) => sum + b.netWorth, 0);
  }

  totalMarketCap() {
    return this.companies.reduce((sum, c) => sum + c.marketCap, 0);
  }

  getWealthByCountryData(topN = 6) {
    const map = {};
    let total = 0;
    this.billionaires.forEach(b => {
      map[b.country] = (map[b.country] || 0) + b.netWorth;
      total += b.netWorth;
    });

    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, topN).map(([country, wealth]) => ({
      country,
      wealth,
      pct: (wealth / total) * 100
    }));

    const otherWealth = sorted.slice(topN).reduce((sum, [, w]) => sum + w, 0);
    if (otherWealth > 0) {
      top.push({
        country: "Other Nations",
        wealth: otherWealth,
        pct: (otherWealth / total) * 100
      });
    }

    return { total, segments: top };
  }
}

// Global attachment
if (typeof window !== "undefined") {
  window.MarketDataService = MarketDataService;
}
