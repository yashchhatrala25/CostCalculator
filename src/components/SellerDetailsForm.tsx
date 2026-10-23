'use client';

import React, { useState } from 'react';
import { SellerDetails, Marketplace } from '@/lib/types';
import { MARKETPLACE_CONFIGS } from '@/lib/calculator';
import { User, FileText, Hash, Box, Calendar, Sparkles } from 'lucide-react';

interface SellerDetailsFormProps {
  details: SellerDetails;
  marketplace: Marketplace;
  onChange: (updates: Partial<SellerDetails>) => void;
}

export default function SellerDetailsForm({
  details,
  marketplace,
  onChange,
}: SellerDetailsFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = MARKETPLACE_CONFIGS[marketplace];

  const handleFillDemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      sellerName: 'Bharat Retail Enterprises LLP',
      gstin: '29ABCDE1234F1Z5',
      itemName: 'Cotton Casual Shirt (Slim Fit)',
      itemSKU: 'SHIRT-COT-BLU-M',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toISOString().split('T')[0],
    });
    setIsOpen(true);
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: config.gradient }}
          >
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Seller & PDF Invoice Metadata
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {details.sellerName
                ? `${details.sellerName} · ${details.itemName || 'Product'}`
                : 'Click to add business name, GSTIN, SKU for printable invoice'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-[var(--accent-indigo)] border border-indigo-500/20 font-semibold transition-all flex items-center gap-1"
            title="Auto-fill sample seller details for quick PDF test"
          >
            <Sparkles size={11} />
            Demo Data
          </button>
          <svg
            className={`w-5 h-5 text-[var(--text-muted)] transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 border-t border-[var(--border-subtle)]/50 pt-4">
          <div>
            <label className="form-label flex items-center text-[11px]">
              <User size={13} className="mr-1 text-[var(--accent-indigo)]" />
              Seller / Business Name
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="e.g. Bharat Enterprises"
              value={details.sellerName}
              onChange={(e) => onChange({ sellerName: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center text-[11px]">
              <Hash size={13} className="mr-1 text-[var(--accent-indigo)]" />
              Seller GSTIN (15 Digits)
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="29ABCDE1234F1Z5"
              value={details.gstin}
              onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
              maxLength={15}
            />
          </div>
          <div>
            <label className="form-label flex items-center text-[11px]">
              <Box size={13} className="mr-1 text-[var(--accent-indigo)]" />
              Item / Product Name
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="e.g. Cotton Polo T-Shirt"
              value={details.itemName}
              onChange={(e) => onChange({ itemName: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center text-[11px]">
              <FileText size={13} className="mr-1 text-[var(--accent-indigo)]" />
              SKU / Catalog ID
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="e.g. SKU-TSHIRT-BLK-L"
              value={details.itemSKU}
              onChange={(e) => onChange({ itemSKU: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center text-[11px]">
              <Hash size={13} className="mr-1 text-[var(--accent-indigo)]" />
              Invoice / Ref Number
            </label>
            <input
              type="text"
              className="input-field text-sm"
              placeholder="INV-2026-001"
              value={details.invoiceNumber}
              onChange={(e) => onChange({ invoiceNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center text-[11px]">
              <Calendar size={13} className="mr-1 text-[var(--accent-indigo)]" />
              Date of Calculation
            </label>
            <input
              type="date"
              className="input-field text-sm"
              value={details.orderDate}
              onChange={(e) => onChange({ orderDate: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
