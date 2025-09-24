// Enhanced Currency Utilities with Multi-Currency Support
interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  position: 'before' | 'after';
}

const currencies: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2, position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, position: 'after' },
  COP: { code: 'COP', symbol: '$', name: 'Colombian Peso', decimals: 0, position: 'before' },
  MXN: { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimals: 2, position: 'before' },
  DOP: { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso', decimals: 2, position: 'before' },
  ARS: { code: 'ARS', symbol: '$', name: 'Argentine Peso', decimals: 2, position: 'before' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', decimals: 2, position: 'before' },
  CLP: { code: 'CLP', symbol: '$', name: 'Chilean Peso', decimals: 0, position: 'before' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2, position: 'before' },
  VES: { code: 'VES', symbol: 'Bs.', name: 'Venezuelan Bolívar', decimals: 2, position: 'before' },
  UYU: { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', decimals: 2, position: 'before' },
  PYG: { code: 'PYG', symbol: '₲', name: 'Paraguayan Guaraní', decimals: 0, position: 'before' },
  BOB: { code: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano', decimals: 2, position: 'before' },
  GTQ: { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal', decimals: 2, position: 'before' },
  CRC: { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón', decimals: 2, position: 'before' },
  PAB: { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa', decimals: 2, position: 'before' },
  NIO: { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba', decimals: 2, position: 'before' },
  HNL: { code: 'HNL', symbol: 'L', name: 'Honduran Lempira', decimals: 2, position: 'before' },
  CUP: { code: 'CUP', symbol: '$', name: 'Cuban Peso', decimals: 2, position: 'before' }
};

class CurrencyService {
  private currentCurrency: string = 'USD';

  constructor() {
    this.loadCurrencySettings();
  }

  // Load currency settings from localStorage
  loadCurrencySettings(): void {
    const stored = localStorage.getItem('rcm3_currency_settings');
    if (stored) {
      const settings = JSON.parse(stored);
      this.currentCurrency = settings.currency || 'USD';
    } else {
      // Try to get from company config
      const companyConfig = localStorage.getItem('rcm3_company_config');
      if (companyConfig) {
        const config = JSON.parse(companyConfig);
        this.currentCurrency = config.currency || 'USD';
      }
    }
  }

  // Save currency settings
  saveCurrencySettings(): void {
    localStorage.setItem('rcm3_currency_settings', JSON.stringify({
      currency: this.currentCurrency
    }));
  }

  // Set current currency
  setCurrency(currencyCode: string): void {
    if (currencies[currencyCode]) {
      this.currentCurrency = currencyCode;
      this.saveCurrencySettings();
    }
  }

  // Get current currency
  getCurrentCurrency(): string {
    return this.currentCurrency;
  }

  // Get currency configuration
  getCurrencyConfig(currencyCode?: string): CurrencyConfig {
    const code = currencyCode || this.currentCurrency;
    return currencies[code] || currencies.USD;
  }

  // Format currency amount
  formatCurrency(amount: number, currencyCode?: string, options?: {
    showSymbol?: boolean;
    showCode?: boolean;
    precision?: number;
  }): string {
    const config = this.getCurrencyConfig(currencyCode);
    const opts = {
      showSymbol: true,
      showCode: false,
      precision: config.decimals,
      ...options
    };

    // Handle null, undefined, or invalid numbers
    if (amount === null || amount === undefined || isNaN(amount)) {
      amount = 0;
    }

    // Format the number with appropriate decimals
    const formattedNumber = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: opts.precision,
      maximumFractionDigits: opts.precision
    }).format(Math.abs(amount));

    // Build the formatted string
    let result = '';
    
    if (opts.showSymbol && config.position === 'before') {
      result += config.symbol + ' ';
    }
    
    // Add negative sign if needed
    if (amount < 0) {
      result = '-' + result;
    }
    
    result += formattedNumber;
    
    if (opts.showSymbol && config.position === 'after') {
      result += ' ' + config.symbol;
    }
    
    if (opts.showCode) {
      result += ` ${config.code}`;
    }

    return result;
  }

  // Parse currency string to number
  parseCurrency(currencyString: string): number {
    if (!currencyString) return 0;
    
    // Remove all non-numeric characters except decimal point and minus sign
    const cleaned = currencyString.replace(/[^\d.,-]/g, '');
    
    // Handle different decimal separators
    const normalized = cleaned.replace(',', '.');
    
    return parseFloat(normalized) || 0;
  }

  // Format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    if (value === null || value === undefined || isNaN(value)) {
      value = 0;
    }
    return `${value.toFixed(decimals)}%`;
  }

  // Format large numbers with units (K, M, B)
  formatLargeNumber(amount: number, currencyCode?: string): string {
    if (amount === null || amount === undefined || isNaN(amount)) {
      amount = 0;
    }

    const config = this.getCurrencyConfig(currencyCode);
    let formattedAmount = Math.abs(amount);
    let unit = '';

    if (formattedAmount >= 1000000000) {
      formattedAmount = formattedAmount / 1000000000;
      unit = 'B';
    } else if (formattedAmount >= 1000000) {
      formattedAmount = formattedAmount / 1000000;
      unit = 'M';
    } else if (formattedAmount >= 1000) {
      formattedAmount = formattedAmount / 1000;
      unit = 'K';
    }

    const formatted = formattedAmount.toFixed(1);
    let result = '';

    if (config.position === 'before') {
      result = `${config.symbol}${formatted}${unit}`;
    } else {
      result = `${formatted}${unit} ${config.symbol}`;
    }

    return amount < 0 ? `-${result}` : result;
  }

  // Get all available currencies
  getAllCurrencies(): CurrencyConfig[] {
    return Object.values(currencies);
  }

  // Convert between currencies (basic implementation - would need real exchange rates)
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // This is a placeholder - in a real implementation, you'd fetch exchange rates
    // For now, return the same amount
    return amount;
  }
}

// Create singleton instance
export const currencyService = new CurrencyService();

// Export the main formatting function for backward compatibility
export const formatCurrency = (amount: number, currencyCode?: string) => {
  return currencyService.formatCurrency(amount, currencyCode);
};

// Export additional utility functions
export const formatPercentage = (value: number, decimals?: number) => {
  return currencyService.formatPercentage(value, decimals);
};

export const formatLargeNumber = (amount: number, currencyCode?: string) => {
  return currencyService.formatLargeNumber(amount, currencyCode);
};

export const parseCurrency = (currencyString: string) => {
  return currencyService.parseCurrency(currencyString);
};