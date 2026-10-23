'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Marketplace, CalculatorInputs, SellerDetails } from '@/lib/types';
import { calculate, getDefaultInputs, MARKETPLACE_CONFIGS } from '@/lib/calculator';
import { generatePDF } from '@/lib/pdfGenerator';
import MarketplaceTabs from '@/components/MarketplaceTabs';
import CalculatorForm from '@/components/CalculatorForm';
import SummaryCard from '@/components/SummaryCard';
import SellerDetailsForm from '@/components/SellerDetailsForm';
import { Calculator, Sparkles } from 'lucide-react';

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(
    getDefaultInputs('amazon')
  );
  const [sellerDetails, setSellerDetails] = useState<SellerDetails>({
    sellerName: '',
    gstin: '',
    itemName: '',
    itemSKU: '',
    invoiceNumber: '',
    orderDate: '',
  });

  // Memoized calculation
  const result = useMemo(() => calculate(inputs), [inputs]);

  // Marketplace switch handler — resets fees to marketplace defaults
  const handleMarketplaceChange = useCallback((marketplace: Marketplace) => {
    setInputs((prev) => {
      const config = MARKETPLACE_CONFIGS[marketplace];
      return {
        ...prev,
        marketplace,
        commissionPercent: config.defaultCommission,
        fixedClosingFee: config.fixedClosingFee,
        shippingFee: config.shippingFee,
      };
    });
  }, []);

  // Update inputs
  const handleInputChange = useCallback(
    (updates: Partial<CalculatorInputs>) => {
      setInputs((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Update seller details
  const handleSellerChange = useCallback(
    (updates: Partial<SellerDetails>) => {
      setSellerDetails((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // PDF download
  const handleDownloadPDF = useCallback(() => {
    generatePDF(result, inputs, sellerDetails, inputs.marketplace);
  }, [result, inputs, sellerDetails]);

  return (
    <div className="min-h-screen bg-mesh">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Seller Cost Calculator
              </h1>
              <p className="text-xs text-[var(--text-muted)] hidden sm:block">
                Amazon · Flipkart · Meesho — Profit & Pricing Tool for Indian Sellers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-xs font-semibold text-[var(--accent-indigo)] flex items-center gap-1">
              <Sparkles size={12} />
              <span className="hidden sm:inline">India</span> 🇮🇳
            </span>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-32 lg:pb-6">
        {/* Marketplace Tabs */}
        <div className="mb-6">
          <MarketplaceTabs
            active={inputs.marketplace}
            onChange={handleMarketplaceChange}
          />
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Input Form */}
          <div className="flex-1 min-w-0 space-y-6">
            <SellerDetailsForm
              details={sellerDetails}
              marketplace={inputs.marketplace}
              onChange={handleSellerChange}
            />
            <CalculatorForm inputs={inputs} onChange={handleInputChange} />
          </div>

          {/* Right: Summary Card (sticky on desktop, bottom sheet on mobile) */}
          <div className="w-full lg:w-[400px] xl:w-[420px] shrink-0">
            <SummaryCard
              result={result}
              marketplace={inputs.marketplace}
              mode={inputs.mode}
              onDownloadPDF={handleDownloadPDF}
            />
          </div>
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/50 backdrop-blur-sm py-4 hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <p>
            💡 Fees are estimates. Verify with the actual marketplace dashboard
            for precise rates.
          </p>
          <p>E-commerce Seller Cost Calculator — India 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
