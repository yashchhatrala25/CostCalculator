import {
  Marketplace,
  MarketplaceConfig,
  CalculatorInputs,
  CalculationResult,
  GSTRate,
} from './types';

// ─── Marketplace Configurations ────────────────────────────────────────────

export const MARKETPLACE_CONFIGS: Record<Marketplace, MarketplaceConfig> = {
  amazon: {
    name: 'Amazon',
    displayName: 'Amazon Seller',
    key: 'amazon',
    defaultCommission: 15,
    fixedClosingFee: 25,
    shippingFee: 62,
    commissionEditable: true,
    color: '#ff9900',
    gradient: 'linear-gradient(135deg, #ff9900 0%, #ffb84d 100%)',
    icon: '📦',
    description:
      'Amazon India charges referral fees (2-45% by category), closing fees (₹5-₹75), and weight-based shipping.',
  },
  flipkart: {
    name: 'Flipkart',
    displayName: 'Flipkart Seller',
    key: 'flipkart',
    defaultCommission: 12,
    fixedClosingFee: 20,
    shippingFee: 55,
    commissionEditable: true,
    color: '#2874f0',
    gradient: 'linear-gradient(135deg, #2874f0 0%, #5a9cf7 100%)',
    icon: '🛒',
    description:
      'Flipkart charges commission (3-25% by category), fixed fees (₹5-₹40), and logistics fees by weight zone.',
  },
  meesho: {
    name: 'Meesho',
    displayName: 'Meesho Seller',
    key: 'meesho',
    defaultCommission: 0,
    fixedClosingFee: 0,
    shippingFee: 44,
    commissionEditable: true,
    color: '#e4126b',
    gradient: 'linear-gradient(135deg, #e4126b 0%, #f06292 100%)',
    icon: '🎯',
    description:
      'Meesho charges 0% commission — only logistics/shipping fees apply. Great for new sellers.',
  },
};

export const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

export const GST_ON_MARKETPLACE_SERVICES = 0.18; // 18% GST on marketplace service fees

// ─── Default Inputs ────────────────────────────────────────────────────────

export function getDefaultInputs(marketplace: Marketplace): CalculatorInputs {
  const config = MARKETPLACE_CONFIGS[marketplace];
  return {
    marketplace,
    mode: 'priceToProfit',
    productCost: 0,
    sellingPrice: 0,
    desiredProfit: 0,
    desiredProfitPercent: 20,
    gstRate: 18,
    commissionPercent: config.defaultCommission,
    fixedClosingFee: config.fixedClosingFee,
    shippingFee: config.shippingFee,
    packagingCost: 0,
    advertisingCost: 0,
    returnLossType: 'percentage',
    returnLossPercent: 3,
    returnLossFixed: 0,
  };
}

// ─── Core Calculation Engine ───────────────────────────────────────────────

export function calculate(inputs: CalculatorInputs): CalculationResult {
  const gstDecimal = inputs.gstRate / 100;

  if (inputs.mode === 'priceToProfit') {
    return calculateProfit(inputs, gstDecimal);
  } else {
    return calculateSellingPrice(inputs, gstDecimal);
  }
}

/**
 * Mode B: Given a selling price, calculate the net profit.
 */
function calculateProfit(
  inputs: CalculatorInputs,
  gstDecimal: number
): CalculationResult {
  const P = inputs.sellingPrice;

  // Sales excluding GST
  const salesExcludingGST = P / (1 + gstDecimal);
  const gstAmount = P - salesExcludingGST;

  // Marketplace fees (before GST on services)
  const commissionAmount = (inputs.commissionPercent / 100) * salesExcludingGST;
  const totalMarketplaceFees =
    commissionAmount + inputs.fixedClosingFee + inputs.shippingFee;
  const gstOnMarketplaceFees =
    totalMarketplaceFees * GST_ON_MARKETPLACE_SERVICES;
  const totalMarketplaceFeesWithGST =
    totalMarketplaceFees + gstOnMarketplaceFees;

  // Return/RTO loss buffer
  const returnLossBuffer =
    inputs.returnLossType === 'percentage'
      ? (inputs.returnLossPercent / 100) * P
      : inputs.returnLossFixed;

  // Total deductions
  const totalDeductions =
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    totalMarketplaceFeesWithGST +
    returnLossBuffer;

  // Net profit
  const netProfit = salesExcludingGST - totalDeductions;
  const profitPercent = P > 0 ? (netProfit / P) * 100 : 0;

  return {
    sellingPrice: P,
    salesExcludingGST,
    gstAmount,
    commissionAmount,
    fixedClosingFee: inputs.fixedClosingFee,
    shippingFee: inputs.shippingFee,
    totalMarketplaceFees,
    gstOnMarketplaceFees,
    totalMarketplaceFeesWithGST,
    productCost: inputs.productCost,
    packagingCost: inputs.packagingCost,
    advertisingCost: inputs.advertisingCost,
    returnLossBuffer,
    totalDeductions,
    netProfit,
    profitPercent,
    recommendedSellingPrice: P,
  };
}

