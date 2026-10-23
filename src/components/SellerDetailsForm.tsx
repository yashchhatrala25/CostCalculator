'use client';

import React, { useState } from 'react';
import { SellerDetails, Marketplace } from '@/lib/types';
import { MARKETPLACE_CONFIGS } from '@/lib/calculator';
import { User, FileText, Hash, Box } from 'lucide-react';

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

  return (
    <div className="glass-card overflow-hidden animate-fade-in" style={{ animationDelay: '0.15s' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 flex items-center justify-between text-left hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: config.gradient }}>
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Seller & Invoice Details
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {details.sellerName || 'Click to add seller info for PDF invoice'}
            </p>
          </div>
        </div>
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
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label flex items-center">
              <User size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
              Seller / Business Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Your Business Name"
              value={details.sellerName}
              onChange={(e) => onChange({ sellerName: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center">
              <Hash size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
              GSTIN
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="22AAAAA0000A1Z5"
              value={details.gstin}
              onChange={(e) => onChange({ gstin: e.target.value.toUpperCase() })}
              maxLength={15}
            />
          </div>
          <div>
            <label className="form-label flex items-center">
              <Box size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
              Item / Product Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Product Name"
              value={details.itemName}
              onChange={(e) => onChange({ itemName: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center">
              <FileText size={14} className="mr-1.5 text-[var(--accent-indigo)]" />
              SKU / Item Code
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="SKU-001"
              value={details.itemSKU}
              onChange={(e) => onChange({ itemSKU: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
