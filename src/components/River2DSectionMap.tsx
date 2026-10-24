/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  WaterQualityDataPoint, 
  SimulationParameters, 
  RiskLevel, 
  StationInfo 
} from '../types/waterQuality';
import { STATIONS, METRIC_DEFINITIONS } from '../constants/thresholds';
import { 
  Droplets, 
  CloudRain, 
  Sprout, 
  Trees, 
  Zap, 
  RotateCcw, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Play,
  Pause,
  SlidersHorizontal,
  Flame,
  Wind
} from 'lucide-react';

interface River2DSectionMapProps {
  currentStation: StationInfo;
  onSelectStation: (station: StationInfo) => void;
  data: WaterQualityDataPoint;
  simParams: SimulationParameters;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
  overallLevel: RiskLevel;
}

export const River2DSectionMap: React.FC<River2DSectionMapProps> = ({
  currentStation,
  onSelectStation,
  data,
  simParams,
  onUpdateSimParams,
  overallLevel,
}) => {
  const [selectedSection, setSelectedSection] = useState<'upstream' | 'midstream' | 'downstream'>('upstream');
  const [flowTick, setFlowTick] = useState(0);
  const [aeratorActive, setAeratorActive] = useState(false);
  const [activeScenarioName, setActiveScenarioName] = useState<string>('사용자 정의');

  // Animation ticker for river flow & rain
  useEffect(() => {
    const timer = setInterval(() => {
      setFlowTick((prev) => (prev + 1) % 100);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const { nitrateMgL, phosphateMgL, dissolvedOxygenMgL, turbidityNTU, rainfallMmPerHour } = data;
  const isRaining = rainfallMmPerHour > 0.5;
  const hasBuffer = simParams.vegetatedBufferActive;
  const isHighFertilizer = simParams.fertilizerIntensity === 'high';

  // Section specific calculations
  // 1. Upstream (상류: 농경지 직배수)
  const upstreamN = (nitrateMgL * 1.15).toFixed(2);
  const upstreamTurb = (turbidityNTU * (isRaining ? 1.25 : 1.0)).toFixed(1);
  const upstreamLevel: RiskLevel =
    Number(upstreamN) >= METRIC_DEFINITIONS.nitrateMgL.dangerThreshold ? 'danger' :
    Number(upstreamN) >= METRIC_DEFINITIONS.nitrateMgL.cautionThreshold ? 'caution' : 'normal';

  // 2. Midstream (가운데/중류: 완충녹지 여과)
  const midstreamP = (phosphateMgL * (hasBuffer ? 0.65 : 1.0)).toFixed(3);
  const midstreamTurb = (turbidityNTU * (hasBuffer ? 0.6 : 1.0)).toFixed(1);
  const midstreamLevel: RiskLevel =
    Number(midstreamP) >= METRIC_DEFINITIONS.phosphateMgL.dangerThreshold ? 'danger' :
    Number(midstreamP) >= METRIC_DEFINITIONS.phosphateMgL.cautionThreshold ? 'caution' : 'normal';

  // 3. Downstream (하류: 용존산소 & 조류 번식)
  const effDO = aeratorActive ? Math.min(11.0, dissolvedOxygenMgL + 2.4) : dissolvedOxygenMgL;
  const downstreamDO = (effDO * (hasBuffer ? 1.05 : 0.92)).toFixed(2);
  const downstreamN = (nitrateMgL * (hasBuffer ? 0.7 : 0.95)).toFixed(2);
  const downstreamLevel: RiskLevel =
    Number(downstreamDO) <= METRIC_DEFINITIONS.dissolvedOxygenMgL.dangerThreshold ? 'danger' :
    Number(downstreamDO) <= METRIC_DEFINITIONS.dissolvedOxygenMgL.cautionThreshold ? 'caution' : 'normal';

  // Water colors per section
  const getSectionWaterGradient = (level: RiskLevel, type: 'up' | 'mid' | 'down') => {
    if (level === 'danger') {
      if (type === 'up') return { start: '#9a3412', end: '#c2410c' }; // Muddy brown-orange
      if (type === 'mid') return { start: '#b45309', end: '#d97706' }; // Amber
      return { start: '#1e293b', end: '#334155' }; // Hypoxic dark slate
    }
    if (level === 'caution') {
      if (type === 'up') return { start: '#d97706', end: '#f59e0b' };
      if (type === 'mid') return { start: '#65a30d', end: '#84cc16' }; // Algae green
      return { start: '#0284c7', end: '#38bdf8' };
    }
    // Normal / Clean
    return { start: '#0284c7', end: '#38bdf8' };
  };

  const upColors = getSectionWaterGradient(upstreamLevel, 'up');
  const midColors = getSectionWaterGradient(midstreamLevel, 'mid');
  const downColors = getSectionWaterGradient(downstreamLevel, 'down');

  // Simulator Presets
  const runPresetScenario = (name: string) => {
    setActiveScenarioName(name);
    if (name === 'storm_disaster') {
      onUpdateSimParams({
        rainfallMmPerHour: 55,
        fertilizerIntensity: 'high',
        vegetatedBufferActive: false,
        smartFertilizerActive: false,
      });
      setAeratorActive(false);
    } else if (name === 'green_mitigation') {
      onUpdateSimParams({
        rainfallMmPerHour: 40,
        fertilizerIntensity: 'normal',
        vegetatedBufferActive: true,
        smartFertilizerActive: true,
      });
      setAeratorActive(true);
    } else if (name === 'clear_baseline') {
      onUpdateSimParams({
        rainfallMmPerHour: 0,
        fertilizerIntensity: 'normal',
        vegetatedBufferActive: true,
        smartFertilizerActive: true,
      });
      setAeratorActive(false);
    }
  };

  const resetSimulator = () => {
    setActiveScenarioName('초기화');
    onUpdateSimParams({
      rainfallMmPerHour: 0,
      fertilizerIntensity: 'normal',
      vegetatedBufferActive: false,
      smartFertilizerActive: false,
    });
    setAeratorActive(false);
  };

  // Section Selector sync with stations
  const selectSectionHandler = (sec: 'upstream' | 'midstream' | 'downstream') => {
    setSelectedSection(sec);
    if (sec === 'upstream') onSelectStation(STATIONS[0]);
    if (sec === 'midstream') onSelectStation(STATIONS[1]);
    if (sec === 'downstream') onSelectStation(STATIONS[2]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Simulator Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              하천 3대 구간(상류·중류·하류) 실시간 수질 시뮬레이터
              <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-sm">
                INTERACTIVE SIM
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              강우 발생기, 비료 살포기, 완충녹지, 하류 폭기 밸브를 직접 조작하며 하천 구간별 수질 변화를 모의 관찰하세요.
            </p>
          </div>
        </div>

        {/* Preset Scenarios Fast Switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <span className="text-[11px] text-slate-500 px-1 font-semibold">시뮬레이션 모의:</span>
          <button
            onClick={() => runPresetScenario('storm_disaster')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeScenarioName === 'storm_disaster'
                ? 'bg-rose-700 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            ⛈️ 폭우+과다시비
          </button>
          <button
            onClick={() => runPresetScenario('green_mitigation')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeScenarioName === 'green_mitigation'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌿 완충녹지 가동
          </button>
          <button
            onClick={() => runPresetScenario('clear_baseline')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              activeScenarioName === 'clear_baseline'
                ? 'bg-cyan-700 text-white font-bold shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            ☀️ 평상시 맑음
          </button>
          <button
            onClick={resetSimulator}
            title="초기화"
            className="p-1 text-slate-500 hover:text-slate-900 rounded-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🌟 2D SVG Interactive River Flow Simulation Canvas */}
      <div className="relative w-full aspect-21/8 sm:aspect-21/7 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg select-none">
        <svg viewBox="0 0 960 300" className="w-full h-full">
          <defs>
            {/* Dynamic Water Gradients */}
            <linearGradient id="upRiverWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={upColors.start} stopOpacity="0.9" />
              <stop offset="100%" stopColor={upColors.end} stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="midRiverWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={midColors.start} stopOpacity="0.9" />
              <stop offset="100%" stopColor={midColors.end} stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="downRiverWater" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={downColors.start} stopOpacity="0.9" />
              <stop offset="100%" stopColor={downColors.end} stopOpacity="0.95" />
            </linearGradient>

            {/* Farmland soil pattern */}
            <linearGradient id="soilPattern" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
          </defs>

          {/* BACKDROP SKY & RAIN CLOUDS */}
          <rect x="0" y="0" width="960" height="300" fill={isRaining ? '#334155' : '#0f172a'} />

          {/* RAIN DROPS ANIMATION */}
          {isRaining && (
            <g opacity="0.6">
              {[30, 80, 140, 200, 270, 340, 410, 480, 550, 620, 690, 760, 830, 900].map((rx, idx) => {
                const yOffset = ((flowTick * 4 + idx * 30) % 180);
                return (
                  <line
                    key={idx}
                    x1={rx}
                    y1={20 + yOffset}
                    x2={rx - 10}
                    y2={45 + yOffset}
                    stroke="#38bdf8"
                    strokeWidth="1.8"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </g>
          )}

          {/* ================= ZONE 1: UPSTREAM FARMLAND (x: 0 to 320) ================= */}
          <g>
            {/* Farmland Slope */}
            <polygon points="0,80 320,105 320,165 0,165" fill="url(#soilPattern)" />
            
            {/* Crops */}
            {[25, 65, 105, 145, 185, 225, 265, 300].map((cx, i) => (
              <g key={cx} transform={`translate(${cx}, ${92 + i * 2})`}>
                <line x1="0" y1="0" x2="-2" y2="-14" stroke="#84cc16" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="3" y2="-16" stroke="#a3e635" strokeWidth="2" />
                {/* Fertilizer dots on soil */}
                {isHighFertilizer && (
                  <circle cx="3" cy="2" r="2.5" fill="#facc15" />
                )}
              </g>
            ))}

            {/* Runoff surge particles if raining */}
            {isRaining && (
              <g>
                {[60, 120, 180, 240, 290].map((px, i) => {
                  const shift = (flowTick * 2.5 + i * 20) % 50;
                  return (
                    <circle
                      key={i}
                      cx={px + shift * 0.4}
                      cy={120 + shift * 0.7}
                      r="2.5"
                      fill={isHighFertilizer ? '#fbbf24' : '#67e8f9'}
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            )}

            <text x="160" y="70" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">
              ① 상류 농경지 시비구역
            </text>
          </g>

          {/* ================= ZONE 2: MIDSTREAM BUFFER WETLAND (x: 320 to 640) ================= */}
          <g>
            <polygon points="320,105 640,115 640,165 320,165" fill={hasBuffer ? '#14532d' : '#27272a'} />

            {/* Buffer Greenery Trees & Reeds */}
            {hasBuffer ? (
              [345, 390, 440, 490, 540, 590, 625].map((tx, idx) => (
                <g key={tx} transform={`translate(${tx}, 120)`}>
                  <rect x="-2" y="-12" width="4" height="12" fill="#451a03" />
                  <circle cx="0" cy="-18" r="12" fill="#15803d" />
                  <circle cx="2" cy="-21" r="8" fill="#22c55e" opacity="0.8" />
                  {/* Root filtration graphic */}
                  <path d="M 0,0 L -4,15 M 0,0 L 5,20" stroke="#86efac" strokeWidth="1.2" strokeDasharray="2 2" />
                </g>
              ))
            ) : (
              <g>
                <text x="480" y="135" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
                  완충녹지 미설치 (비점오염수 여과 없이 직방류)
                </text>
              </g>
            )}

            <text x="480" y="70" fill="#86efac" fontSize="12" fontWeight="bold" textAnchor="middle">
              ② 가운데 (중류 합류부 & 식생 완충대)
            </text>
          </g>

          {/* ================= ZONE 3: DOWNSTREAM ECO-PARK & INTAKE (x: 640 to 960) ================= */}
          <g>
            <polygon points="640,115 960,120 960,165 640,165" fill="#0c4a6e" />

            {/* Aerator Device if active */}
            {aeratorActive && (
              <g transform="translate(800, 140)">
                <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <path d="M -8,0 Q 0,-8 8,0 Q 0,8 -8,0" fill="#ffffff" />
                {/* Froth bubbles */}
                <circle cx="-12" cy="-10" r="3" fill="#ffffff" opacity="0.8" />
                <circle cx="10" cy="-12" r="3.5" fill="#ffffff" opacity="0.7" />
                <circle cx="15" cy="5" r="2.5" fill="#ffffff" opacity="0.9" />
                <text x="0" y="24" fill="#7dd3fc" fontSize="9" fontWeight="bold" textAnchor="middle">
                  수중 폭기기 가동 중
                </text>
              </g>
            )}

            <text x="800" y="70" fill="#7dd3fc" fontSize="12" fontWeight="bold" textAnchor="middle">
              ③ 하류 (유수지 & 취수 생태보호구역)
            </text>
          </g>

          {/* ================= RIVER WATER STREAM (y: 165 to 260) ================= */}
          {/* Segment 1: Upstream Water */}
          <path
            d="M 0,165 C 100,160 200,170 320,165 L 320,265 C 200,270 100,260 0,265 Z"
            fill="url(#upRiverWater)"
          />

          {/* Segment 2: Midstream Water */}
          <path
            d="M 320,165 C 420,160 520,170 640,165 L 640,265 C 520,260 420,270 320,265 Z"
            fill="url(#midRiverWater)"
          />

          {/* Segment 3: Downstream Water */}
          <path
            d="M 640,165 C 740,160 840,170 960,165 L 960,265 C 840,260 740,270 640,265 Z"
            fill="url(#downRiverWater)"
          />

          {/* FLOWING CURRENT PARTICLES */}
          <g opacity="0.5">
            {[40, 120, 220, 360, 460, 560, 680, 780, 880].map((fx, i) => {
              const xPos = (fx + flowTick * 3) % 960;
              return (
                <path
                  key={i}
                  d={`M ${xPos},${195 + (i % 3) * 15} Q ${xPos + 25},${190 + (i % 3) * 15} ${xPos + 50},${195 + (i % 3) * 15}`}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* FISH ANIMATION IN DOWNSTREAM */}
          {Number(downstreamDO) >= 5.0 ? (
            <g transform={`translate(${720 + Math.sin(flowTick * 0.1) * 30}, 215)`}>
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#ffffff" />
              <polygon points="-12,0 -20,-6 -20,6" fill="#ffffff" />
              <circle cx="8" cy="-2" r="1.5" fill="#0f172a" />
              <text x="18" y="3" fill="#ffffff" fontSize="9" fontWeight="bold">생육 양호</text>
            </g>
          ) : (
            <g transform={`translate(${740 + Math.sin(flowTick * 0.05) * 15}, 180)`}>
              <ellipse cx="0" cy="0" rx="14" ry="7" fill="#fb7185" />
              <polygon points="-12,0 -20,-6 -20,6" fill="#fb7185" />
              <circle cx="8" cy="-2" r="1.5" fill="#881337" />
              <text x="18" y="3" fill="#fecdd3" fontSize="9" fontWeight="bold">저산소 스트레스</text>
            </g>
          )}

          {/* BOUNDARY DIVIDERS */}
          <line x1="320" y1="60" x2="320" y2="270" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="640" y1="60" x2="640" y2="270" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

          {/* HUD TELEMETRY CHIPS OVER WATER */}
          {/* Section 1 HUD */}
          <g
            className="cursor-pointer"
            onClick={() => selectSectionHandler('upstream')}
          >
            <rect x="30" y="210" width="260" height="42" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#f59e0b" strokeWidth={selectedSection === 'upstream' ? '2' : '1'} />
            <text x="45" y="228" fill="#fde047" fontSize="11" fontWeight="bold">① 상류 수질 상태</text>
            <text x="45" y="244" fill="#ffffff" fontSize="11" fontFamily="monospace">
              질산염 {upstreamN} mg/L · 탁도 {upstreamTurb} NTU
            </text>
          </g>

          {/* Section 2 HUD */}
          <g
            className="cursor-pointer"
            onClick={() => selectSectionHandler('midstream')}
          >
            <rect x="350" y="210" width="260" height="42" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#10b981" strokeWidth={selectedSection === 'midstream' ? '2' : '1'} />
            <text x="365" y="228" fill="#86efac" fontSize="11" fontWeight="bold">② 가운데 수질 상태</text>
            <text x="365" y="244" fill="#ffffff" fontSize="11" fontFamily="monospace">
              인산염 {midstreamP} mg/L · 여과 {hasBuffer ? '작동(-40%)' : '미작동'}
            </text>
          </g>

          {/* Section 3 HUD */}
          <g
            className="cursor-pointer"
            onClick={() => selectSectionHandler('downstream')}
          >
            <rect x="670" y="210" width="260" height="42" rx="6" fill="#0f172a" fillOpacity="0.85" stroke="#38bdf8" strokeWidth={selectedSection === 'downstream' ? '2' : '1'} />
            <text x="685" y="228" fill="#7dd3fc" fontSize="11" fontWeight="bold">③ 하류 수질 상태</text>
            <text x="685" y="244" fill="#ffffff" fontSize="11" fontFamily="monospace">
              용존산소 {downstreamDO} mg/L · {aeratorActive ? '폭기중' : '자연상태'}
            </text>
          </g>
        </svg>
      </div>

      {/* 🌟 SIMULATOR CONTROL DECK (DIRECT INTERACTIVE MANIPULATION) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-cyan-700" />
            하천 환경 시뮬레이션 제어기 (즉시 수질 반응 관찰)
          </span>
          <span className="text-[11px] text-slate-500">
            슬라이더 및 토글 조작 시 강줄기 색상과 어류 반응이 실시간 동기화됩니다.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Controller 1: Rainfall Generator */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-cyan-700" />
                모의 강우 발생기
              </span>
              <span className="font-mono font-bold text-cyan-800 tabular-nums">
                {simParams.rainfallMmPerHour} mm/h
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={1}
              value={simParams.rainfallMmPerHour}
              onChange={(e) => {
                setActiveScenarioName('사용자 정의');
                onUpdateSimParams({ rainfallMmPerHour: Number(e.target.value) });
              }}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
              <span>맑음(0)</span>
              <span>보통(25)</span>
              <span>극한폭우(80)</span>
            </div>
          </div>

          {/* Controller 2: Fertilizer Spreader */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                상류 비료 시비 강도
              </span>
              <span className="font-bold text-slate-800 text-[11px]">
                {simParams.fertilizerIntensity === 'high' ? '과다 시비' : simParams.fertilizerIntensity === 'low' ? '소량' : '적정'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setActiveScenarioName('사용자 정의');
                    onUpdateSimParams({ fertilizerIntensity: lvl });
                  }}
                  className={`py-1 text-center font-medium rounded-md transition-colors cursor-pointer ${
                    simParams.fertilizerIntensity === lvl
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'low' ? '소량' : lvl === 'normal' ? '적정' : '과다'}
                </button>
              ))}
            </div>
          </div>

          {/* Controller 3: Midstream Buffer Strip Filter Gate */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Trees className="w-3.5 h-3.5 text-emerald-700" />
                가운데 식생 완충대
              </span>
              <span className={`font-bold text-[11px] ${hasBuffer ? 'text-emerald-700' : 'text-slate-400'}`}>
                {hasBuffer ? '여과 가동 중' : '미설치'}
              </span>
            </div>
            <button
              onClick={() => {
                setActiveScenarioName('사용자 정의');
                onUpdateSimParams({ vegetatedBufferActive: !hasBuffer });
              }}
              className={`py-1.5 px-3 rounded-md text-center font-semibold transition-colors cursor-pointer ${
                hasBuffer
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {hasBuffer ? '식생 여과 가동 (-40% 차단)' : '식생 완충대 켜기'}
            </button>
          </div>

          {/* Controller 4: Downstream Aerator Device */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-700" />
                하류 수중 폭기장치
              </span>
              <span className={`font-bold text-[11px] ${aeratorActive ? 'text-cyan-700' : 'text-slate-400'}`}>
                {aeratorActive ? '산소 주입 중' : '정지'}
              </span>
            </div>
            <button
              onClick={() => setAeratorActive(!aeratorActive)}
              className={`py-1.5 px-3 rounded-md text-center font-semibold transition-colors cursor-pointer ${
                aeratorActive
                  ? 'bg-cyan-100 text-cyan-900 border border-cyan-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {aeratorActive ? '폭기기 가동 (+2.4mg/L DO)' : '폭기장치 켜기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
