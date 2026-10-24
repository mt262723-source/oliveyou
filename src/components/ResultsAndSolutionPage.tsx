/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Zap, 
  Sprout, 
  AlertOctagon, 
  AlertTriangle, 
  ShieldCheck, 
  Droplets, 
  Activity, 
  SlidersHorizontal,
  Calculator,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  WaterQualityDataPoint, 
  RiskEvaluationResult, 
  SimulationParameters,
  StationInfo
} from '../types/waterQuality';
import { METRIC_DEFINITIONS, STATIONS } from '../constants/thresholds';

interface ResultsAndSolutionPageProps {
  currentStation: StationInfo;
  onSelectStation: (station: StationInfo) => void;
  dataPoint: WaterQualityDataPoint;
  riskEvaluation: RiskEvaluationResult;
  simParams: SimulationParameters;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
  isRunning: boolean;
  onToggleRun: () => void;
}

// Fertilizer types database
type FertilizerTypeKey = 'urea' | 'npk_compound' | 'srf' | 'organic_cake' | 'compost';

interface FertilizerSpec {
  id: FertilizerTypeKey;
  name: string;
  category: string;
  nitrogenContent: string;
  releaseSpeed: string;
  rainSensitivity: 'very_high' | 'high' | 'medium' | 'low';
  standardDose: number; // kg per 10a (1000m2)
}

const FERTILIZER_OPTIONS: FertilizerSpec[] = [
  {
    id: 'urea',
    name: '요소 비료 (Urea)',
    category: '속효성 단비 (질소 46%)',
    nitrogenContent: 'N 46%',
    releaseSpeed: '매우 빠름 (물에 즉시 용해)',
    rainSensitivity: 'very_high',
    standardDose: 15,
  },
  {
    id: 'npk_compound',
    name: '맞춤형 NPK 복합비료 (21-17-17)',
    category: '속효성 복합비료',
    nitrogenContent: 'N 21% · P 17% · K 17%',
    releaseSpeed: '빠름 (초기 우수 유출 취약)',
    rainSensitivity: 'high',
    standardDose: 25,
  },
  {
    id: 'srf',
    name: '완효성 코팅비료 (SRF)',
    category: '친환경 서방형 비료',
    nitrogenContent: 'N 18% (피복 용출)',
    releaseSpeed: '완만함 (30~60일에 걸쳐 서서히 방출)',
    rainSensitivity: 'low',
    standardDose: 20,
  },
  {
    id: 'organic_cake',
    name: '유기질 유박비료 (혼합유박)',
    category: '유기농 친환경 자재',
    nitrogenContent: 'N 4% · P 2% · K 1%',
    releaseSpeed: '보통 (미생물 분해형)',
    rainSensitivity: 'medium',
    standardDose: 80,
  },
  {
    id: 'compost',
    name: '가축분뇨 발효 퇴비 (부숙퇴비)',
    category: '토양 개량 유기물',
    nitrogenContent: 'N 1.5% · P 1.8%',
    releaseSpeed: '완만 (강우 시 침출수 주의)',
    rainSensitivity: 'high',
    standardDose: 150,
  },
];

