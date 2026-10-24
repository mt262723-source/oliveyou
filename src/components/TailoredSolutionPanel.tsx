/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  CheckCircle, 
  Layers, 
  ArrowRight, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Cpu, 
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { TailoredSolution, SimulationParameters } from '../types/waterQuality';

interface TailoredSolutionPanelProps {
  solution: TailoredSolution;
  onApplySolution: (params: Partial<SimulationParameters>) => void;
  activeSimParams: SimulationParameters;
}

export const TailoredSolutionPanel: React.FC<TailoredSolutionPanelProps> = ({
  solution,
  onApplySolution,
  activeSimParams,
}) => {
  const [selectedActorFilter, setSelectedActorFilter] = useState<'all' | '농업인' | '지자체/수자원' | '환경감시'>('all');
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  // Check if current active simulation already has the recommended parameters active
  const isAlreadyApplied =
    (!solution.recommendedSimParams.vegetatedBufferActive || activeSimParams.vegetatedBufferActive) &&
    (!solution.recommendedSimParams.smartFertilizerActive || activeSimParams.smartFertilizerActive) &&
    (!solution.recommendedSimParams.fertilizerIntensity || activeSimParams.fertilizerIntensity === solution.recommendedSimParams.fertilizerIntensity);

  const handleApplyClick = () => {
    onApplySolution(solution.recommendedSimParams);
    setAppliedFeedback(true);
    setTimeout(() => {
      setAppliedFeedback(false);
    }, 4000);
  };

  const filteredActions = solution.actions.filter((action) => {
    if (selectedActorFilter === 'all') return true;
    return action.actor.includes(selectedActorFilter);
  });

  const getUrgencyIcon = () => {
    switch (solution.urgency) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'moderate':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'stable':
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />;
    }
  };

  const getUrgencyHeaderTheme = () => {
    switch (solution.urgency) {
      case 'critical':
        return {
          wrapper: 'border-rose-300 bg-rose-50/50',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          btnBg: 'bg-rose-700 hover:bg-rose-800',
        };
      case 'moderate':
        return {
          wrapper: 'border-amber-300 bg-amber-50/50',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          btnBg: 'bg-amber-700 hover:bg-amber-800',
        };
      case 'stable':
      default:
        return {
          wrapper: 'border-emerald-300 bg-emerald-50/40',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          btnBg: 'bg-emerald-700 hover:bg-emerald-800',
        };
    }
  };

  const theme = getUrgencyHeaderTheme();

  return (
    <div className={`rounded-xl border p-5 shadow-xs transition-colors ${theme.wrapper}`}>
      {/* Top Solution Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getUrgencyIcon()}
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-sm border bg-white text-slate-800">
              실시간 측정 수질 맞춤 솔루션
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-sm border ${theme.badge}`}>
              {solution.urgencyLabel}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight pt-1">
            {solution.title}
          </h2>
          <div className="text-xs text-slate-600 font-medium">
            진단 패턴: <span className="text-slate-800 font-semibold">{solution.diagnosticPattern}</span>
          </div>
        </div>

        {/* One-Click Mitigation Action Button */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <button
            onClick={handleApplyClick}
            disabled={isAlreadyApplied && !appliedFeedback}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-colors cursor-pointer ${
              isAlreadyApplied && !appliedFeedback
                ? 'bg-slate-400 cursor-not-allowed'
                : theme.btnBg
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {isAlreadyApplied
                ? '맞춤 대책 시뮬레이션 적용 완료'
                : '이 맞춤 솔루션 시뮬레이터에 즉시 적용'}
            </span>
          </button>
          {appliedFeedback && (
            <span className="text-[11px] font-semibold text-emerald-700 animate-pulse">
              ✓ 추천된 완충 및 시비 제어 설정이 시뮬레이션에 반영되었습니다!
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Evidence & Trigger Text */}
      <div className="mt-3.5 p-3 bg-white/80 rounded-lg border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">
              현재 지표 기반 맞춤 진단 근거
            </span>
            <span>{solution.evidenceText}</span>
          </div>
        </div>
      </div>

      {/* Stakeholder Action Filter */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">이행 주체별 조치 필터:</span>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          {(['all', '농업인', '지자체/수자원', '환경감시'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedActorFilter(filter)}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                selectedActorFilter === filter
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {filter === 'all' ? '전체 보기' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Step-by-Step Action Cards */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredActions.map((act) => {
          const isImmediate = act.stage.includes('즉시');
          return (
            <div
              key={act.id}
              className="p-3.5 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                      isImmediate
                        ? 'bg-rose-100 text-rose-800'
                        : act.stage.includes('단기')
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cyan-100 text-cyan-800'
                    }`}
                  >
                    {act.stage}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                    {act.actor}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900">
                  {act.action}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-normal">
                  {act.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-cyan-800 bg-cyan-50/50 p-2 rounded-sm">
                <span className="font-semibold">정화 과학 원리: </span>
                <span>{act.effectMechanism}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Expected Simulation Outcome */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <Cpu className="w-3.5 h-3.5 text-cyan-700" />
          <span>시뮬레이터 예측 효과:</span>
          <span className="text-slate-800 font-semibold">{solution.expectedOutcome}</span>
        </div>
        <div className="text-[11px] text-slate-400">
          * 실제 현장 적용 시 토양·수질 전문기관의 현장 정밀 검사 필수
        </div>
      </div>
    </div>
  );
};
