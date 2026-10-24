/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Sprout, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  Droplets,
  Layers,
  Thermometer,
  CloudRain
} from 'lucide-react';
import { 
  WaterQualityDataPoint, 
  RiskEvaluationResult, 
  SimulationParameters 
} from '../types/waterQuality';
import { METRIC_DEFINITIONS } from '../constants/thresholds';
import { RiverCrossSectionIllustration } from './RiverCrossSectionIllustration';

interface IntegratedDiagnosisHeroProps {
  currentPoint: WaterQualityDataPoint;
  riskEvaluation: RiskEvaluationResult;
  simParams: SimulationParameters;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
}

export const IntegratedDiagnosisHero: React.FC<IntegratedDiagnosisHeroProps> = ({
  currentPoint,
  riskEvaluation,
  simParams,
  onUpdateSimParams,
}) => {
  const [appliedFeedback, setAppliedFeedback] = useState(false);
  const { overallLevel, levelLabel, tailoredSolution } = riskEvaluation;
  const { nitrateMgL, phosphateMgL, dissolvedOxygenMgL, turbidityNTU, rainfallMmPerHour } = currentPoint;

  // Determine dynamic fertilizer management direction based on current readings
  const getFertilizerDirection = () => {
    if (rainfallMmPerHour >= 10 || nitrateMgL >= METRIC_DEFINITIONS.nitrateMgL.dangerThreshold) {
      return {
        status: '🚨 시비 전면 중단 권고',
        statusColor: 'text-rose-700 bg-rose-50 border-rose-300',
        coreRule: '강우 중 또는 토양 질산염 포화 상태이므로 추가 비료 살포를 즉각 중단해야 합니다.',
        fertilizerType: '속효성 요소·유안 비료 전면 금지 → 완효성 코팅비료(SRF)로 전환',
        dosageGuide: '표준 기준량 대비 40~50% 감축 처방 (토양 잔류 질소 고려)',
        timingDepth: '비가 완전히 그친 후 48시간 뒤 10~15cm 심층 경운 시비',
        waterManagement: '논물꼬 10cm 높여 빗물 자연 담수 유지 (배수구 직방류 차단)'
      };
    } else if (phosphateMgL >= METRIC_DEFINITIONS.phosphateMgL.cautionThreshold || turbidityNTU >= 15) {
      return {
        status: '⚠️ 인산질 비료 감축 및 심층 시비 전환',
        statusColor: 'text-amber-700 bg-amber-50 border-amber-300',
        coreRule: '표토 유실과 함께 인 성분이 하천으로 유출되므로 지표면 살포를 엄격히 금합니다.',
        fertilizerType: '과석·용성인비의 지표 노출 금지, 유기물 완숙 퇴비 우선 사용',
        dosageGuide: '토양 검정 인산 함량에 따라 30% 감량 및 분할 살포',
        timingDepth: '파종·이앙 전 로터리 작업 시 흙과 완전히 혼화',
        waterManagement: '배수로 말단 볏짚 베일 및 모래주머니 임시 침사지 운영'
      };
    } else if (dissolvedOxygenMgL <= 5.0) {
      return {
        status: '⚠️ 유기물 액비 및 미부숙 퇴비 시비 금지',
        statusColor: 'text-amber-700 bg-amber-50 border-amber-300',
        coreRule: '하천 산소 고갈 상태이므로 미생물 산소 소비를 가중시키는 유기물 유입을 차단합니다.',
        fertilizerType: '액비(가축분뇨 발효액) 살포 일시 정지, 정밀 무기질 비료 소량 점적 관비',
        dosageGuide: '생육 최저 필요량만 관비(Drip) 형태로 핀포인트 공급',
        timingDepth: '하천 DO가 6.5mg/L 이상 회복될 때까지 농경지 퇴수 차단',
        waterManagement: '배출수를 하천으로 흘리지 않고 둠벙에 모아 순환 재이용'
      };
    } else {
      return {
        status: '✅ 친환경 적정 균형 시비 유지',
        statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        coreRule: '현재 양분 균형이 양호하므로 흙토람 처방 기준량을 준수하여 안정성을 유지합니다.',
        fertilizerType: '작물별 전용 복합비료 및 맞춤형 완효성 비료',
        dosageGuide: '농업기술센터 흙토람 비료사용처방서 표준 100% 준수',
        timingDepth: '생육 단계별(밑거름-가지거름-이삭거름) 3회 분할 시비',
        waterManagement: '수변 식생 완충대 건전성 상시 유지 및 완충 초지 예초 관리'
      };
    }
  };

  const fertDirection = getFertilizerDirection();

  const handleApplyClick = () => {
    onUpdateSimParams(tailoredSolution.recommendedSimParams);
    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 4000);
  };

  const isAlreadyApplied =
    (!tailoredSolution.recommendedSimParams.vegetatedBufferActive || simParams.vegetatedBufferActive) &&
    (!tailoredSolution.recommendedSimParams.smartFertilizerActive || simParams.smartFertilizerActive) &&
    (!tailoredSolution.recommendedSimParams.fertilizerIntensity || simParams.fertilizerIntensity === tailoredSolution.recommendedSimParams.fertilizerIntensity);

  return (
    <div className="space-y-4">
      {/* Hero Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3.5 shadow-xs">
        <div className="flex items-center gap-2.5">
          {overallLevel === 'danger' ? (
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
          ) : overallLevel === 'caution' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                실시간 수질 진단 및 맞춤 대응 통합 관제
              </h1>
              <span className="text-slate-400">·</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm border ${
                overallLevel === 'danger'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : overallLevel === 'caution'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {levelLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              좌측의 실시간 하천 오염 상태에 즉각 대응하는 우측의 수질 정화책과 비료 사용 지침입니다.
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyClick}
            disabled={isAlreadyApplied && !appliedFeedback}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
              isAlreadyApplied && !appliedFeedback
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-cyan-700 hover:bg-cyan-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {isAlreadyApplied
                ? '맞춤 대책 시뮬레이션 적용 완료'
                : '⚡ 이 해결책 및 비료 방향 즉시 적용'}
            </span>
          </button>
        </div>
      </div>

      {appliedFeedback && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 font-medium flex items-center justify-between">
          <span>✓ 권장된 수질 해결책과 비료 감축 설정이 가상 시뮬레이터에 성공적으로 반영되었습니다.</span>
          <span className="text-[11px] text-emerald-700">지표 변화를 관찰하세요</span>
        </div>
      )}

      {/* 🌟 2-COLUMN SPLIT SCREEN: LEFT (CURRENT STATE & ILLUSTRATION) vs RIGHT (SOLUTION & FERTILIZER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ===================== LEFT COLUMN (6 cols): CURRENT STATE & ILLUSTRATION ===================== */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Sectional Illustration */}
          <RiverCrossSectionIllustration
            data={currentPoint}
            simParams={simParams}
            overallLevel={overallLevel}
          />

          {/* Key Metrics Quick Ribbon */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">질산염 (NO₃⁻)</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {nitrateMgL.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">인산염 (PO₄³⁻)</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {phosphateMgL.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">용존산소 (DO)</span>
              <span className={`text-base font-bold font-mono tabular-nums ${
                dissolvedOxygenMgL <= 4.0 ? 'text-rose-700' : dissolvedOxygenMgL <= 6.0 ? 'text-amber-700' : 'text-slate-900'
              }`}>
                {dissolvedOxygenMgL.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">탁도 / 강우량</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {turbidityNTU.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">NTU</span> / {rainfallMmPerHour.toFixed(0)} <span className="text-[10px] font-normal text-slate-400">mm</span>
              </span>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (6 cols): SOLUTIONS & FERTILIZER DIRECTIONS ===================== */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Card 1: Water Pollution Tailored Solution */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-700" />
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    현재 상태 맞춤 수질오염 해결책
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">
                  {tailoredSolution.urgencyLabel}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 mb-1">
                {tailoredSolution.title}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                {tailoredSolution.evidenceText}
              </p>

              {/* Action Bullets */}
              <div className="space-y-2">
                {tailoredSolution.actions.slice(0, 3).map((act) => (
                  <div key={act.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <span className="text-cyan-700">[{act.stage}]</span> {act.action}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-xs font-semibold">
                        {act.actor}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{act.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-cyan-800 flex items-center justify-between">
              <span>예측 효과: {tailoredSolution.expectedOutcome}</span>
            </div>
          </div>

          {/* Card 2: Targeted Fertilizer Management Direction */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    현재 수질 맞춤 비료 사용 방향
                  </h3>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${fertDirection.statusColor}`}>
                  {fertDirection.status}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-800 mb-3">
                {fertDirection.coreRule}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-0.5">권장 비료 종류</span>
                  <span className="text-[11px] text-slate-700 leading-tight block">{fertDirection.fertilizerType}</span>
                </div>

                <div className="p-2 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-0.5">시비량 조절</span>
                  <span className="text-[11px] text-slate-700 leading-tight block">{fertDirection.dosageGuide}</span>
                </div>

                <div className="p-2 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-0.5">시비 시기 및 깊이</span>
                  <span className="text-[11px] text-slate-700 leading-tight block">{fertDirection.timingDepth}</span>
                </div>

                <div className="p-2 bg-emerald-50/40 border border-emerald-200 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-0.5">포장 물꼬 및 배수 관리</span>
                  <span className="text-[11px] text-slate-700 leading-tight block">{fertDirection.waterManagement}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>* 토양검정(흙토람 처방서) 기반 양분 총량 관리 연동</span>
              <span className="font-semibold text-emerald-700">4R 영양관리 원칙</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