export const ResultsAndSolutionPage: React.FC<ResultsAndSolutionPageProps> = ({
  currentStation,
  onSelectStation,
  dataPoint,
  riskEvaluation,
  simParams,
  onUpdateSimParams,
}) => {
  const [selectedFertilizerId, setSelectedFertilizerId] = useState<FertilizerTypeKey>('urea');
  const [appliedFeedback, setAppliedFeedback] = useState(false);

  const { overallLevel, levelLabel, tailoredSolution, primaryRiskFactors } = riskEvaluation;
  const { nitrateMgL, phosphateMgL, dissolvedOxygenMgL, turbidityNTU, rainfallMmPerHour } = dataPoint;

  // Selected fertilizer spec
  const selectedFertilizer = FERTILIZER_OPTIONS.find((f) => f.id === selectedFertilizerId) || FERTILIZER_OPTIONS[0];

  // 1. Calculate Water Health Score (0-100)
  let score = 95;
  if (nitrateMgL >= METRIC_DEFINITIONS.nitrateMgL.dangerThreshold) score -= 28;
  else if (nitrateMgL >= METRIC_DEFINITIONS.nitrateMgL.cautionThreshold) score -= 15;

  if (phosphateMgL >= METRIC_DEFINITIONS.phosphateMgL.dangerThreshold) score -= 28;
  else if (phosphateMgL >= METRIC_DEFINITIONS.phosphateMgL.cautionThreshold) score -= 15;

  if (dissolvedOxygenMgL <= METRIC_DEFINITIONS.dissolvedOxygenMgL.dangerThreshold) score -= 28;
  else if (dissolvedOxygenMgL <= METRIC_DEFINITIONS.dissolvedOxygenMgL.cautionThreshold) score -= 15;

  if (turbidityNTU >= METRIC_DEFINITIONS.turbidityNTU.dangerThreshold) score -= 14;
  else if (turbidityNTU >= METRIC_DEFINITIONS.turbidityNTU.cautionThreshold) score -= 8;

  score = Math.max(12, Math.min(100, Math.round(score)));

  let scoreGrade = '매우 양호 (안전)';
  let scoreColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
  let gaugeColor = '#059669';

  if (score < 50) {
    scoreGrade = '수질 위험 (비점오염 경보)';
    scoreColor = 'text-rose-700 bg-rose-50 border-rose-300';
    gaugeColor = '#e11d48';
  } else if (score < 75) {
    scoreGrade = '수질 주의 (관리 요망)';
    scoreColor = 'text-amber-700 bg-amber-50 border-amber-300';
    gaugeColor = '#d97706';
  }

  // 2. Derive 2 Concise Tailored Solutions for Rain & Situation
  const getTwoSolutions = () => {
    if (rainfallMmPerHour >= 15 || nitrateMgL >= 6.0) {
      return [
        {
          num: '01',
          title: '강우기 비료 살포 전면 중단 및 논물꼬 10cm 상향',
          tag: '긴급 조치',
          tagColor: 'text-rose-800 bg-rose-100',
          desc: `현재 강우량(${rainfallMmPerHour}mm/h)과 고농도 질소로 인해 빗물 직격 시 살포 비료의 60% 이상이 즉시 유실됩니다. 즉시 시비를 중단하고 논물꼬를 높여 빗물을 포장 내 자연 담수 처리하세요.`,
        },
        {
          num: '02',
          title: '배수로 차단 및 둠벙 저류 후 순환 재양수',
          tag: '유출 분산',
          tagColor: 'text-amber-800 bg-amber-100',
          desc: '초기 우수 유출수가 하천으로 바로 흐르지 않도록 소하천 합류 밸브를 닫고 농업용 둠벙에 가두어 자연 정화 및 재이용을 유도합니다.',
        },
      ];
    } else if (turbidityNTU >= 15 || phosphateMgL >= 0.15) {
      return [
        {
          num: '01',
          title: '배수로 말단 볏짚 베일 및 모래주머니 침사턱 설치',
          tag: '토사 차단',
          tagColor: 'text-amber-800 bg-amber-100',
          desc: '흙탕물과 함께 흡착된 인산염이 하천으로 유입되는 것을 막기 위해 유출로에 볏짚 필터를 긴급 설치하여 미립자 토사를 70% 침전시킵니다.',
        },
        {
          num: '02',
          title: '비료 표면 살포 금지 및 10~15cm 심층 경운 시비',
          tag: '시비 방식',
          tagColor: 'text-emerald-800 bg-emerald-100',
          desc: '지표면에 흩뿌리는 시비를 일체 중단하고, 토양과 완전히 섞이도록 로터리 경운을 병행하여 빗물과의 접촉을 원천 차단합니다.',
        },
      ];
    } else {
      return [
        {
          num: '01',
          title: '토양 검정(흙토람) 처방 기준량 100% 준수 시비',
          tag: '정밀 시비',
          tagColor: 'text-emerald-800 bg-emerald-100',
          desc: '현재 수질이 매우 안정적이므로 불필요한 과다 투입을 억제하고 흙토람 비료사용처방서의 권장 기준량만을 분할 살포합니다.',
        },
        {
          num: '02',
          title: '수변 식생 완충대 초본 식생 유지 및 관리',
          tag: '예방 관리',
          tagColor: 'text-cyan-800 bg-cyan-100',
          desc: '하천 제방의 달뿌리풀과 수크령 완충대를 양호하게 유지하여 향후 발생할 수 있는 돌발 강우 시 완충력을 확보합니다.',
        },
      ];
    }
  };

  const twoSolutions = getTwoSolutions();

  // 3. Dynamic Fertilizer Requirement & Recommendation Calculator
  const calculateFertilizerNeed = () => {
    const std = selectedFertilizer.standardDose;
    let recommendKg = std;
    let statusText = '정상 시비 가능';
    let statusBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
    let timingGuide = '맑은 날 오전 생육 단계별 분할 시비';
    let reductionPercent = 0;

    if (rainfallMmPerHour >= 15 || nitrateMgL >= 8.0) {
      recommendKg = 0;
      statusText = '🚨 시비 전면 보류 (0 kg/10a 권장)';
      statusBadgeColor = 'text-rose-700 bg-rose-50 border-rose-300';
      timingGuide = '비가 완전히 그치고 토양 수분이 마른 48시간 후 살포';
      reductionPercent = 100;
    } else if (rainfallMmPerHour >= 5 || nitrateMgL >= 4.5 || phosphateMgL >= 0.15) {
      recommendKg = Math.round(std * 0.6);
      reductionPercent = 40;
      statusText = `⚠️ 40% 감축 처방 (${recommendKg} kg/10a)`;
      statusBadgeColor = 'text-amber-700 bg-amber-50 border-amber-300';
      timingGuide = '비 예보가 없을 때 2~3회로 나누어 소량 분할 살포';
    } else {
      recommendKg = Math.round(std * 0.9);
      reductionPercent = 10;
      statusText = `✅ 표준 적정 처방 (${recommendKg} kg/10a)`;
      statusBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
      timingGuide = '생육 적기에 맞추어 흙토람 기준량 시비';
    }

    return {
      recommendKg,
      reductionPercent,
      statusText,
      statusBadgeColor,
      timingGuide,
    };
  };

  const fertCalc = calculateFertilizerNeed();

  const handleApplyClick = () => {
    onUpdateSimParams(tailoredSolution.recommendedSimParams);
    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 4000);
  };

  const isAlreadyApplied =
    (!tailoredSolution.recommendedSimParams.vegetatedBufferActive || simParams.vegetatedBufferActive) &&
    (!tailoredSolution.recommendedSimParams.smartFertilizerActive || simParams.smartFertilizerActive);

  return (
    <div className="space-y-5">
      {/* Station Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">모의 관측 지점:</span>
          <select
            value={currentStation.id}
            onChange={(e) => {
              const found = STATIONS.find((s) => s.id === e.target.value);
              if (found) onSelectStation(found);
            }}
            className="text-xs font-medium border border-slate-200 bg-slate-50 text-slate-900 rounded-lg px-3 py-1.5 focus:outline-hidden focus:border-cyan-600 cursor-pointer"
          >
            {STATIONS.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name} ({station.id})
              </option>
            ))}
          </select>
          <span className="hidden md:inline text-xs text-slate-500">
            {currentStation.catchmentCharacteristics}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">최근 갱신:</span>
          <span className="text-xs font-mono font-semibold text-slate-800">
            {new Date(dataPoint.timestamp).toLocaleTimeString('ko-KR', { hour12: false })}
          </span>
        </div>
      </div>

      {appliedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-xs">
          <span>✓ 권장된 맞춤 솔루션(식생 완충대 가동, 비료 감축 처방)이 시뮬레이터에 성공적으로 반영되었습니다.</span>
          <span className="text-[11px] text-emerald-700">점진적 수질 회복 중</span>
        </div>
      )}

      {/* 🌟 SPLIT SCREEN: LEFT (HEALTH SCORE & STATUS) vs RIGHT (2 SOLUTIONS + FERTILIZER CALCULATOR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ===================== LEFT COLUMN (5 cols): SCORE & STATUS ===================== */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-700" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  현재 수질 오염도 및 종합 점수
                </h2>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${scoreColor}`}>
                {scoreGrade}
              </span>
            </div>

            {/* Big Health Score Gauge Card */}
            <div className="mt-5 p-5 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                수질 건전성 종합 점수 (100점 만점)
              </span>
              <div className="mt-2 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black font-mono tracking-tight" style={{ color: gaugeColor }}>
                  {score}
                </span>
                <span className="text-sm font-bold text-slate-400">/ 100점</span>
              </div>

              {/* Progress Meter */}
              <div className="mt-3 w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${score}%`, backgroundColor: gaugeColor }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0점 (비점오염 심각)</span>
                <span>50점 (주의)</span>
                <span>100점 (청정 안심)</span>
              </div>
            </div>

            {/* Key Detected Issues */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                감지된 주요 수질 지표 이상:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {primaryRiskFactors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-cyan-700 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4 Key Indicators Snapshot */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">질산염 (NO₃⁻)</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {nitrateMgL.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">인산염 (PO₄³⁻)</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {phosphateMgL.toFixed(3)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">용존산소 (DO)</span>
                <span className={`text-base font-bold tabular-nums ${
                  dissolvedOxygenMgL <= 4.0 ? 'text-rose-700' : dissolvedOxygenMgL <= 6.0 ? 'text-amber-700' : 'text-slate-900'
                }`}>
                  {dissolvedOxygenMgL.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mg/L</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block font-sans">탁도 / 강우량</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  {turbidityNTU.toFixed(0)} NTU / {rainfallMmPerHour.toFixed(0)} mm
                </span>
              </div>
            </div>
          </div>

          {/* Quick Simulation Rainfall Slider */}
          <div className="p-3 bg-slate-100/70 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-700" />
                모의 강우량 조절:
              </span>
              <span className="font-mono font-bold text-cyan-800">{simParams.rainfallMmPerHour} mm/h</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={1}
              value={simParams.rainfallMmPerHour}
              onChange={(e) => onUpdateSimParams({ rainfallMmPerHour: Number(e.target.value) })}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 text-center">
              강우량을 높이면 우측의 필요 비료량과 솔루션이 즉각 재계산됩니다.
            </div>
          </div>
        </div>

        {/* ===================== RIGHT COLUMN (7 cols): 2 SOLUTIONS + FERTILIZER SELECTOR/CALCULATOR ===================== */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            {/* Top Title & One-click Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-700" />
                  상황 맞춤 솔루션 & 비료 필요량 처방
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  현재 강우량({rainfallMmPerHour}mm/h)과 질산염 농도({nitrateMgL}mg/L)에 기반한 맞춤 지침
                </p>
              </div>

              <button
                onClick={handleApplyClick}
                disabled={isAlreadyApplied && !appliedFeedback}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
                  isAlreadyApplied && !appliedFeedback
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-cyan-700 hover:bg-cyan-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>
                  {isAlreadyApplied
                    ? '대책 시뮬레이션 적용 완료'
                    : '⚡ 이 솔루션 시뮬레이터에 적용'}
                </span>
              </button>
            </div>

            {/* PART 1: 2가지 핵심 맞춤 솔루션 간략 제시 (Two Concise Solutions) */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                현재 강우 및 수질 상황에 따른 핵심 솔루션 (2가지)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {twoSolutions.map((sol) => (
                  <div key={sol.num} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-700">솔루션 {sol.num}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${sol.tagColor}`}>
                        {sol.tag}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">
                      {sol.title}
                    </h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {sol.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* PART 2: 현재 쓰고 있는 비료 선택 & 필요 비료량 계산기 (Fertilizer Selector & Calculator) */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">
                    현재 사용 중인 비료 선택 및 필요 비료량 계산기
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border ${fertCalc.statusBadgeColor}`}>
                  {fertCalc.statusText}
                </span>
              </div>

              {/* Fertilizer Selector Dropdown & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    포장에서 사용 중인 비료 선택:
                  </label>
                  <select
                    value={selectedFertilizerId}
                    onChange={(e) => setSelectedFertilizerId(e.target.value as FertilizerTypeKey)}
                    className="w-full text-xs font-bold border border-emerald-300 bg-white text-slate-900 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                  >
                    {FERTILIZER_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.nitrogenContent})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-5 bg-white p-2.5 rounded-lg border border-emerald-200 text-xs">
                  <span className="text-[10px] text-slate-400 block">비료 성분 특성</span>
                  <span className="font-bold text-slate-800 block mt-0.5">{selectedFertilizer.category}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">용출 속도: {selectedFertilizer.releaseSpeed}</span>
                </div>
              </div>

              {/* Calculated Need Output Box */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-emerald-50/60 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">현재 권장 시비량</span>
                  <div className="mt-1 flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black font-mono text-emerald-800 tabular-nums">
                      {fertCalc.recommendKg}
                    </span>
                    <span className="text-xs font-bold text-slate-500">kg/10a</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    (표준 {selectedFertilizer.standardDose}kg 대비 -{fertCalc.reductionPercent}%)
                  </span>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg sm:col-span-2 text-left flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-cyan-700" />
                      현재 강우 조건 권장 시비 지침
                    </span>
                    <p className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
                      {fertCalc.timingGuide}
                    </p>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    * 빗물 유실을 방지하기 위해 지표 살포 금지, 10~15cm 토양 혼화 원칙 준수
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Navigation Link to Buffer Zone */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>* 상세한 유역 2D 모델은 상단 [2D 하천 3구간 시뮬레이터], 설치 가이드는 [완충지대 가이드] 탭 참조</span>
            <span className="font-semibold text-emerald-700">4R 영양관리 준수</span>
          </div>
        </div>
      </div>
    </div>
  );
};
