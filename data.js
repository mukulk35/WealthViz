/**
 * WealthViz Pro — Reference Benchmark Dataset
 * 
 * Top 100 Curated Global Billionaires & Top 15 Global Enterprises
 * Benchmark Reference Date: October 2024
 * Data honesty disclaimer: Net worths and market values represent a curated reference snapshot.
 * Subsequent real-time fluctuations are simulated via algorithmic random walk.
 */

const DATASET_METADATA = {
  benchmarkDate: "October 2024",
  lastAudited: "2024-10-25",
  dataSource: "Curated Reference Snapshot (Public SEC Filings, Bloomberg Index & Forbes Benchmark)",
  isSimulated: true,
  description: "Educational sample dataset for Object-Oriented Programming and Computer Graphics visualization."
};

const BILLIONAIRES_RAW_DATA = [
  [1, "Elon Musk", 342.5, "Tesla, SpaceX, xAI", "USA"],
  [2, "Jeff Bezos", 228.4, "Amazon, Blue Origin", "USA"],
  [3, "Larry Ellison", 212.6, "Oracle", "USA"],
  [4, "Mark Zuckerberg", 204.8, "Meta Platforms", "USA"],
  [5, "Bernard Arnault", 182.3, "LVMH", "France"],
  [6, "Warren Buffett", 146.7, "Berkshire Hathaway", "USA"],
  [7, "Larry Page", 141.2, "Google / Alphabet", "USA"],
  [8, "Sergey Brin", 135.4, "Google / Alphabet", "USA"],
  [9, "Steve Ballmer", 126.8, "Microsoft", "USA"],
  [10, "Bill Gates", 121.5, "Microsoft, Cascade", "USA"],
  [11, "Mukesh Ambani", 115.8, "Reliance Industries", "India"],
  [12, "Jensen Huang", 112.4, "NVIDIA", "USA"],
  [13, "Gautam Adani", 96.5, "Adani Group", "India"],
  [14, "Michael Bloomberg", 94.8, "Bloomberg LP", "USA"],
  [15, "Amancio Ortega", 92.3, "Zara / Inditex", "Spain"],
  [16, "Jim Walton", 88.6, "Walmart", "USA"],
  [17, "Rob Walton", 86.9, "Walmart", "USA"],
  [18, "Alice Walton", 85.7, "Walmart", "USA"],
  [19, "Carlos Slim Helú", 82.4, "América Móvil, Telecom", "Mexico"],
  [20, "Françoise Bettencourt Meyers", 80.6, "L'Oréal", "France"],
  [21, "Michael Dell", 78.5, "Dell Technologies", "USA"],
  [22, "Zhong Shanshan", 72.4, "Nongfu Spring", "China"],
  [23, "Zhang Yiming", 70.2, "ByteDance, TikTok", "China"],
  [24, "Julia Koch & family", 68.5, "Koch Industries", "USA"],
  [25, "Charles Koch", 67.8, "Koch Industries", "USA"],
  [26, "David Thomson & family", 65.3, "Thomson Reuters", "Canada"],
  [27, "Ma Huateng (Pony Ma)", 61.4, "Tencent Holdings", "China"],
  [28, "Dieter Schwarz", 58.7, "Lidl, Kaufland", "Germany"],
  [29, "Colin Huang", 55.6, "PDD Holdings, Temu", "China"],
  [30, "Klaus-Michael Kuehne", 52.8, "Kuehne + Nagel, Logistics", "Germany"],
  [31, "Ken Griffin", 50.4, "Citadel LLC", "USA"],
  [32, "Stephen Schwarzman", 48.9, "Blackstone Group", "USA"],
  [33, "Rodolphe Saadé & family", 47.5, "CMA CGM, Shipping", "France"],
  [34, "Giovanni Ferrero", 46.2, "Ferrero, Nutella", "Italy"],
  [35, "Savitri Jindal & family", 45.1, "JSW, Steel & Power", "India"],
  [36, "Shiv Nadar", 44.3, "HCL Technologies", "India"],
  [37, "Alain Wertheimer", 42.8, "Chanel", "France"],
  [38, "Gérard Wertheimer", 42.6, "Chanel", "France"],
  [39, "Tadashi Yanai", 41.5, "Fast Retailing, Uniqlo", "Japan"],
  [40, "François Pinault", 40.2, "Kering, Luxury Goods", "France"],
  [41, "Beate Heister & family", 39.4, "Aldi Retail", "Germany"],
  [42, "German Larrea Mota Velasco", 38.6, "Grupo México, Mining", "Mexico"],
  [43, "Cyrus Poonawalla", 37.8, "Serum Institute of India", "India"],
  [44, "Thomas Peterffy", 36.5, "Interactive Brokers", "USA"],
  [45, "Eric Schmidt", 35.8, "Google, Technology", "USA"],
  [46, "Jeff Yass", 34.9, "Susquehanna International", "USA"],
  [47, "Iris Fontbona & family", 33.7, "Antofagasta, Mining", "Chile"],
  [48, "Li Ka-shing", 33.2, "CK Hutchison Holdings", "Hong Kong"],
  [49, "Masayoshi Son", 32.5, "SoftBank Group", "Japan"],
  [50, "Jack Ma", 31.8, "Alibaba Group", "China"],
  [51, "Radhakishan Damani", 30.6, "DMart, Retail", "India"],
  [52, "Dilip Shanghvi", 29.4, "Sun Pharma", "India"],
  [53, "Kumar Mangalam Birla", 28.7, "Aditya Birla Group", "India"],
  [54, "Susanne Klatten", 28.1, "BMW, Altana", "Germany"],
  [55, "Takemitsu Takizaki", 27.5, "Keyence, Sensors", "Japan"],
  [56, "Gina Rinehart", 27.2, "Hancock Prospecting", "Australia"],
  [57, "He Xiangjian", 26.4, "Midea Group, Appliances", "China"],
  [58, "Stefan Quandt", 25.8, "BMW", "Germany"],
  [59, "Vladimir Potanin", 25.2, "Nornickel, Metals", "Russia"],
  [60, "Vladimir Lisin", 24.6, "NLMK, Steel", "Russia"],
  [61, "Alexey Mordashov", 24.1, "Severstal, Steel", "Russia"],
  [62, "Leonid Mikhelson", 23.5, "Novatek, Natural Gas", "Russia"],
  [63, "Vagit Alekperov", 23.0, "Lukoil, Energy", "Russia"],
  [64, "R. Budi Hartono", 22.5, "Bank Central Asia, Djarum", "Indonesia"],
  [65, "Michael Hartono", 22.1, "Bank Central Asia, Djarum", "Indonesia"],
  [66, "William Ding", 21.6, "NetEase, Online Gaming", "China"],
  [67, "Wang Chuanfu", 21.2, "BYD, Electric Vehicles", "China"],
  [68, "Lakshmi Mittal", 20.7, "ArcelorMittal, Steel", "India"],
  [69, "Emmanuel Besnier", 20.3, "Lactalis, Dairy", "France"],
  [70, "Andrew Forrest", 19.8, "Fortescue Metals", "Australia"],
  [71, "Uday Kotak", 19.4, "Kotak Mahindra Bank", "India"],
  [72, "Hasso Plattner", 18.9, "SAP, Software", "Germany"],
  [73, "Aliko Dangote", 18.5, "Dangote Group, Cement & Oil", "Nigeria"],
  [74, "Anthony Pratt", 17.8, "Pratt Industries, Packaging", "Australia"],
  [75, "Harry Triguboff", 17.2, "Meriton, Real Estate", "Australia"],
  [76, "Shigenobu Nagamori", 16.7, "Nidec, Electric Motors", "Japan"],
  [77, "Dietmar Hopp", 16.2, "SAP, Software", "Germany"],
  [78, "Peter Woo", 15.8, "Wheelock & Co, Real Estate", "Hong Kong"],
  [79, "Lee Shau Kee", 15.4, "Henderson Land", "Hong Kong"],
  [80, "Joseph Lau", 14.9, "Chinese Estates", "Hong Kong"],
  [81, "Andreas von Bechtolsheim", 14.5, "Arista Networks", "Germany"],
  [82, "Rafael del Pino", 13.9, "Ferrovial, Infrastructure", "Spain"],
  [83, "Sandra Ortega Mera", 13.4, "Inditex, Real Estate", "Spain"],
  [84, "Nobutada Saji", 13.0, "Suntory, Beverages", "Japan"],
  [85, "Carrie Perrodo & family", 12.6, "Perenco, Energy", "France"],
  [86, "Juan Roig", 11.9, "Mercadona, Supermarkets", "Spain"],
  [87, "Massimiliana Landini Aleotti", 11.4, "Menarini, Pharma", "Italy"],
  [88, "Patrizio Bertelli", 10.8, "Prada Group, Fashion", "Italy"],
  [89, "Miuccia Prada", 10.7, "Prada Group, Fashion", "Italy"],
  [90, "Nassef Sawiris", 9.8, "OCI Global, Construction", "Egypt"],
  [91, "Frank Lowy", 9.2, "Westfield, Retail", "Australia"],
  [92, "Mike Adenuga", 8.5, "Globacom, Conoil", "Nigeria"],
  [93, "Abdulsamad Rabiu", 8.2, "BUA Group, Cement & Sugar", "Nigeria"],
  [94, "Lui Che Woo", 8.0, "Galaxy Entertainment", "Hong Kong"],
  [95, "Ren Zhengfei", 7.8, "Huawei, Telecommunications", "China"],
  [96, "Sunil Mittal", 7.5, "Bharti Airtel, Telecom", "India"],
  [97, "John Fredriksen", 7.2, "Frontline, Shipping", "Norway"],
  [98, "Patrice Motsepe", 6.8, "African Rainbow Minerals", "South Africa"],
  [99, "Florentino Pérez", 6.5, "ACS Group, Construction", "Spain"],
  [100, "Terry Gou", 6.2, "Foxconn, Electronics", "Taiwan"]
];

