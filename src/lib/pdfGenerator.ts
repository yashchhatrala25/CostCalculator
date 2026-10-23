import { jsPDF } from 'jspdf';
import { CalculationResult, SellerDetails, Marketplace, CalculatorInputs } from './types';
import { formatINR, formatPercent, MARKETPLACE_CONFIGS } from './calculator';

/**
 * Generates a professional PDF cost breakdown / invoice.
 */
export function generatePDF(
  result: CalculationResult,
  inputs: CalculatorInputs,
  sellerDetails: SellerDetails,
  marketplace: Marketplace
): void {
  const config = MARKETPLACE_CONFIGS[marketplace];
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ─── Colors ──────────────────────────────────────────────────────
  const primaryColor: [number, number, number] = [99, 102, 241]; // Indigo
  const darkColor: [number, number, number] = [15, 23, 42];
  const grayColor: [number, number, number] = [100, 116, 139];
  const lightGray: [number, number, number] = [226, 232, 240];
  const greenColor: [number, number, number] = [5, 150, 105];
  const redColor: [number, number, number] = [225, 29, 72];
  const whiteColor: [number, number, number] = [255, 255, 255];

  // ─── Header Banner ──────────────────────────────────────────────
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...whiteColor);
  doc.text('COST BREAKDOWN & PROFIT ANALYSIS', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${config.displayName} | Generated: ${new Date().toLocaleDateString('en-IN')}`, margin, 28);

  y = 52;

  // ─── Seller Details Box ─────────────────────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('SELLER DETAILS', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text(`Business: ${sellerDetails.sellerName || 'N/A'}`, margin + 5, y + 14);
  doc.text(`GSTIN: ${sellerDetails.gstin || 'N/A'}`, margin + 5, y + 20);
  doc.text(`Item: ${sellerDetails.itemName || 'N/A'}`, margin + contentWidth / 2, y + 14);
  doc.text(`SKU: ${sellerDetails.itemSKU || 'N/A'}`, margin + contentWidth / 2, y + 20);
  doc.text(`Marketplace: ${config.name}`, margin + 5, y + 26);
  doc.text(`GST Rate: ${inputs.gstRate}%`, margin + contentWidth / 2, y + 26);

  y += 40;

  // ─── Table Header ──────────────────────────────────────────────
  function drawTableHeader(label: string) {
    doc.setFillColor(...primaryColor);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...whiteColor);
    doc.text(label, margin + 4, y + 5.5);
    y += 10;
  }

  function drawRow(
    label: string,
    value: string,
    options?: {
      bold?: boolean;
      indent?: boolean;
      bgColor?: [number, number, number];
      textColor?: [number, number, number];
      valueColor?: [number, number, number];
    }
  ) {
    const opts = options || {};
    if (opts.bgColor) {
      doc.setFillColor(...opts.bgColor);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }

    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...(opts.textColor || darkColor));
    doc.text(
      opts.indent ? `    ${label}` : label,
      margin + 4,
      y + 5
    );

    doc.setTextColor(...(opts.valueColor || darkColor));
    doc.text(value, margin + contentWidth - 4, y + 5, { align: 'right' });

    // Bottom border
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);
    y += 8;
  }

  // ─── Revenue Section ────────────────────────────────────────────
  drawTableHeader('REVENUE');
  drawRow('Customer Selling Price (incl. GST)', formatINR(result.sellingPrice), {
    bold: true,
  });
  drawRow('Sales Excluding GST', formatINR(result.salesExcludingGST));
  drawRow(`GST Amount (${inputs.gstRate}%)`, formatINR(result.gstAmount), {
    indent: true,
    textColor: grayColor,
  });

  y += 4;

  // ─── Cost of Goods ──────────────────────────────────────────────
  drawTableHeader('COST OF GOODS');
  drawRow('Product Base Cost', formatINR(result.productCost));
  drawRow('Packaging Cost', formatINR(result.packagingCost));
  drawRow('Advertising / Marketing', formatINR(result.advertisingCost));

  y += 4;

  // ─── Marketplace Fees ───────────────────────────────────────────
  drawTableHeader(`${config.name.toUpperCase()} MARKETPLACE FEES`);
  drawRow(`Commission (${inputs.commissionPercent}%)`, formatINR(result.commissionAmount), {
    indent: true,
  });
  drawRow('Fixed Closing Fee', formatINR(result.fixedClosingFee), { indent: true });
  drawRow('Shipping Fee', formatINR(result.shippingFee), { indent: true });
  drawRow('GST on Marketplace Fees (18%)', formatINR(result.gstOnMarketplaceFees), {
    indent: true,
    textColor: grayColor,
  });
  drawRow('Total Marketplace Fees (incl. GST)', formatINR(result.totalMarketplaceFeesWithGST), {
    bold: true,
    valueColor: redColor,
  });

  y += 4;

  // ─── Return / RTO ───────────────────────────────────────────────
  drawTableHeader('RETURN & RTO PROVISION');
  drawRow(
    `Return / RTO Loss Buffer (${
      inputs.returnLossType === 'percentage' ? inputs.returnLossPercent + '%' : 'Fixed'
    })`,
    formatINR(result.returnLossBuffer)
  );

  y += 6;

  // ─── Summary ────────────────────────────────────────────────────
  // Total deductions box
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...redColor);
  doc.text('TOTAL DEDUCTIONS', margin + 4, y + 7);
  doc.text(formatINR(result.totalDeductions), margin + contentWidth - 4, y + 7, {
    align: 'right',
  });
  y += 14;

  // Net profit box
  const profitBgColor: [number, number, number] = result.netProfit >= 0
    ? [236, 253, 245]
    : [254, 242, 242];
  const profitTextColor = result.netProfit >= 0 ? greenColor : redColor;

  doc.setFillColor(...profitBgColor);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F');
  doc.setDrawColor(...profitTextColor);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...profitTextColor);
  doc.text('NET PROFIT', margin + 4, y + 9);
  doc.text(
    `${formatINR(result.netProfit)}  (${formatPercent(result.profitPercent)})`,
    margin + contentWidth - 4,
    y + 9,
    { align: 'right' }
  );
  y += 18;

  if (inputs.mode === 'costToPrice') {
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'F');
    doc.setDrawColor(...primaryColor);
    doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('RECOMMENDED SELLING PRICE', margin + 4, y + 8);
    doc.text(formatINR(result.recommendedSellingPrice), margin + contentWidth - 4, y + 8, {
      align: 'right',
    });
    y += 16;
  }

  // ─── Footer ─────────────────────────────────────────────────────
  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text(
    'This is a cost estimation tool. Actual marketplace fees may vary based on category, weight, and zone. Please verify with the marketplace.',
    margin,
    y
  );
  doc.text(
    'Generated by E-commerce Seller Cost Calculator',
    margin,
    y + 5
  );

  // Save
  const filename = `cost-breakdown-${config.key}-${Date.now()}.pdf`;
  doc.save(filename);
}
