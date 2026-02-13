
export interface Currency {
  code: string;           // ISO currency code (USD, EUR, etc.)
  symbol: string;         // Currency symbol ($, €, etc.)
  name: string;          // Currency name
  country: string;       // Country name
  countryCode: string;   // ISO country code (US, GB, etc.)
  symbolNative: string;  // Native symbol (if different)
  decimalDigits: number; // Decimal places
}

export const CURRENCIES: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    symbolNative: "$",
    name: "US Dollar",
    country: "United States",
    countryCode: "US",
    decimalDigits: 2,
  },
  {
    code: "CAD",
    symbol: "CA$",
    symbolNative: "$",
    name: "Canadian Dollar",
    country: "Canada",
    countryCode: "CA",
    decimalDigits: 2,
  },
  {
    code: "BRL",
    symbol: "R$",
    symbolNative: "R$",
    name: "Brazilian Real",
    country: "Brazil",
    countryCode: "BR",
    decimalDigits: 2,
  },
  {
    code: "MXN",
    symbol: "MX$",
    symbolNative: "$",
    name: "Mexican Peso",
    country: "Mexico",
    countryCode: "MX",
    decimalDigits: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    symbolNative: "€",
    name: "Euro",
    country: "European Union",
    countryCode: "EU",
    decimalDigits: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    symbolNative: "£",
    name: "British Pound",
    country: "United Kingdom",
    countryCode: "GB",
    decimalDigits: 2,
  },
  {
    code: "CHF",
    symbol: "CHF",
    symbolNative: "CHF",
    name: "Swiss Franc",
    country: "Switzerland",
    countryCode: "CH",
    decimalDigits: 2,
  },
  {
    code: "RUB",
    symbol: "RUB",
    symbolNative: "₽",
    name: "Russian Ruble",
    country: "Russia",
    countryCode: "RU",
    decimalDigits: 2,
  },
  
  // Asia
  {
    code: "JPY",
    symbol: "¥",
    symbolNative: "￥",
    name: "Japanese Yen",
    country: "Japan",
    countryCode: "JP",
    decimalDigits: 0,
  },
  {
    code: "CNY",
    symbol: "CN¥",
    symbolNative: "CN¥",
    name: "Chinese Yuan",
    country: "China",
    countryCode: "CN",
    decimalDigits: 2,
  },
  {
    code: "INR",
    symbol: "₹",
    symbolNative: "টকা",
    name: "Indian Rupee",
    country: "India",
    countryCode: "IN",
    decimalDigits: 2,
  },
  {
    code: "PKR",
    symbol: "₨",
    symbolNative: "₨",
    name: "Pakistani Rupee",
    country: "Pakistan",
    countryCode: "PK",
    decimalDigits: 2,
  },
  {
    code: "AED",
    symbol: "AED",
    symbolNative: "د.إ.‏",
    name: "UAE Dirham",
    country: "United Arab Emirates",
    countryCode: "AE",
    decimalDigits: 2,
  },
  {
    code: "SAR",
    symbol: "SR",
    symbolNative: "ر.س.‏",
    name: "Saudi Riyal",
    country: "Saudi Arabia",
    countryCode: "SA",
    decimalDigits: 2,
  },
  
  // Africa
  {
    code: "ZAR",
    symbol: "R",
    symbolNative: "R",
    name: "South African Rand",
    country: "South Africa",
    countryCode: "ZA",
    decimalDigits: 2,
  },
  {
    code: "EGP",
    symbol: "E£",
    symbolNative: "ج.م.‏",
    name: "Egyptian Pound",
    country: "Egypt",
    countryCode: "EG",
    decimalDigits: 2,
  },
  
  // Oceania
  {
    code: "AUD",
    symbol: "AU$",
    symbolNative: "$",
    name: "Australian Dollar",
    country: "Australia",
    countryCode: "AU",
    decimalDigits: 2,
  },
  {
    code: "NZD",
    symbol: "NZ$",
    symbolNative: "$",
    name: "New Zealand Dollar",
    country: "New Zealand",
    countryCode: "NZ",
    decimalDigits: 2,
  },
  
  // More currencies...
  {
    code: "KRW",
    symbol: "₩",
    symbolNative: "₩",
    name: "South Korean Won",
    country: "South Korea",
    countryCode: "KR",
    decimalDigits: 0,
  },
  {
    code: "SGD",
    symbol: "S$",
    symbolNative: "$",
    name: "Singapore Dollar",
    country: "Singapore",
    countryCode: "SG",
    decimalDigits: 2,
  },
  {
    code: "MYR",
    symbol: "RM",
    symbolNative: "RM",
    name: "Malaysian Ringgit",
    country: "Malaysia",
    countryCode: "MY",
    decimalDigits: 2,
  },
  {
    code: "IDR",
    symbol: "Rp",
    symbolNative: "Rp",
    name: "Indonesian Rupiah",
    country: "Indonesia",
    countryCode: "ID",
    decimalDigits: 0,
  },
  {
    code: "THB",
    symbol: "฿",
    symbolNative: "฿",
    name: "Thai Baht",
    country: "Thailand",
    countryCode: "TH",
    decimalDigits: 2,
  },
  {
    code: "VND",
    symbol: "₫",
    symbolNative: "₫",
    name: "Vietnamese Dong",
    country: "Vietnam",
    countryCode: "VN",
    decimalDigits: 0,
  },
  {
    code: "PHP",
    symbol: "₱",
    symbolNative: "₱",
    name: "Philippine Peso",
    country: "Philippines",
    countryCode: "PH",
    decimalDigits: 2,
  },
  {
    code: "BDT",
    symbol: "৳",
    symbolNative: "৳",
    name: "Bangladeshi Taka",
    country: "Bangladesh",
    countryCode: "BD",
    decimalDigits: 2,
  },
  {
    code: "LKR",
    symbol: "SLRs",
    symbolNative: "SL Re",
    name: "Sri Lankan Rupee",
    country: "Sri Lanka",
    countryCode: "LK",
    decimalDigits: 2,
  },
  {
    code: "NPR",
    symbol: "NPRs",
    symbolNative: "नेरू",
    name: "Nepalese Rupee",
    country: "Nepal",
    countryCode: "NP",
    decimalDigits: 2,
  },
];

// Helper functions
export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find(currency => currency.code === code.toUpperCase());
};

export const getPopularCurrencies = (): Currency[] => {
  const popularCodes = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY", "INR", "PKR", "AED"];
  return CURRENCIES.filter(currency => popularCodes.includes(currency.code));
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;
  
  return `${currency.symbol}${amount.toFixed(currency.decimalDigits)}`;
};

// Get currencies by region
export const getCurrenciesByRegion = (region: string): Currency[] => {
  const regions: Record<string, string[]> = {
    americas: ["US", "CA", "BR", "MX", "AR", "CL", "CO", "PE"],
    europe: ["EU", "GB", "CH", "RU", "DE", "FR", "IT", "ES", "NL"],
    asia: ["JP", "CN", "IN", "PK", "AE", "SA", "KR", "SG", "MY", "ID", "TH", "VN", "PH", "BD", "LK", "NP"],
    africa: ["ZA", "EG", "NG", "KE", "GH", "MA"],
    oceania: ["AU", "NZ", "FJ", "PG"],
  };
  
  const countryCodes = regions[region.toLowerCase()] || [];
  return CURRENCIES.filter(currency => countryCodes.includes(currency.countryCode));
};