const COMPANIES_RAW_DATA = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 228.40,
    marketCap: 3450,
    sector: "Technology",
    ceo: "Tim Cook",
    currency: "USD",
    website: "https://www.apple.com"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    price: 425.80,
    marketCap: 3160,
    sector: "Technology",
    ceo: "Satya Nadella",
    currency: "USD",
    website: "https://www.microsoft.com"
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    price: 138.50,
    marketCap: 3400,
    sector: "Technology",
    ceo: "Jensen Huang",
    currency: "USD",
    website: "https://www.nvidia.com"
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 178.20,
    marketCap: 2200,
    sector: "Technology",
    ceo: "Sundar Pichai",
    currency: "USD",
    website: "https://abc.xyz"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 198.75,
    marketCap: 2080,
    sector: "Consumer",
    ceo: "Andy Jassy",
    currency: "USD",
    website: "https://www.amazon.com"
  },
  {
    ticker: "META",
    name: "Meta Platforms Inc.",
    price: 582.30,
    marketCap: 1480,
    sector: "Technology",
    ceo: "Mark Zuckerberg",
    currency: "USD",
    website: "https://about.meta.com"
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 248.90,
    marketCap: 795,
    sector: "Automotive",
    ceo: "Elon Musk",
    currency: "USD",
    website: "https://www.tesla.com"
  },
  {
    ticker: "BRK.B",
    name: "Berkshire Hathaway",
    price: 455.20,
    marketCap: 980,
    sector: "Financial",
    ceo: "Warren Buffett",
    currency: "USD",
    website: "https://www.berkshirehathaway.com"
  },
  {
    ticker: "TSM",
    name: "TSMC",
    price: 195.60,
    marketCap: 1010,
    sector: "Technology",
    ceo: "C.C. Wei",
    currency: "USD",
    website: "https://www.tsmc.com"
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    price: 875.40,
    marketCap: 830,
    sector: "Healthcare",
    ceo: "David Ricks",
    currency: "USD",
    website: "https://www.lilly.com"
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    price: 290.15,
    marketCap: 580,
    sector: "Financial",
    ceo: "Ryan McInerney",
    currency: "USD",
    website: "https://www.visa.com"
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    price: 248.70,
    marketCap: 710,
    sector: "Financial",
    ceo: "Jamie Dimon",
    currency: "USD",
    website: "https://www.jpmorganchase.com"
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corporation",
    price: 118.30,
    marketCap: 520,
    sector: "Energy",
    ceo: "Darren Woods",
    currency: "USD",
    website: "https://corporate.exxonmobil.com"
  },
  {
    ticker: "RELIANCE",
    name: "Reliance Industries",
    price: 2980.50,
    marketCap: 245,
    sector: "Conglomerate",
    ceo: "Mukesh Ambani",
    currency: "INR",
    website: "https://www.ril.com"
  },
  {
    ticker: "ORCL",
    name: "Oracle Corporation",
    price: 175.80,
    marketCap: 480,
    sector: "Technology",
    ceo: "Safra Catz",
    currency: "USD",
    website: "https://www.oracle.com"
  }
];

// Attach globally for browser script tag compatibility
if (typeof window !== "undefined") {
  window.DATASET_METADATA = DATASET_METADATA;
  window.BILLIONAIRES_RAW_DATA = BILLIONAIRES_RAW_DATA;
  window.COMPANIES_RAW_DATA = COMPANIES_RAW_DATA;
}