/**
 * Mode A: Given a product cost and desired profit, reverse-calculate the required selling price.
 *
 * We need to find P such that:
 *   Net Profit = Sales excl GST - Total Deductions = desiredProfit
 *
 * Sales excl GST = P / (1 + g)
 * Commission = (c% * P) / (1 + g)
 * Marketplace fees = Commission + Fixed + Shipping
 * GST on fees = 0.18 * Marketplace fees
 * RTO buffer = rto% * P (or fixed)
 *
 * Solving for P:
 *   P / (1+g) - [productCost + packaging + advertising + ((c%*P/(1+g)) + fixed + shipping) * 1.18 + rto%*P] = desiredProfit
 *
 * Rearranging:
 *   P * [1/(1+g) - (c%*1.18)/(100*(1+g)) - rto%/100] = desiredProfit + productCost + packaging + advertising + (fixed + shipping)*1.18
 *
 *   P = RHS / coefficient
 */
function calculateSellingPrice(
  inputs: CalculatorInputs,
  gstDecimal: number
): CalculationResult {
  const c = inputs.commissionPercent / 100;
  const g = gstDecimal;
  const rto =
    inputs.returnLossType === 'percentage'
      ? inputs.returnLossPercent / 100
      : 0;
  const fixedRto =
    inputs.returnLossType === 'fixed' ? inputs.returnLossFixed : 0;

  const fixedFees =
    (inputs.fixedClosingFee + inputs.shippingFee) *
    (1 + GST_ON_MARKETPLACE_SERVICES);

  // Coefficient of P
  const coefficient = 1 / (1 + g) - (c * 1.18) / (1 + g) - rto;

  // Right-hand side (fixed costs + desired profit)
  const rhs =
    inputs.desiredProfit +
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    fixedFees +
    fixedRto;

  let P = 0;
  if (coefficient > 0) {
    P = rhs / coefficient;
  }

  // Round up to nearest rupee
  P = Math.ceil(P);

  // Now recalculate the actual result with this selling price
  const salesExcludingGST = P / (1 + g);
  const gstAmount = P - salesExcludingGST;
  const commissionAmount = c * salesExcludingGST;
  const totalMarketplaceFees =
    commissionAmount + inputs.fixedClosingFee + inputs.shippingFee;
  const gstOnMarketplaceFees =
    totalMarketplaceFees * GST_ON_MARKETPLACE_SERVICES;
  const totalMarketplaceFeesWithGST =
    totalMarketplaceFees + gstOnMarketplaceFees;

  const returnLossBuffer =
    inputs.returnLossType === 'percentage'
      ? (inputs.returnLossPercent / 100) * P
      : inputs.returnLossFixed;

  const totalDeductions =
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    totalMarketplaceFeesWithGST +
    returnLossBuffer;

  const netProfit = salesExcludingGST - totalDeductions;
  const profitPercent = P > 0 ? (netProfit / P) * 100 : 0;

  return {
    sellingPrice: P,
    salesExcludingGST,
    gstAmount,
    commissionAmount,
    fixedClosingFee: inputs.fixedClosingFee,
    shippingFee: inputs.shippingFee,
    totalMarketplaceFees,
    gstOnMarketplaceFees,
    totalMarketplaceFeesWithGST,
    productCost: inputs.productCost,
    packagingCost: inputs.packagingCost,
    advertisingCost: inputs.advertisingCost,
    returnLossBuffer,
    totalDeductions,
    netProfit,
    profitPercent,
    recommendedSellingPrice: P,
  };
}

// ─── Formatting Helpers ────────────────────────────────────────────────────

export function formatINR(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '₹0.00';
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);
  return `${value < 0 ? '-' : ''}₹${formatted}`;
}

export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}
