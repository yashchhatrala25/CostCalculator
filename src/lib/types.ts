// ─── Marketplace Types ─────────────────────────────────────────────────────

export type Marketplace = 'amazon' | 'flipkart' | 'meesho';

export type CalculationMode = 'costToPrice' | 'priceToProfit';

export type DesiredProfitType = 'amount' | 'marginPercent';

export type GSTRate = 0 | 5 | 12 | 18 | 28;

export type ReturnLossMode = 'simple' | 'detailed';

export type SimpleReturnType = 'percentage' | 'fixed';

// ─── Category Preset ───────────────────────────────────────────────────────

export interface CategoryPreset {
  name: string;
  commission: number;
}

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
  icon: string;
  description: string;
  categoryPresets: CategoryPreset[];
}

// ─── Calculator Input State ────────────────────────────────────────────────

export interface CalculatorInputs {
  marketplace: Marketplace;
  mode: CalculationMode;

  // Product details
  productCost: number; // buying/manufacturing cost in ₹
  sellingPrice: number; // customer selling price (Mode B) in ₹
  desiredProfitType: DesiredProfitType; // Mode A: ₹ amount or % margin
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

  // Return & Courier RTO
  returnLossMode: ReturnLossMode; // 'simple' | 'detailed'
  // Simple mode:
  simpleReturnType: SimpleReturnType; // 'percentage' | 'fixed'
  simpleReturnPercent: number; // % of selling price
  simpleReturnFixed: number; // fixed ₹ per order
  // Detailed mode (differentiating Customer Return vs Courier RTO):
  customerReturnRate: number; // % of orders that are customer returns
  customerReturnCost: number; // ₹ loss per customer return (reverse shipping + damaged goods)
  courierRTORate: number; // % of orders that are courier RTO (undelivered/rejected)
  courierRTOCost: number; // ₹ loss per courier RTO (forward/return freight loss)
}

// ─── Calculation Results ───────────────────────────────────────────────────

export interface CalculationResult {
  // Selling price
  sellingPrice: number; // GST-inclusive customer price (P)
  salesExcludingGST: number; // P / (1 + g)
  gstAmount: number; // P - salesExcludingGST

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

  // Return & RTO Breakdown
  customerReturnBuffer: number; // per unit loss
  courierRTOBuffer: number; // per unit loss
  returnLossBuffer: number; // total return/RTO buffer per unit

  // Totals
  totalDeductions: number;
  netProfit: number;
  profitPercent: number; // profit as % of selling price
  profitOnCostPercent: number; // profit as % of product cost (ROI)

  // Recommended selling price (Mode A)
  recommendedSellingPrice: number;
}

// ─── Seller Details for Invoice ────────────────────────────────────────────

export interface SellerDetails {
  sellerName: string;
  gstin: string;
  itemName: string;
  itemSKU: string;
  invoiceNumber: string;
  orderDate: string;
}
