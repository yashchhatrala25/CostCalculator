'use client';

import React from 'react';
import {
  CalculatorInputs,
  CalculationMode,
  GSTRate,
  ReturnLossType,
} from '@/lib/types';
import { GST_RATES, MARKETPLACE_CONFIGS } from '@/lib/calculator';
import {
  Package,
  IndianRupee,
  Percent,
  Megaphone,
  RotateCcw,
  TrendingUp,
  Tag,
  Truck,
  Info,
} from 'lucide-react';

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onChange: (updates: Partial<CalculatorInputs>) => void;
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="tooltip-container ml-1 inline-flex">
      <Info size={13} className="text-[var(--text-muted)] cursor-help" />
      <span className="tooltip-content">{text}</span>
    </span>
  );
}

function InputGroup({
  label,
  tooltip,
  icon: Icon,
  prefix,
  suffix,
  children,
}: {
  label: string;
  tooltip?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  prefix?: string;
  suffix?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="form-label flex items-center">
        {Icon && (
          <Icon size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
        )}
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
            {prefix}
          </span>
        )}
        {children}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function CalculatorForm({
  inputs,
  onChange,
}: CalculatorFormProps) {
  const config = MARKETPLACE_CONFIGS[inputs.marketplace];

  const handleNumber = (
    field: keyof CalculatorInputs,
    value: string
  ) => {
    const parsed = value === '' ? 0 : parseFloat(value);
    if (!isNaN(parsed)) {
      onChange({ [field]: parsed });
    }
  };

  const displayValue = (val: number) => (val === 0 ? '' : String(val));

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* ─── Mode Toggle ──────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp size={16} className="text-[var(--accent-indigo)]" />
          Calculation Mode
        </h3>
        <div className="mode-toggle">
          <button
            className={inputs.mode === 'costToPrice' ? 'active' : ''}
            onClick={() => onChange({ mode: 'costToPrice' as CalculationMode })}
          >
            Cost → Price
          </button>
          <button
            className={inputs.mode === 'priceToProfit' ? 'active' : ''}
            onClick={() =>
              onChange({ mode: 'priceToProfit' as CalculationMode })
            }
          >
            Price → Profit
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2.5 leading-relaxed">
          {inputs.mode === 'costToPrice'
            ? '💡 Enter your product cost and desired profit — we'll calculate the ideal selling price.'
            : '💡 Enter the customer selling price — we'll calculate your net profit after all deductions.'}
        </p>
      </div>

      {/* ─── Product Details ──────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Package size={16} className="text-[var(--accent-violet)]" />
          Product Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup
            label="Product Base Cost"
            tooltip="Manufacturing or buying cost per unit"
            icon={IndianRupee}
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0.00"
              value={displayValue(inputs.productCost)}
              onChange={(e) => handleNumber('productCost', e.target.value)}
              min="0"
              step="0.01"
            />
          </InputGroup>

          {inputs.mode === 'priceToProfit' ? (
            <InputGroup
              label="Selling Price (incl. GST)"
              tooltip="Customer-facing MRP/selling price on the marketplace"
              icon={Tag}
              prefix="₹"
            >
              <input
                type="number"
                className="input-field pl-8"
                placeholder="0.00"
                value={displayValue(inputs.sellingPrice)}
                onChange={(e) => handleNumber('sellingPrice', e.target.value)}
                min="0"
                step="1"
              />
            </InputGroup>
          ) : (
            <InputGroup
              label="Desired Profit"
              tooltip="The net profit amount you want per unit"
              icon={TrendingUp}
              prefix="₹"
            >
              <input
                type="number"
                className="input-field pl-8"
                placeholder="0.00"
                value={displayValue(inputs.desiredProfit)}
                onChange={(e) => handleNumber('desiredProfit', e.target.value)}
                min="0"
                step="1"
              />
            </InputGroup>
          )}

          <InputGroup label="GST Rate" icon={Percent}>
            <select
              className="select-field"
              value={inputs.gstRate}
              onChange={(e) =>
                onChange({ gstRate: parseInt(e.target.value) as GSTRate })
              }
            >
              {GST_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}% GST
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup
            label="Packaging Cost"
            tooltip="Cost of packaging material per unit"
            icon={Package}
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0.00"
              value={displayValue(inputs.packagingCost)}
              onChange={(e) => handleNumber('packagingCost', e.target.value)}
              min="0"
              step="0.5"
            />
          </InputGroup>
        </div>
      </div>

      {/* ─── Marketplace Fees ─────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 uppercase tracking-wider flex items-center gap-2">
          <Truck size={16} className="text-[var(--accent-cyan)]" />
          {config.name} Marketplace Fees
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
          {config.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputGroup
            label="Commission %"
            tooltip="Referral/category commission percentage"
            suffix="%"
          >
            <input
              type="number"
              className="input-field pr-8"
              placeholder="0"
              value={displayValue(inputs.commissionPercent)}
              onChange={(e) =>
                handleNumber('commissionPercent', e.target.value)
              }
              min="0"
              max="100"
              step="0.5"
            />
          </InputGroup>
          <InputGroup
            label="Fixed Closing Fee"
            tooltip="Fixed fee per order charged by the marketplace"
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0"
              value={displayValue(inputs.fixedClosingFee)}
              onChange={(e) =>
                handleNumber('fixedClosingFee', e.target.value)
              }
              min="0"
              step="1"
            />
          </InputGroup>
          <InputGroup
            label="Shipping Fee"
            tooltip="Logistics/shipping fee per order"
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0"
              value={displayValue(inputs.shippingFee)}
              onChange={(e) => handleNumber('shippingFee', e.target.value)}
              min="0"
              step="1"
            />
          </InputGroup>
        </div>
      </div>

      {/* ─── Additional Costs ─────────────────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Megaphone size={16} className="text-[var(--accent-amber)]" />
          Additional Costs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup
            label="Advertising / Marketing"
            tooltip="Ad spend or marketing cost per order"
            icon={Megaphone}
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="0.00"
              value={displayValue(inputs.advertisingCost)}
              onChange={(e) =>
                handleNumber('advertisingCost', e.target.value)
              }
              min="0"
              step="0.5"
            />
          </InputGroup>

          <div>
            <label className="form-label flex items-center">
              <RotateCcw
                size={14}
                className="mr-1.5 text-[var(--accent-rose)]"
              />
              Return / RTO Loss
              <Tooltip text="Buffer for customer returns or courier RTO losses" />
            </label>
            <div className="flex gap-2 mb-2">
              <button
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  inputs.returnLossType === 'percentage'
                    ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                onClick={() =>
                  onChange({ returnLossType: 'percentage' as ReturnLossType })
                }
              >
                % of Sales
              </button>
              <button
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  inputs.returnLossType === 'fixed'
                    ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                onClick={() =>
                  onChange({ returnLossType: 'fixed' as ReturnLossType })
                }
              >
                Fixed ₹
              </button>
            </div>
            {inputs.returnLossType === 'percentage' ? (
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-8"
                  placeholder="3"
                  value={displayValue(inputs.returnLossPercent)}
                  onChange={(e) =>
                    handleNumber('returnLossPercent', e.target.value)
                  }
                  min="0"
                  max="100"
                  step="0.5"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
                  %
                </span>
              </div>
            ) : (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  className="input-field pl-8"
                  placeholder="0"
                  value={displayValue(inputs.returnLossFixed)}
                  onChange={(e) =>
                    handleNumber('returnLossFixed', e.target.value)
                  }
                  min="0"
                  step="1"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
