import { jsPDF } from 'jspdf';
import { CalculationResult, SellerDetails, Marketplace, CalculatorInputs } from './types';
import { formatPDFCurrency, formatPercent, MARKETPLACE_CONFIGS } from './calculator';

/**
 * Generates a clean, professional, printable PDF Cost Breakdown / Invoice.
 * Uses ASCII-safe 'Rs.' formatting to guarantee perfect cross-platform rendering
 * without missing glyphs.
 */
export function generatePDF(
  result: CalculationResult,
  inputs: CalculatorInputs,
  sellerDetails: SellerDetails,
  marketplace: Marketplace
): void {
  const config = MARKETPLACE_CONFIGS[marketplace];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── Color Palette ──────────────────────────────────────────────
  const brandDark: [number, number, number] = [17, 24, 39]; // #111827
  const primaryIndigo: [number, number, number] = [79, 70, 229]; // #4F46E5
  const slate600: [number, number, number] = [71, 85, 105];
  const slate400: [number, number, number] = [148, 163, 184];
  const lightBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const borderLight: [number, number, number] = [226, 232, 240];
  const successGreen: [number, number, number] = [16, 149, 93];
  const dangerRose: [number, number, number] = [225, 29, 72];
  const white: [number, number, number] = [255, 255, 255];

  // ─── Header Banner ──────────────────────────────────────────────
  doc.setFillColor(...brandDark);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, 'F');

  // Marketplace Accent Pill on Right
  doc.setFillColor(...primaryIndigo);
  doc.roundedRect(pageWidth - margin - 42, y + 5, 36, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text(config.name.toUpperCase(), pageWidth - margin - 24, y + 9.5, { align: 'center' });

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...white);
  doc.text('E-COMMERCE SELLER COST & PROFIT SHEET', margin + 6, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slate400);
  const dateStr = sellerDetails.orderDate || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.text(
    `Marketplace: ${config.displayName}   |   Date: ${dateStr}   |   Mode: ${
      inputs.mode === 'costToPrice' ? 'Cost -> Target Price' : 'Price -> Net Profit'
    }`,
    margin + 6,
    y + 19
  );

  y += 31;

  // ─── Seller & Item Details Card ─────────────────────────────────
  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderLight);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2 + 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...primaryIndigo);
  doc.text('SELLER & PRODUCT SPECIFICATIONS', col1X, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...slate600);
  doc.text('Business Name:', col1X, y + 12);
  doc.text('GSTIN:', col1X, y + 17);
  doc.text('Invoice / Ref #:', col1X, y + 22);

  doc.text('Item Name:', col2X, y + 12);
  doc.text('SKU Code:', col2X, y + 17);
  doc.text('Applicable GST Rate:', col2X, y + 22);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...brandDark);
  doc.text(sellerDetails.sellerName || 'Unregistered Seller', col1X + 24, y + 12);
  doc.text(sellerDetails.gstin || 'Not Provided', col1X + 24, y + 17);
  doc.text(sellerDetails.invoiceNumber || `CALC-${Date.now().toString().slice(-6)}`, col1X + 24, y + 22);

  doc.text(sellerDetails.itemName || 'Sample Product', col2X + 22, y + 12);
  doc.text(sellerDetails.itemSKU || 'SKU-001', col2X + 22, y + 17);
  doc.text(`${inputs.gstRate}% GST`, col2X + 32, y + 22);

  y += 31;

  // ─── Table Rendering Utility ────────────────────────────────────
  function drawSectionHeader(title: string) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(...borderLight);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryIndigo);
    doc.text(title, margin + 4, y + 4.2);
    y += 7.5;
  }

  function drawTableRow(
    description: string,
    amountStr: string,
    opts?: {
      bold?: boolean;
      indent?: boolean;
      color?: [number, number, number];
      highlight?: boolean;
    }
  ) {
    if (opts?.highlight) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }

    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...(opts?.color || (opts?.bold ? brandDark : slate600)));

    const indentStr = opts?.indent ? '      - ' : '';
    doc.text(indentStr + description, margin + 4, y + 4.5);
    doc.text(amountStr, margin + contentWidth - 4, y + 4.5, { align: 'right' });

    // subtle line
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6, margin + contentWidth, y + 6);
    y += 6.5;
  }

  // ─── 1. Revenue & GST Breakdown ─────────────────────────────────
  drawSectionHeader('1. REVENUE & GST ANALYSIS');
  drawTableRow('Customer Selling Price (GST Inclusive)', formatPDFCurrency(result.sellingPrice), {
    bold: true,
  });
  drawTableRow(`Sales Value Excluding GST [ P / (1 + ${inputs.gstRate}%) ]`, formatPDFCurrency(result.salesExcludingGST), {
    indent: true,
  });
  drawTableRow(`Output GST Payable to Govt (${inputs.gstRate}%)`, formatPDFCurrency(result.gstAmount), {
    indent: true,
    color: slate600,
  });

  y += 2;

  // ─── 2. Direct Product & Operations Costs ───────────────────────
  drawSectionHeader('2. PRODUCT PROCUREMENT & PACKAGING');
  drawTableRow('Product Base Manufacturing / Buying Cost', formatPDFCurrency(result.productCost));
  drawTableRow('Packaging Material Cost (Boxes, polybags, tape)', formatPDFCurrency(result.packagingCost), {
    indent: true,
  });
  drawTableRow('Advertising / Marketing Ad Spend per order', formatPDFCurrency(result.advertisingCost), {
    indent: true,
  });

  y += 2;

  // ─── 3. Marketplace Service Fees Breakdown ──────────────────────
  drawSectionHeader(`3. ${config.name.toUpperCase()} SERVICE FEES & 18% GST`);
  drawTableRow(
    `Referral / Commission Fee (${inputs.commissionPercent}% on Base)`,
    formatPDFCurrency(result.commissionAmount),
    { indent: true }
  );
  drawTableRow('Fixed Closing Fee per Order', formatPDFCurrency(result.fixedClosingFee), {
    indent: true,
  });
  drawTableRow('Shipping / Logistics Fee (Weight & Zone basis)', formatPDFCurrency(result.shippingFee), {
    indent: true,
  });
  drawTableRow(
    'GST on Marketplace Services (18% on Commission + Fixed + Shipping)',
    formatPDFCurrency(result.gstOnMarketplaceFees),
    { indent: true, color: slate600 }
  );
  drawTableRow('Total Marketplace Fees Deducted (GST Inclusive)', formatPDFCurrency(result.totalMarketplaceFeesWithGST), {
    bold: true,
    color: dangerRose,
  });

  y += 2;

  // ─── 4. Return & Courier RTO Risk Provisions ────────────────────
  drawSectionHeader('4. RETURN & COURIER RTO PROVISION PER UNIT');
  if (inputs.returnLossMode === 'detailed') {
    drawTableRow(
      `Customer Return Provision (${inputs.customerReturnRate}% rate @ ${formatPDFCurrency(inputs.customerReturnCost)} loss)`,
      formatPDFCurrency(result.customerReturnBuffer),
      { indent: true }
    );
    drawTableRow(
      `Courier RTO Provision (${inputs.courierRTORate}% rate @ ${formatPDFCurrency(inputs.courierRTOCost)} loss)`,
      formatPDFCurrency(result.courierRTOBuffer),
      { indent: true }
    );
  } else {
    drawTableRow(
      `Return & RTO Loss Buffer (${
        inputs.simpleReturnType === 'percentage'
          ? inputs.simpleReturnPercent + '% of price'
          : 'Fixed Rs.'
      })`,
      formatPDFCurrency(result.returnLossBuffer),
      { indent: true }
    );
  }
  drawTableRow('Total Return / RTO Provision', formatPDFCurrency(result.returnLossBuffer), {
    bold: true,
    color: slate600,
  });

  y += 3;

  // ─── 5. Summary & Bottom Line ───────────────────────────────────
  // Total Deductions Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(...dangerRose);
  doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...dangerRose);
  doc.text('TOTAL SELLER DEDUCTIONS (Costs + Marketplace Fees + Returns)', margin + 4, y + 6);
  doc.text(formatPDFCurrency(result.totalDeductions), margin + contentWidth - 4, y + 6, {
    align: 'right',
  });

  y += 12;

  // Net Profit Box
  const isProfit = result.netProfit >= 0;
  doc.setFillColor(isProfit ? 236 : 254, isProfit ? 253 : 242, isProfit ? 245 : 242);
  doc.setDrawColor(...(isProfit ? successGreen : dangerRose));
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...(isProfit ? successGreen : dangerRose));
  doc.text('ESTIMATED NET PROFIT PER ORDER', margin + 4, y + 7.5);
  doc.text(
    `${formatPDFCurrency(result.netProfit)}  (${formatPercent(result.profitPercent)} Margin)`,
    margin + contentWidth - 4,
    y + 7.5,
    { align: 'right' }
  );

  y += 15;

  if (inputs.mode === 'costToPrice') {
    doc.setFillColor(238, 242, 255);
    doc.setDrawColor(...primaryIndigo);
    doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryIndigo);
    doc.text('RECOMMENDED SELLING PRICE (CUSTOMER MRP)', margin + 4, y + 6.5);
    doc.text(formatPDFCurrency(result.recommendedSellingPrice), margin + contentWidth - 4, y + 6.5, {
      align: 'right',
    });
    y += 13;
  }

  // ─── Disclaimer Footer ──────────────────────────────────────────
  y = Math.max(y + 2, 275);
  doc.setDrawColor(...borderLight);
  doc.line(margin, y, margin + contentWidth, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...slate400);
  doc.text(
    'Disclaimer: This calculation sheet is an analytical estimation tool based on user-provided inputs and published marketplace fee schedules.',
    margin,
    y + 3.5
  );
  doc.text(
    'Marketplace rates (referral, closing, shipping) may vary by sub-category, order weight tier, local vs regional vs national shipping zones.',
    margin,
    y + 6.5
  );
  doc.text(
    'Generated via E-commerce Seller Cost & Profit Calculator for Indian Marketplaces',
    margin,
    y + 9.5
  );

  // Download PDF
  const filename = `${config.key}-cost-breakdown-${Date.now().toString().slice(-6)}.pdf`;
  doc.save(filename);
}
