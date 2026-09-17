import React, { useState, useEffect } from 'react';

interface LiquidityDepthChartProps {
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  token0Symbol: string;
  token1Symbol: string;
  onChangeRange?: (min: number, max: number) => void;
  mode?: 'dual' | 'single-usdc' | 'single-token';
}

export const LiquidityDepthChart: React.FC<LiquidityDepthChartProps> = ({
  currentPrice,
  minPrice,
  maxPrice,
  token0Symbol,
  token1Symbol,
  onChangeRange,
  mode = 'dual',
}) => {
  const [zoomLevel, setZoomLevel] = useState<'10' | '20' | '30' | '50' | '70' | '90' | 'full'>('20');

  const barsCount = 40;
  // Calculate display range based on current price
  const spreadPercent = zoomLevel === '10' ? 0.25 : zoomLevel === '20' ? 0.5 : zoomLevel === '30' ? 0.7 : zoomLevel === '50' ? 1.2 : zoomLevel === '70' ? 1.6 : zoomLevel === '90' ? 1.9 : 3.0;
  
  const minDisplayPrice = Math.max(0.000001, currentPrice * (1 - spreadPercent / 2));
  const maxDisplayPrice = currentPrice * (1 + spreadPercent / 2);

  const bars = Array.from({ length: barsCount }, (_, i) => {
    const p = minDisplayPrice + (i / (barsCount - 1)) * (maxDisplayPrice - minDisplayPrice);
    const diff = (p - currentPrice) / (currentPrice * 0.3 || 1);
    const height = Math.max(12, Math.exp(-0.5 * diff * diff) * 88 + Math.sin(i * 0.6) * 6);
    const inRange = p >= minPrice && p <= maxPrice;
    return { price: p, height, inRange };
  });

  const isInRange = currentPrice >= minPrice && currentPrice <= maxPrice;
  const isSingleUsdc = mode === 'single-usdc';
  const isSingleToken = mode === 'single-token';

  return (
    <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-3 font-sans">
      {/* Chart Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            Liquidity Density
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              isInRange
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                : isSingleUsdc
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
            }`}
          >
            {isInRange
              ? '● In-Range (Earning Fees)'
              : isSingleUsdc
              ? '● Single-Sided USDC (Dip Limit)'
              : isSingleToken
              ? '● Single-Sided Token (Take-Profit)'
              : '● Out-of-Range'}
          </span>
        </div>
      </div>

      {/* SVG Depth Chart Histogram */}
      <div className="h-36 w-full relative select-none">
        <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
          {/* Background gridlines */}
          <line x1="0" y1="30" x2="400" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="400" y2="60" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />

          {/* Histogram Bars */}
          {bars.map((bar, i) => {
            const x = (i / barsCount) * 400;
            const barWidth = 400 / barsCount - 1.5;
            const y = 120 - bar.height;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={bar.height}
                rx="2.5"
                className={`transition-colors duration-200 ${
                  bar.inRange
                    ? isSingleUsdc
                      ? 'fill-blue-500/80 hover:fill-blue-500'
                      : 'fill-rose-500/80 hover:fill-rose-500'
                    : 'fill-slate-300/50 dark:fill-slate-700/50 hover:fill-slate-400'
                }`}
              />
            );
          })}

          {/* Current Market Price Line */}
          <line
            x1="200"
            y1="0"
            x2="200"
            y2="120"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Current price marker pill */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold shadow-md">
          Current: {currentPrice >= 1000 ? currentPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : currentPrice >= 1 ? currentPrice.toFixed(4) : currentPrice.toPrecision(4)} {token1Symbol}/{token0Symbol}
        </div>
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <div>Min: {minPrice === 0 ? '0' : minPrice >= 1000 ? minPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : minPrice.toPrecision(4)}</div>
        <div className="text-slate-400 font-sans text-[10px]">Market Center</div>
        <div>Max: {maxPrice === Infinity ? '∞' : maxPrice >= 1000 ? maxPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : maxPrice.toPrecision(4)}</div>
      </div>
    </div>
  );
};
