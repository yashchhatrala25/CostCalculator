import {
  Marketplace,
  MarketplaceConfig,
  CalculatorInputs,
  CalculationResult,
  GSTRate,
} from './types';

// ─── Marketplace Configurations & Presets ──────────────────────────────────

export const MARKETPLACE_CONFIGS: Record<Marketplace, MarketplaceConfig> = {
  amazon: {
    name: 'Amazon',
    displayName: 'Amazon Seller',
    key: 'amazon',
    defaultCommission: 12,
    fixedClosingFee: 25,
    shippingFee: 62,
    commissionEditable: true,
    color: '#ff9900',
    gradient: 'linear-gradient(135deg, #ff9900 0%, #ffb84d 100%)',
    icon: '📦',
    description:
      'Amazon India charges referral fees (2%–38% by category), closing fees (₹5–₹70), and Easy Ship logistics fees.',
    categoryPresets: [
      { name: 'Apparel & Fashion (15%)', commission: 15 },
      { name: 'Electronics & Mobiles (8%)', commission: 8 },
      { name: 'Home & Kitchen (12%)', commission: 12 },
      { name: 'Beauty & Health (9%)', commission: 9 },
      { name: 'Books & Media (5%)', commission: 5 },
      { name: 'Jewellery & Watches (13%)', commission: 13 },
      { name: 'Footwear (14%)', commission: 14 },
    ],
  },
  flipkart: {
    name: 'Flipkart',
    displayName: 'Flipkart Seller',
    key: 'flipkart',
    defaultCommission: 11,
    fixedClosingFee: 20,
    shippingFee: 55,
    commissionEditable: true,
    color: '#2874f0',
    gradient: 'linear-gradient(135deg, #2874f0 0%, #5a9cf7 100%)',
    icon: '🛒',
    description:
      'Flipkart charges category commission (3%–22%), fixed closing fees (₹5–₹45), and Ekart shipping charges.',
    categoryPresets: [
      { name: 'Clothing & Apparel (14%)', commission: 14 },
      { name: 'Mobiles & Accessories (7%)', commission: 7 },
      { name: 'Home Furnishing (11%)', commission: 11 },
      { name: 'Personal Care (8.5%)', commission: 8.5 },
      { name: 'Footwear (13.5%)', commission: 13.5 },
      { name: 'Toys & Baby Care (10%)', commission: 10 },
    ],
  },
  meesho: {
    name: 'Meesho',
    displayName: 'Meesho Seller',
    key: 'meesho',
    defaultCommission: 0,
    fixedClosingFee: 0,
    shippingFee: 45,
    commissionEditable: true,
    color: '#e4126b',
    gradient: 'linear-gradient(135deg, #e4126b 0%, #f06292 100%)',
    icon: '🎯',
    description:
      'Meesho charges 0% commission and ₹0 closing fee! Sellers only pay logistics / national shipping.',
    categoryPresets: [
      { name: 'All Categories (0% Commission)', commission: 0 },
    ],
  },
};

export const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

export const GST_ON_MARKETPLACE_SERVICES = 0.18; // 18% GST on marketplace commission, closing & shipping

// ─── Default Inputs ────────────────────────────────────────────────────────

