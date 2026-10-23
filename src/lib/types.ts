// ─── Marketplace Types ─────────────────────────────────────────────────────

export type Marketplace = 'amazon' | 'flipkart' | 'meesho';

export type CalculationMode = 'costToPrice' | 'priceToProfit';

export type GSTRate = 0 | 5 | 12 | 18 | 28;

export type ReturnLossType = 'percentage' | 'fixed';

// ─── Marketplace Configuration ─────────────────────────────────────────────

export interface MarketplaceConfig {
  name: string;
  displayName: string;
  key: Marketplace;
  defaultCommission: number; // percentage
  fixedClosingFee: number; // in ₹
  shippingFee: number; // in ₹
  commissionEditable: boolean;
  color: string;
  gradient: string;
  icon: string; // emoji or identifier
  description: string;
}

// ─── Calculator Input State ────────────────────────────────────────────────

export interface CalculatorInputs {
  marketplace: Marketplace;
  mode: CalculationMode;

  // Product details
  productCost: number; // buying/manufacturing cost in ₹
  sellingPrice: number; // customer selling price (Mode B) in ₹
  desiredProfit: number; // desired profit amount (Mode A) in ₹
  desiredProfitPercent: number; // desired profit % (Mode A)

  // GST
  gstRate: GSTRate;

  // Fees
  commissionPercent: number;
  fixedClosingFee: number;
  shippingFee: number;

  // Additional costs
  packagingCost: number;
  advertisingCost: number;

  // Return/RTO
  returnLossType: ReturnLossType;
  returnLossPercent: number;
  returnLossFixed: number;
}

// ─── Calculation Results ───────────────────────────────────────────────────

export interface CalculationResult {
  // Selling price
  sellingPrice: number; // GST-inclusive customer price
  salesExcludingGST: number;
  gstAmount: number;

  // Marketplace fees (before GST on fees)
  commissionAmount: number;
  fixedClosingFee: number;
  shippingFee: number;
  totalMarketplaceFees: number; // commission + fixed + shipping
  gstOnMarketplaceFees: number; // 18% GST on marketplace fees
  totalMarketplaceFeesWithGST: number;

  // Costs
  productCost: number;
  packagingCost: number;
  advertisingCost: number;
  returnLossBuffer: number;

  // Totals
  totalDeductions: number;
  netProfit: number;
  profitPercent: number; // profit as % of selling price

  // Recommended selling price (Mode A)
  recommendedSellingPrice: number;
}

// ─── Seller Details for Invoice ────────────────────────────────────────────

export interface SellerDetails {
  sellerName: string;
  gstin: string;
  itemName: string;
  itemSKU: string;
}

// ─── Breakdown Item for display ────────────────────────────────────────────

export interface BreakdownItem {
  label: string;
  value: number;
  type: 'income' | 'deduction' | 'neutral' | 'result';
  tooltip?: string;
  isSubItem?: boolean;
}
