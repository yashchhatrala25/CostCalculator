'use client';

import React from 'react';
import {
  CalculatorInputs,
  CalculationMode,
  DesiredProfitType,
  GSTRate,
  ReturnLossMode,
  SimpleReturnType,
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
  Layers,
  ShieldAlert,
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
            Mode A: Cost → Target Price
          </button>
          <button
            className={inputs.mode === 'priceToProfit' ? 'active' : ''}
            onClick={() =>
              onChange({ mode: 'priceToProfit' as CalculationMode })
            }
          >
            Mode B: Selling Price → Net Profit
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2.5 leading-relaxed">
          {inputs.mode === 'costToPrice'
            ? '💡 Mode A: Enter Product Cost + Target Profit. The calculator will reverse-solve the required selling price (P).'
            : '💡 Mode B: Enter Customer Selling Price (P) + Product Cost. The calculator will compute your exact Net Profit.'}
        </p>
      </div>

      {/* ─── Product & Profit Parameters ──────────────────────────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Package size={16} className="text-[var(--accent-violet)]" />
          Product & Price Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputGroup
            label="Product Base Cost"
            tooltip="Manufacturing or procurement purchase cost per unit in INR"
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
              step="1"
            />
          </InputGroup>

          {inputs.mode === 'priceToProfit' ? (
            <InputGroup
              label="Customer Selling Price (MRP incl. GST)"
              tooltip="The final listing price displayed to customers on the marketplace"
              icon={Tag}
              prefix="₹"
            >
              <input
                type="number"
                className="input-field pl-8"
                placeholder="799"
                value={displayValue(inputs.sellingPrice)}
                onChange={(e) => handleNumber('sellingPrice', e.target.value)}
                min="0"
                step="1"
              />
            </InputGroup>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0 flex items-center">
                  <TrendingUp size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
                  Desired Profit Target
                  <Tooltip text="Choose whether to target a fixed Rupee profit or a percentage profit margin on selling price" />
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onChange({ desiredProfitType: 'amount' as DesiredProfitType })}
                    className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-all ${
                      inputs.desiredProfitType === 'amount'
                        ? 'bg-[var(--accent-indigo)] text-white'
                        : 'bg-white/5 text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    Fixed ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ desiredProfitType: 'marginPercent' as DesiredProfitType })}
                    className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-all ${
                      inputs.desiredProfitType === 'marginPercent'
                        ? 'bg-[var(--accent-indigo)] text-white'
                        : 'bg-white/5 text-[var(--text-muted)] hover:text-white'
                    }`}
                  >
                    Margin %
                  </button>
                </div>
              </div>
              {inputs.desiredProfitType === 'amount' ? (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    className="input-field pl-8"
                    placeholder="150"
                    value={displayValue(inputs.desiredProfit)}
                    onChange={(e) => handleNumber('desiredProfit', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    className="input-field pr-8"
                    placeholder="20"
                    value={displayValue(inputs.desiredProfitPercent)}
                    onChange={(e) => handleNumber('desiredProfitPercent', e.target.value)}
                    min="0"
                    max="90"
                    step="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm font-semibold pointer-events-none">
                    %
                  </span>
                </div>
              )}
            </div>
          )}

          <InputGroup
            label="GST Rate on Product"
            tooltip="Applicable GST slab on your product HSN code"
            icon={Percent}
          >
            <select
              className="select-field"
              value={inputs.gstRate}
              onChange={(e) =>
                onChange({ gstRate: parseInt(e.target.value) as GSTRate })
              }
            >
              {GST_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}% GST (Tax inclusive pricing)
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup
            label="Packaging Cost"
            tooltip="Corrugated box, flyer bag, bubble wrap, tape, and barcode stickers"
            icon={Package}
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="15"
              value={displayValue(inputs.packagingCost)}
              onChange={(e) => handleNumber('packagingCost', e.target.value)}
              min="0"
              step="1"
            />
          </InputGroup>
        </div>
      </div>

      {/* ─── Marketplace Fees & Category Presets ──────────────────── */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Truck size={16} className="text-[var(--accent-cyan)]" />
            {config.name} Marketplace Fees (18% GST Added Automatically)
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[var(--accent-indigo)] font-semibold w-fit">
            18% GST applies to seller fees
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
          {config.description}
        </p>

        {/* Category Presets Quick-Select */}
        {config.categoryPresets.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-white/[0.02] border border-[var(--border-subtle)]">
            <div className="text-xs font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
              <Layers size={13} className="text-[var(--accent-indigo)]" />
              Category Referral Fee Presets:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {config.categoryPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onChange({ commissionPercent: preset.commission })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    inputs.commissionPercent === preset.commission
                      ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-[var(--accent-indigo)] text-white font-semibold'
                      : 'bg-white/5 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputGroup
            label="Commission / Referral %"
            tooltip="Category-based referral fee charged by marketplace"
            suffix="%"
          >
            <input
              type="number"
              className="input-field pr-8"
              placeholder="12"
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
            tooltip="Flat fee per transaction based on order value tier"
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="20"
              value={displayValue(inputs.fixedClosingFee)}
              onChange={(e) =>
                handleNumber('fixedClosingFee', e.target.value)
              }
              min="0"
              step="1"
            />
          </InputGroup>
          <InputGroup
            label="Shipping / Logistics Fee"
            tooltip="Weight handling and national/regional shipping charge"
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="60"
              value={displayValue(inputs.shippingFee)}
              onChange={(e) => handleNumber('shippingFee', e.target.value)}
              min="0"
              step="1"
            />
          </InputGroup>
        </div>
      </div>

      {/* ─── Additional Marketing & Return/RTO Differentiation ────── */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wider flex items-center gap-2">
          <Megaphone size={16} className="text-[var(--accent-amber)]" />
          Marketing & Return / Courier RTO Loss Buffer
        </h3>

        {/* Marketing Spend */}
        <div className="mb-5">
          <InputGroup
            label="Advertising / Marketing Cost per Order"
            tooltip="Sponsored ads (PPC), campaigns, or social media marketing cost per unit sold"
            icon={Megaphone}
            prefix="₹"
          >
            <input
              type="number"
              className="input-field pl-8"
              placeholder="35"
              value={displayValue(inputs.advertisingCost)}
              onChange={(e) =>
                handleNumber('advertisingCost', e.target.value)
              }
              min="0"
              step="1"
            />
          </InputGroup>
        </div>

        {/* Return & RTO Mode Selector */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="form-label mb-0 flex items-center">
              <RotateCcw size={14} className="mr-1.5 text-[var(--accent-rose)]" />
              Return & Courier RTO Loss Buffer
              <Tooltip text="Crucial for Indian e-commerce: differentiate between Customer Return (RVP) vs Courier RTO (doorstep rejection)" />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  inputs.returnLossMode === 'detailed'
                    ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white shadow-sm'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                onClick={() =>
                  onChange({ returnLossMode: 'detailed' as ReturnLossMode })
                }
              >
                Detailed (Return vs RTO)
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                  inputs.returnLossMode === 'simple'
                    ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white shadow-sm'
                    : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                onClick={() =>
                  onChange({ returnLossMode: 'simple' as ReturnLossMode })
                }
              >
                Simple Buffer
              </button>
            </div>
          </div>

          {inputs.returnLossMode === 'detailed' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/15 text-xs text-[var(--text-muted)] flex items-start gap-2">
                <ShieldAlert size={16} className="text-[var(--accent-indigo)] shrink-0 mt-0.5" />
                <span>
                  <strong>Pro-Tip for Indian Sellers:</strong> Customer returns carry reverse shipping and potential product refurbishment/damage costs. Courier RTOs (undelivered/rejected at doorstep) only incur freight loss.
                </span>
              </div>

              {/* Differentiated Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Customer Return */}
                <div className="p-3.5 rounded-xl bg-black/20 border border-rose-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      1. Customer Return (RVP)
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Loss/Unit: ₹{((inputs.customerReturnRate / 100) * inputs.customerReturnCost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <label className="form-label text-[11px]">Return Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input-field pr-8 text-sm"
                        placeholder="6"
                        value={displayValue(inputs.customerReturnRate)}
                        onChange={(e) => handleNumber('customerReturnRate', e.target.value)}
                        min="0"
                        max="100"
                        step="0.5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-semibold pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-[11px]">Avg Loss per Customer Return (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-semibold pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        className="input-field pl-8 text-sm"
                        placeholder="120"
                        value={displayValue(inputs.customerReturnCost)}
                        onChange={(e) => handleNumber('customerReturnCost', e.target.value)}
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Courier RTO */}
                <div className="p-3.5 rounded-xl bg-black/20 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      2. Courier RTO (Undelivered)
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Loss/Unit: ₹{((inputs.courierRTORate / 100) * inputs.courierRTOCost).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <label className="form-label text-[11px]">Courier RTO Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="input-field pr-8 text-sm"
                        placeholder="8"
                        value={displayValue(inputs.courierRTORate)}
                        onChange={(e) => handleNumber('courierRTORate', e.target.value)}
                        min="0"
                        max="100"
                        step="0.5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-semibold pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-[11px]">Freight Loss per RTO (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-semibold pointer-events-none">
                        ₹
                      </span>
                      <input
                        type="number"
                        className="input-field pl-8 text-sm"
                        placeholder="60"
                        value={displayValue(inputs.courierRTOCost)}
                        onChange={(e) => handleNumber('courierRTOCost', e.target.value)}
                        min="0"
                        step="5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    inputs.simpleReturnType === 'percentage'
                      ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white'
                      : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                  onClick={() =>
                    onChange({ simpleReturnType: 'percentage' as SimpleReturnType })
                  }
                >
                  % of Selling Price
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    inputs.simpleReturnType === 'fixed'
                      ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white'
                      : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-muted)]'
                  }`}
                  onClick={() =>
                    onChange({ simpleReturnType: 'fixed' as SimpleReturnType })
                  }
                >
                  Fixed ₹ Buffer per Unit
                </button>
              </div>

              {inputs.simpleReturnType === 'percentage' ? (
                <div className="relative">
                  <input
                    type="number"
                    className="input-field pr-8"
                    placeholder="3"
                    value={displayValue(inputs.simpleReturnPercent)}
                    onChange={(e) =>
                      handleNumber('simpleReturnPercent', e.target.value)
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
                    placeholder="30"
                    value={displayValue(inputs.simpleReturnFixed)}
                    onChange={(e) =>
                      handleNumber('simpleReturnFixed', e.target.value)
                    }
                    min="0"
                    step="1"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