export function getDefaultInputs(marketplace: Marketplace): CalculatorInputs {
  const config = MARKETPLACE_CONFIGS[marketplace];
  return {
    marketplace,
    mode: 'priceToProfit',
    productCost: 250,
    sellingPrice: 799,
    desiredProfitType: 'amount',
    desiredProfit: 150,
    desiredProfitPercent: 20,
    gstRate: 18,
    commissionPercent: config.defaultCommission,
    fixedClosingFee: config.fixedClosingFee,
    shippingFee: config.shippingFee,
    packagingCost: 15,
    advertisingCost: 35,
    returnLossMode: 'detailed',
    // Simple
    simpleReturnType: 'percentage',
    simpleReturnPercent: 3,
    simpleReturnFixed: 30,
    // Detailed (differentiating Customer Return vs Courier RTO)
    customerReturnRate: 6, // 6% customer return rate
    customerReturnCost: 120, // ₹120 reverse logistics & refurbishment per customer return
    courierRTORate: 8, // 8% courier RTO (undelivered/rejected at door)
    courierRTOCost: 60, // ₹60 courier freight cost on RTO
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
 * Calculates Return & RTO Loss buffer based on simple or detailed mode.
 */
function computeReturnLoss(
  inputs: CalculatorInputs,
  P: number
): {
  customerReturnBuffer: number;
  courierRTOBuffer: number;
  returnLossBuffer: number;
} {
  if (inputs.returnLossMode === 'simple') {
    if (inputs.simpleReturnType === 'percentage') {
      const buffer = (inputs.simpleReturnPercent / 100) * P;
      return {
        customerReturnBuffer: buffer * 0.5,
        courierRTOBuffer: buffer * 0.5,
        returnLossBuffer: buffer,
      };
    } else {
      const buffer = inputs.simpleReturnFixed;
      return {
        customerReturnBuffer: buffer * 0.5,
        courierRTOBuffer: buffer * 0.5,
        returnLossBuffer: buffer,
      };
    }
  } else {
    // Detailed differentiation:
    // Customer Return Buffer = (Customer Return Rate % / 100) * Customer Return Cost
    const customerReturnBuffer =
      (inputs.customerReturnRate / 100) * inputs.customerReturnCost;
    // Courier RTO Buffer = (Courier RTO Rate % / 100) * Courier RTO Cost
    const courierRTOBuffer =
      (inputs.courierRTORate / 100) * inputs.courierRTOCost;
    const returnLossBuffer = customerReturnBuffer + courierRTOBuffer;

    return {
      customerReturnBuffer,
      courierRTOBuffer,
      returnLossBuffer,
    };
  }
}

/**
 * Mode B: Given Customer Selling Price (P), calculate Net Profit.
 */
function calculateProfit(
  inputs: CalculatorInputs,
  gstDecimal: number
): CalculationResult {
  const P = Math.max(0, inputs.sellingPrice);

  // 1. Sales excluding GST = P / (1 + g)
  const salesExcludingGST = P > 0 ? P / (1 + gstDecimal) : 0;
  // 2. GST Amount = P - Sales excluding GST
  const gstAmount = P - salesExcludingGST;

  // 3. Marketplace Fees
  // Commission is charged on base selling price (salesExcludingGST)
  const commissionAmount = (inputs.commissionPercent / 100) * salesExcludingGST;
  const totalMarketplaceFees =
    commissionAmount + inputs.fixedClosingFee + inputs.shippingFee;
  // 18% GST on marketplace services
  const gstOnMarketplaceFees =
    totalMarketplaceFees * GST_ON_MARKETPLACE_SERVICES;
  const totalMarketplaceFeesWithGST =
    totalMarketplaceFees + gstOnMarketplaceFees;

  // 4. Return / Courier RTO Loss Buffer
  const { customerReturnBuffer, courierRTOBuffer, returnLossBuffer } =
    computeReturnLoss(inputs, P);

  // 5. Total Deductions = Product Cost + Packaging + Advertising + Marketplace Fees + RTO Buffer
  const totalDeductions =
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    totalMarketplaceFeesWithGST +
    returnLossBuffer;

  // 6. Net Profit = Sales excluding GST - Total Deductions
  const netProfit = salesExcludingGST - totalDeductions;
  const profitPercent = P > 0 ? (netProfit / P) * 100 : 0;
  const profitOnCostPercent =
    inputs.productCost > 0 ? (netProfit / inputs.productCost) * 100 : 0;

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
    customerReturnBuffer,
    courierRTOBuffer,
    returnLossBuffer,
    totalDeductions,
    netProfit,
    profitPercent,
    profitOnCostPercent,
    recommendedSellingPrice: P,
  };
}

/**
 * Mode A: Reverse-calculate exact Selling Price (P) required to achieve target profit.
 */
function calculateSellingPrice(
  inputs: CalculatorInputs,
  gstDecimal: number
): CalculationResult {
  const c = inputs.commissionPercent / 100;
  const g = gstDecimal;

  // Fixed marketplace fees with 18% GST
  const fixedMarketplaceFeesWithGST =
    (inputs.fixedClosingFee + inputs.shippingFee) *
    (1 + GST_ON_MARKETPLACE_SERVICES);

  // Determine return loss components
  let returnLossPctOfPrice = 0;
  let returnLossFixedPerUnit = 0;

  if (inputs.returnLossMode === 'simple') {
    if (inputs.simpleReturnType === 'percentage') {
      returnLossPctOfPrice = inputs.simpleReturnPercent / 100;
    } else {
      returnLossFixedPerUnit = inputs.simpleReturnFixed;
    }
  } else {
    // Detailed mode uses fixed rupee costs per return & RTO
    returnLossFixedPerUnit =
      (inputs.customerReturnRate / 100) * inputs.customerReturnCost +
      (inputs.courierRTORate / 100) * inputs.courierRTOCost;
  }

  // Base fixed deductions
  const baseFixedCosts =
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    fixedMarketplaceFeesWithGST +
    returnLossFixedPerUnit;

  let P = 0;

  if (inputs.desiredProfitType === 'amount') {
    // Target is fixed rupee profit
    // P / (1+g) - [baseFixedCosts + 1.18 * c * P / (1+g) + returnLossPctOfPrice * P] = desiredProfit
    // P * [ (1 - 1.18 * c) / (1 + g) - returnLossPctOfPrice ] = desiredProfit + baseFixedCosts
    const coeff = (1 - (1 + GST_ON_MARKETPLACE_SERVICES) * c) / (1 + g) - returnLossPctOfPrice;
    const numerator = inputs.desiredProfit + baseFixedCosts;

    if (coeff > 0) {
      P = numerator / coeff;
    }
  } else {
    // Target is margin percentage m = desiredProfitPercent / 100
    // Net profit = m * P
    // P * [ (1 - 1.18 * c) / (1 + g) - returnLossPctOfPrice - m ] = baseFixedCosts
    const m = inputs.desiredProfitPercent / 100;
    const coeff =
      (1 - (1 + GST_ON_MARKETPLACE_SERVICES) * c) / (1 + g) -
      returnLossPctOfPrice -
      m;

    if (coeff > 0) {
      P = baseFixedCosts / coeff;
    }
  }

  // Round up to clean integer rupee
  P = Math.max(0, Math.ceil(P));

  // Now recalculate complete result using this calculated P
  const salesExcludingGST = P > 0 ? P / (1 + g) : 0;
  const gstAmount = P - salesExcludingGST;
  const commissionAmount = c * salesExcludingGST;
  const totalMarketplaceFees =
    commissionAmount + inputs.fixedClosingFee + inputs.shippingFee;
  const gstOnMarketplaceFees =
    totalMarketplaceFees * GST_ON_MARKETPLACE_SERVICES;
  const totalMarketplaceFeesWithGST =
    totalMarketplaceFees + gstOnMarketplaceFees;

  const { customerReturnBuffer, courierRTOBuffer, returnLossBuffer } =
    computeReturnLoss(inputs, P);

  const totalDeductions =
    inputs.productCost +
    inputs.packagingCost +
    inputs.advertisingCost +
    totalMarketplaceFeesWithGST +
    returnLossBuffer;

  const netProfit = salesExcludingGST - totalDeductions;
  const profitPercent = P > 0 ? (netProfit / P) * 100 : 0;
  const profitOnCostPercent =
    inputs.productCost > 0 ? (netProfit / inputs.productCost) * 100 : 0;

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
    customerReturnBuffer,
    courierRTOBuffer,
    returnLossBuffer,
    totalDeductions,
    netProfit,
    profitPercent,
    profitOnCostPercent,
    recommendedSellingPrice: P,
  };
}

// ─── Currency & Number Formatters ──────────────────────────────────────────

export function formatINR(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '₹0.00';
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Format currency for PDF outputs using 'Rs.' to guarantee standard font compatibility.
 */
export function formatPDFCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'Rs. 0.00';
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absValue);
  return `${isNegative ? '-' : ''}Rs. ${formatted}`;
}

export function formatPercent(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}
