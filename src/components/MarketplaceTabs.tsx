'use client';

import React from 'react';
import { Marketplace } from '@/lib/types';
import { MARKETPLACE_CONFIGS } from '@/lib/calculator';

interface MarketplaceTabsProps {
  active: Marketplace;
  onChange: (marketplace: Marketplace) => void;
}

const marketplaces: Marketplace[] = ['amazon', 'flipkart', 'meesho'];

export default function MarketplaceTabs({
  active,
  onChange,
}: MarketplaceTabsProps) {
  return (
    <div className="glass-card p-2 animate-fade-in">
      <div className="flex gap-2">
        {marketplaces.map((key) => {
          const config = MARKETPLACE_CONFIGS[key];
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`
                tab-button flex-1 flex items-center justify-center gap-2
                ${isActive ? 'active' : ''}
              `}
              style={
                isActive
                  ? {
                      background: config.gradient,
                      boxShadow: `0 4px 20px ${config.color}40`,
                    }
                  : undefined
              }
              aria-pressed={isActive}
              aria-label={`Select ${config.displayName}`}
            >
              <span className="text-lg">{config.icon}</span>
              <span className="hidden sm:inline">{config.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
