export interface CountryCurrency {
  country: string;
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export const DEFAULT_CURRENCY: CountryCurrency = {
  country: "India",
  code: "INR",
  name: "Indian Rupee",
  symbol: "₹",
  flag: "🇮🇳",
};

export const COUNTRIES_CURRENCIES: CountryCurrency[] = [
  { country: "India", code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { country: "United Arab Emirates", code: "AED", name: "UAE Dirham", symbol: "AED", flag: "🇦🇪" },
  { country: "Saudi Arabia", code: "SAR", name: "Saudi Riyal", symbol: "SAR", flag: "🇸🇦" },
  { country: "Qatar", code: "QAR", name: "Qatari Riyal", symbol: "QAR", flag: "🇶🇦" },
  { country: "Oman", code: "OMR", name: "Omani Rial", symbol: "OMR", flag: "🇴🇲" },
  { country: "Kuwait", code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", flag: "🇰🇼" },
  { country: "Bahrain", code: "BHD", name: "Bahraini Dinar", symbol: "BHD", flag: "🇧🇭" },
  { country: "United States", code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { country: "United Kingdom", code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { country: "Eurozone", code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { country: "Canada", code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { country: "Australia", code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { country: "Singapore", code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { country: "Malaysia", code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { country: "Philippines", code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭" },
  { country: "Bangladesh", code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩" },
  { country: "Pakistan", code: "PKR", name: "Pakistani Rupee", symbol: "Rs", flag: "🇵🇰" },
  { country: "Sri Lanka", code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰" },
  { country: "Nepal", code: "NPR", name: "Nepalese Rupee", symbol: "रू", flag: "🇳🇵" },
  { country: "Turkey", code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { country: "South Africa", code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { country: "New Zealand", code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿" },
  { country: "Japan", code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { country: "Thailand", code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { country: "Indonesia", code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { country: "Vietnam", code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳" },
  { country: "Egypt", code: "EGP", name: "Egyptian Pound", symbol: "EGP", flag: "🇪🇬" },
  { country: "Kenya", code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪" },
  { country: "Nigeria", code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  { country: "Brazil", code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { country: "Mexico", code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽" },
  { country: "Switzerland", code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
];

/**
 * Returns the effective currency symbol for a restaurant, defaulting to "₹" (Rupees).
 */
export function getCurrencySymbol(restaurant?: { currencySymbol?: string; currency?: string } | null): string {
  if (!restaurant) return DEFAULT_CURRENCY.symbol;
  if (restaurant.currencySymbol && restaurant.currencySymbol.trim().length > 0) {
    return restaurant.currencySymbol.trim();
  }
  return DEFAULT_CURRENCY.symbol;
}

/**
 * Formats a price with the given currency symbol.
 * Adds a small space if the symbol is a multi-letter word (e.g. "AED 25", "SAR 30", but "₹199", "$25").
 */
export function formatPrice(price: string | number | undefined | null, symbol: string = DEFAULT_CURRENCY.symbol): string {
  if (price === undefined || price === null || price === "") return "";
  const cleaned = price.toString().replace(/[^0-9.]/g, "");
  if (!cleaned) return "";
  const sym = (symbol || DEFAULT_CURRENCY.symbol).trim();
  const needsSpace = sym.length > 1 && !sym.endsWith(" ");
  return `${sym}${needsSpace ? " " : ""}${cleaned}`;
}

