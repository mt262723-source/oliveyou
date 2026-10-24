/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { RiskEvaluationResult } from '../types/waterQuality';

interface RiskAssessmentPanelProps {
  evaluation: RiskEvaluationResult;
}

export const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({ evaluation }) => {
  const { overallLevel, levelLabel, summary, primaryRiskFactors, explanation, disclaimer } = evaluation;

  const getStatusIcon = () => {
    switch (overallLevel) {
      case 'danger':
        return <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />;
      case 'caution':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'normal':
      default:
        return <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
  };

  const getThemeClass = () => {
    switch (overallLevel) {
      case 'danger':
        return {
          wrapper: 'border-rose-200 bg-rose-50/30',
          title: 'text-rose-950',
          badgeText: 'text-rose-700',
        };
      case 'caution':
        return {
          wrapper: 'border-amber-200 bg-amber-50/30',
          title: 'text-amber-950',
          badgeText: 'text-amber-700',
        };
      case 'normal':
      default:
        return {
          wrapper: 'border-emerald-200 bg-emerald-50/20',
          title: 'text-emerald-950',
          badgeText: 'text-emerald-700',
        };
    }
  };

  const theme = getThemeClass();

  return (
    <div className={`rounded-xl border p-4.5 ${theme.wrapper}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <h2 className="text-xs font-bold text-slate-900 tracking-tight">
            수질 오염 위험도 진단 및 지표 이상 징후 분석
          </h2>
          <span className="text-slate-400">·</span>
          <span className={`text-xs font-semibold ${theme.badgeText}`}>
            {levelLabel}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-mono text-[11px]">
          규칙 기반 자동 판정 엔진
        </span>
      </div>

      {/* Two Column Layout: Anomalies vs Interpretive Cautions */}
      <div className="mt-3.5 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Left Column: Detected Anomaly list */}
        <div className="bg-white/80 p-3 rounded-lg border border-slate-200/60">
          <span className="font-semibold text-slate-800 uppercase tracking-wider block mb-1.5 text-[11px]">
            감지된 지표 이상 징후
          </span>
          <ul className="space-y-1 text-slate-700">
            {primaryRiskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-slate-400 font-bold" aria-hidden="true">·</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: Multi-causal scientific interpretation */}
        <div className="bg-white/80 p-3 rounded-lg border border-slate-200/60">
          <span className="font-semibold text-slate-800 block mb-1.5 text-[11px]">
            인과 관계 해석 및 복합 오염원 검토 유의점
          </span>
          <p className="text-slate-600 leading-relaxed">
            {explanation}
          </p>
        </div>
      </div>

      {/* Legal & Educational Limitation Disclaimer */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>{disclaimer}</span>
      </div>
    </div>
  );
};
