/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { MetricDefinition } from '../types/waterQuality';

interface MetricCardProps {
  definition: MetricDefinition;
  currentValue: number;
  previousValue?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  definition,
  currentValue,
  previousValue,
  isSelected,
  onSelect,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Status calculation
  let status: 'normal' | 'caution' | 'danger' = 'normal';
  let statusText = '정상 (시연용)';
  let statusGlyph = '●';
  let statusColor = 'text-emerald-700';

  if (definition.direction === 'higher_is_worse') {
    if (currentValue >= definition.dangerThreshold) {
      status = 'danger';
      statusText = '위험 (시연용)';
      statusGlyph = '✖';
      statusColor = 'text-rose-700';
    } else if (currentValue >= definition.cautionThreshold) {
      status = 'caution';
      statusText = '주의 (시연용)';
      statusGlyph = '▲';
      statusColor = 'text-amber-700';
    }
  } else {
    // lower is worse (e.g., DO)
    if (currentValue <= definition.dangerThreshold) {
      status = 'danger';
      statusText = '위험 저하 (시연용)';
      statusGlyph = '✖';
      statusColor = 'text-rose-700';
    } else if (currentValue <= definition.cautionThreshold) {
      status = 'caution';
      statusText = '주의 저하 (시연용)';
      statusGlyph = '▲';
      statusColor = 'text-amber-700';
    }
  }

  // Calculate delta
  const delta = previousValue !== undefined ? currentValue - previousValue : 0;
  const deltaFormatted = Math.abs(delta) < 0.001 
    ? '변동 없음' 
    : `${delta > 0 ? '+' : ''}${delta.toFixed(definition.precision)}`;

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border bg-white transition-all cursor-pointer ${
        isSelected
          ? 'border-cyan-600 ring-2 ring-cyan-500/20 shadow-xs'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Header zone */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 tracking-tight">
              {definition.label}
            </span>
            <span className="text-xs font-mono text-slate-400">
              ({definition.chemicalSymbol})
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className={`font-medium ${statusColor}`}>
              {statusGlyph} {statusText}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-sm"
          title="지표 설명 및 화학종 구분"
          aria-label={`${definition.label} 설명`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
          {currentValue.toFixed(definition.precision)}
        </span>
        {definition.unit && (
          <span className="text-xs font-mono text-slate-500">
            {definition.unit}
          </span>
        )}
      </div>

      {/* Delta indicator & thresholds info */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1">
          {delta > 0 ? (
            <ArrowUpRight className="w-3 h-3 text-amber-600" />
          ) : delta < 0 ? (
            <ArrowDownRight className="w-3 h-3 text-cyan-600" />
          ) : (
            <Minus className="w-3 h-3 text-slate-400" />
          )}
          <span className="tabular-nums">{deltaFormatted}</span>
        </span>
        <span className="text-[11px] text-slate-400">
          기준 {definition.cautionThreshold}{definition.unit}
        </span>
      </div>

      {/* Detail Tooltip Popup */}
      {showTooltip && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute z-20 left-2 right-2 bottom-full mb-2 p-3 bg-slate-900 text-slate-100 rounded-lg shadow-lg text-xs leading-relaxed border border-slate-700"
        >
          <div className="font-semibold text-slate-100 mb-1">{definition.description}</div>
          <div className="text-[11px] text-cyan-300 pt-1 border-t border-slate-800">
            {definition.chemicalDistinctionNote}
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="mt-2 text-[10px] text-slate-400 hover:text-white underline block"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};
