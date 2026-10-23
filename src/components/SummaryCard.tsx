'use client';

import React, { useState } from 'react';
import { CalculationResult, Marketplace, CalculationMode } from '@/lib/types';
import { formatINR, formatPercent, MARKETPLACE_CONFIGS } from '@/lib/calculator';
import {
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Minus,
  FileText,
  PieChart,
} from 'lucide-react';

interface SummaryCardProps {
  result: CalculationResult;
  marketplace: Marketplace;
  mode: CalculationMode;
  onDownloadPDF: () => void;
}

function StatRow({
  label,
  value,
  type = 'neutral',
  isLarge = false,
  indent = false,
  subLabel,
}: {
  label: string;
  value: string;
  type?: 'income' | 'deduction' | 'result' | 'neutral';
  isLarge?: boolean;
  indent?: boolean;
  subLabel?: string;
}) {
  const colorClass =
    type === 'income'
      ? 'text-[var(--accent-emerald)]'
      : type === 'deduction'
      ? 'text-[var(--accent-rose)]'
      : type === 'result'
      ? value.startsWith('-')
        ? 'profit-negative'
        : 'profit-positive profit-glow'
      : 'text-[var(--text-primary)]';

  return (
    <div
      className={`stat-item flex items-center justify-between ${
        indent ? 'ml-3 sm:ml-4 opacity-85' : ''
      } ${isLarge ? 'py-3.5 bg-white/[0.04]' : 'py-2.5'}`}
    >
      <div className="flex flex-col">
        <span
          className={`text-xs font-medium flex items-center ${
            indent ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
          }`}
        >
          {type === 'deduction' && !indent && (
            <Minus size={11} className="inline mr-1 text-[var(--accent-rose)]" />
          )}
          {label}
        </span>
        {subLabel && (
          <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {subLabel}
          </span>
        )}
      </div>
      <span
        className={`${
          isLarge ? 'text-lg sm:text-xl font-bold' : 'text-xs sm:text-sm font-semibold'
        } num-highlight ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function SummaryCard({
  result,
  marketplace,
  mode,
  onDownloadPDF,
}: SummaryCardProps) {
  const [expanded, setExpanded] = useState(true);
  const config = MARKETPLACE_CONFIGS[marketplace];
  const isProfit = result.netProfit >= 0;

  // Breakdown percentages for the visual bar (based on Selling Price)
  const P = Math.max(1, result.sellingPrice);
  const productCostPct = Math.min(100, Math.max(0, (result.productCost / P) * 100));
  const mktFeesPct = Math.min(100, Math.max(0, (result.totalMarketplaceFeesWithGST / P) * 100));
  const gstPct = Math.min(100, Math.max(0, (result.gstAmount / P) * 100));
  const otherCostsPct = Math.min(
    100,
    Math.max(
      0,
      ((result.packagingCost + result.advertisingCost + result.returnLossBuffer) / P) * 100
    )
  );
  const profitPct = Math.min(100, Math.max(0, (Math.max(0, result.netProfit) / P) * 100));

  return (
    <div className="summary-sticky summary-card">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div
        className="p-4 sm:p-5 pb-3 cursor-pointer lg:cursor-default flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{ background: config.gradient }}
          >
            {config.icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {mode === 'costToPrice' ? 'Target Price Summary' : 'Profit & Deduction Summary'}
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              {config.displayName} · Indian Marketplace
            </span>
          </div>
        </div>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-lg bg-white/5 text-[var(--text-muted)]"
          aria-label={expanded ? 'Collapse summary' : 'Expand summary'}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* ─── Expandable Body ─────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expanded
            ? 'max-h-[2000px] opacity-100'
            : 'max-h-0 opacity-0 lg:max-h-[2000px] lg:opacity-100'
        }`}
      >
        <div className="px-4 sm:px-5 pb-5 space-y-3">
          {/* Hero stat */}
          <div
            className="text-center py-4 px-3 rounded-2xl mb-1 relative overflow-hidden"
            style={{
              background: isProfit
                ? 'linear-gradient(145deg, rgba(5, 150, 105, 0.15), rgba(52, 211, 153, 0.08))'
                : 'linear-gradient(145deg, rgba(225, 29, 72, 0.15), rgba(251, 113, 133, 0.08))',
              border: `1px solid ${
                isProfit ? 'rgba(52, 211, 153, 0.25)' : 'rgba(251, 113, 133, 0.25)'
              }`,
            }}
          >
            {mode === 'costToPrice' ? (
              <>
                <p className="text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">
                  Recommended Selling Price (MRP)
                </p>
                <p className="text-3xl sm:text-4xl font-black num-highlight text-[var(--accent-indigo)]">
                  {formatINR(result.recommendedSellingPrice)}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Required to achieve net profit of {formatINR(result.netProfit)}
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-[var(--text-muted)] mb-1 uppercase tracking-wider font-semibold">
                  Net In-Hand Profit per Unit
                </p>
                <div className="flex items-center justify-center gap-2">
                  {isProfit ? (
                    <TrendingUp size={24} className="text-[var(--accent-emerald)]" />
                  ) : (
                    <TrendingDown size={24} className="text-[var(--accent-rose)]" />
                  )}
                  <p
                    className={`text-3xl sm:text-4xl font-black num-highlight ${
                      isProfit ? 'profit-positive profit-glow' : 'profit-negative'
                    }`}
                  >
                    {formatINR(result.netProfit)}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 mt-1.5 text-xs font-semibold">
                  <span
                    className={
                      isProfit ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-rose)]'
                    }
                  >
                    {formatPercent(result.profitPercent)} Margin
                  </span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-[var(--accent-cyan)]">
                    {formatPercent(result.profitOnCostPercent)} ROI on Cost
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Visual Percentage Split Bar */}
          {result.sellingPrice > 0 && (
            <div className="p-3 rounded-xl bg-black/20 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <PieChart size={12} className="text-[var(--accent-indigo)]" />
                  Rupee Distribution
                </span>
                <span>P = {formatINR(result.sellingPrice)}</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/5 flex overflow-hidden gap-0.5">
                <div
                  style={{ width: `${productCostPct}%` }}
                  className="bg-indigo-500 h-full transition-all"
                  title={`Product Cost: ${productCostPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${mktFeesPct}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Marketplace Fees: ${mktFeesPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${gstPct}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`GST Tax: ${gstPct.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${otherCostsPct}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Ads, Pkg & RTO: ${otherCostsPct.toFixed(1)}%`}
                />
                {isProfit && (
                  <div
                    style={{ width: `${profitPct}%` }}
                    className="bg-emerald-400 h-full transition-all"
                    title={`Net Profit: ${profitPct.toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px] text-[var(--text-muted)] pt-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                  Cost ({productCostPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Fees ({mktFeesPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Profit ({profitPct.toFixed(0)}%)
                </span>
              </div>
            </div>
          )}

          <div className="divider my-2" />

          {/* Breakdown Items */}
          <div className="space-y-1">
            <StatRow
              label="Customer Selling Price (incl. GST)"
              value={formatINR(result.sellingPrice)}
              type="neutral"
            />
            <StatRow
              label="Sales Excluding GST"
              subLabel="Formula: P / (1 + GST)"
              value={formatINR(result.salesExcludingGST)}
              type="income"
            />
            <StatRow
              label={`Output GST Amount (${result.sellingPrice > 0 ? Math.round((result.gstAmount / result.sellingPrice) * 100) : 0}%)`}
              value={formatINR(result.gstAmount)}
              type="neutral"
              indent
            />

            <div className="divider my-1.5" />

            <StatRow
              label="Product Base Cost"
              value={formatINR(result.productCost)}
              type="deduction"
            />
            <StatRow
              label="Packaging Material Cost"
              value={formatINR(result.packagingCost)}
              type="deduction"
            />
            <StatRow
              label="Advertising / Marketing"
              value={formatINR(result.advertisingCost)}
              type="deduction"
            />

            <div className="divider my-1.5" />

            {/* Marketplace Fee Items */}
            <StatRow
              label={`${config.name} Commission`}
              value={formatINR(result.commissionAmount)}
              type="deduction"
              indent
            />
            <StatRow
              label="Fixed Closing Fee"
              value={formatINR(result.fixedClosingFee)}
              type="deduction"
              indent
            />
            <StatRow
              label="Shipping / Logistics Fee"
              value={formatINR(result.shippingFee)}
              type="deduction"
              indent
            />
            <StatRow
              label="GST on Marketplace Fees (18%)"
              value={formatINR(result.gstOnMarketplaceFees)}
              type="deduction"
              indent
            />
            <StatRow
              label={`Total ${config.name} Deductions`}
              value={formatINR(result.totalMarketplaceFeesWithGST)}
              type="deduction"
            />

            <div className="divider my-1.5" />

            {/* Differentiated Return & RTO Provisions */}
            <StatRow
              label="Customer Return Provision"
              subLabel="Reverse shipping & damage buffer"
              value={formatINR(result.customerReturnBuffer)}
              type="deduction"
              indent
            />
            <StatRow
              label="Courier RTO Loss Provision"
              subLabel="Doorstep non-delivery freight loss"
              value={formatINR(result.courierRTOBuffer)}
              type="deduction"
              indent
            />
            <StatRow
              label="Total Return & RTO Buffer"
              value={formatINR(result.returnLossBuffer)}
              type="deduction"
            />

            <div className="divider my-2" />

            {/* Bottom-Line Totals */}
            <StatRow
              label="TOTAL DEDUCTIONS"
              value={formatINR(result.totalDeductions)}
              type="deduction"
              isLarge
            />
            <StatRow
              label="ESTIMATED NET PROFIT"
              value={formatINR(result.netProfit)}
              type="result"
              isLarge
            />
            <StatRow
              label="Net Profit Margin"
              value={formatPercent(result.profitPercent)}
              type="result"
            />
          </div>

          {/* Download PDF button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onDownloadPDF}
              className="btn-primary w-full justify-center text-sm py-3"
            >
              <FileText size={17} />
              Download Cost Breakdown / Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
