'use client';

import React, { useState } from 'react';
import { CalculationResult, Marketplace, CalculationMode } from '@/lib/types';
import { formatINR, formatPercent, MARKETPLACE_CONFIGS } from '@/lib/calculator';
import {
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  IndianRupee,
  Minus,
  FileText,
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
}: {
  label: string;
  value: string;
  type?: 'income' | 'deduction' | 'result' | 'neutral';
  isLarge?: boolean;
  indent?: boolean;
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
        indent ? 'ml-4 opacity-80' : ''
      } ${isLarge ? 'py-4' : ''}`}
    >
      <span
        className={`text-xs font-medium ${
          indent ? 'text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'
        }`}
      >
        {type === 'deduction' && !indent && (
          <Minus size={12} className="inline mr-1 text-[var(--accent-rose)]" />
        )}
        {label}
      </span>
      <span
        className={`${
          isLarge ? 'text-xl font-bold' : 'text-sm font-semibold'
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

  return (
    <div className="summary-sticky summary-card">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div
        className="p-5 pb-3 cursor-pointer lg:cursor-default flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: config.gradient }}
          >
            {config.icon}
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              {mode === 'costToPrice' ? 'Recommended Price' : 'Profit Summary'}
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              {config.displayName}
            </span>
          </div>
        </div>
        <button className="lg:hidden p-1 text-[var(--text-muted)]">
          {expanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>

      {/* ─── Expandable Body ─────────────────────────────────────── */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 lg:max-h-[2000px] lg:opacity-100'
        }`}
      >
        <div className="px-5 pb-5 space-y-2">
          {/* Hero stat */}
          <div className="text-center py-4 rounded-xl mb-2" style={{
            background: isProfit
              ? 'linear-gradient(145deg, rgba(5, 150, 105, 0.12), rgba(52, 211, 153, 0.06))'
              : 'linear-gradient(145deg, rgba(225, 29, 72, 0.12), rgba(251, 113, 133, 0.06))',
            border: `1px solid ${isProfit ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)'}`,
          }}>
            {mode === 'costToPrice' ? (
              <>
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                  Recommended Selling Price
                </p>
                <p className="text-3xl font-black num-highlight text-[var(--accent-indigo)]">
                  {formatINR(result.recommendedSellingPrice)}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">
                  Net Profit per Unit
                </p>
                <div className="flex items-center justify-center gap-2">
                  {isProfit ? (
                    <TrendingUp size={24} className="text-[var(--accent-emerald)]" />
                  ) : (
                    <TrendingDown size={24} className="text-[var(--accent-rose)]" />
                  )}
                  <p
                    className={`text-3xl font-black num-highlight ${
                      isProfit ? 'profit-positive profit-glow' : 'profit-negative'
                    }`}
                  >
                    {formatINR(result.netProfit)}
                  </p>
                </div>
                <p className={`text-sm font-semibold mt-1 ${
                  isProfit ? 'text-[var(--accent-emerald)]' : 'text-[var(--accent-rose)]'
                }`}>
                  {formatPercent(result.profitPercent)} margin
                </p>
              </>
            )}
          </div>

          <div className="divider" />

          {/* Breakdown */}
          <div className="space-y-1.5">
            <StatRow
              label="Selling Price (incl. GST)"
              value={formatINR(result.sellingPrice)}
              type="neutral"
            />
            <StatRow
              label="Sales excl. GST"
              value={formatINR(result.salesExcludingGST)}
              type="income"
            />
            <StatRow
              label={`GST Amount (${result.sellingPrice > 0 ? Math.round((result.gstAmount / result.sellingPrice) * 100) : 0}%)`}
              value={formatINR(result.gstAmount)}
              type="neutral"
              indent
            />

            <div className="divider" />

            <StatRow
              label="Product Cost"
              value={formatINR(result.productCost)}
              type="deduction"
            />
            <StatRow
              label="Packaging Cost"
              value={formatINR(result.packagingCost)}
              type="deduction"
            />
            <StatRow
              label="Advertising Cost"
              value={formatINR(result.advertisingCost)}
              type="deduction"
            />

            <div className="divider" />

            <StatRow
              label="Commission Fee"
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
              label="Shipping Fee"
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
              label="Total Marketplace Fees"
              value={formatINR(result.totalMarketplaceFeesWithGST)}
              type="deduction"
            />

            <div className="divider" />

            <StatRow
              label="Return / RTO Loss Buffer"
              value={formatINR(result.returnLossBuffer)}
              type="deduction"
            />

            <div className="divider" />

            <StatRow
              label="Total Deductions"
              value={formatINR(result.totalDeductions)}
              type="deduction"
              isLarge
            />
            <StatRow
              label="Net Profit"
              value={formatINR(result.netProfit)}
              type="result"
              isLarge
            />
            <StatRow
              label="Profit Margin"
              value={formatPercent(result.profitPercent)}
              type="result"
            />
          </div>

          {/* Download button */}
          <div className="pt-3">
            <button
              onClick={onDownloadPDF}
              className="btn-primary w-full justify-center"
            >
              <FileText size={18} />
              Download Cost Breakdown / Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
