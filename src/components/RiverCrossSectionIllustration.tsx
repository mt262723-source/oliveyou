/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  WaterQualityDataPoint, 
  RiskLevel, 
  SimulationParameters 
} from '../types/waterQuality';
import { METRIC_DEFINITIONS } from '../constants/thresholds';

interface RiverCrossSectionIllustrationProps {
  data: WaterQualityDataPoint;
  simParams: SimulationParameters;
  overallLevel: RiskLevel;
}

export const RiverCrossSectionIllustration: React.FC<RiverCrossSectionIllustrationProps> = ({
  data,
  simParams,
  overallLevel,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Dynamic values
  const { nitrateMgL, phosphateMgL, dissolvedOxygenMgL, turbidityNTU, rainfallMmPerHour } = data;
  const isRaining = rainfallMmPerHour > 0.5;
  const isTurbid = turbidityNTU >= 15;
  const isEutrophic = (nitrateMgL >= 4.5 || phosphateMgL >= 0.15) && !isTurbid;
  const isHypoxic = dissolvedOxygenMgL <= 5.0;
  const hasBuffer = simParams.vegetatedBufferActive;

  // Determine water color
  let waterFill = '#38bdf8'; // clean sky blue
  let waterGradientStart = '#0284c7';
  let waterGradientEnd = '#38bdf8';
  let waterStatusDesc = '수질 청정 및 산소 포화 상태';

  if (isTurbid) {
    waterFill = '#a16207'; // muddy/turbid brown-yellow
    waterGradientStart = '#78350f';
    waterGradientEnd = '#b45309';
    waterStatusDesc = '토양 침식 및 부유토사 고탁수 상태';
  } else if (isEutrophic) {
    waterFill = '#65a30d'; // algae green
    waterGradientStart = '#3f6212';
    waterGradientEnd = '#84cc16';
    waterStatusDesc = '부영양화 및 조류 증식 징후 상태';
  } else if (isHypoxic) {
    waterFill = '#64748b'; // oxygen depleted gray-blue
    waterGradientStart = '#334155';
    waterGradientEnd = '#64748b';
    waterStatusDesc = '용존산소 결핍(저산소증) 상태';
  }

  // Section status summaries
  const sections = {
    farmland: {
      title: '구역 ① 농경지 및 작물 근권부',
      status: simParams.fertilizerIntensity === 'high' ? '비료 과다 축적' : simParams.fertilizerIntensity === 'low' ? '양분 균형' : '적정 시비',
      detail: `질소·인 투입 강도: ${simParams.fertilizerIntensity === 'high' ? '높음' : simParams.fertilizerIntensity === 'low' ? '낮음' : '보통'}. ${isRaining ? '강우로 인한 표면 세척 진행 중' : '안정적 토양 흡착 유지'}`,
      level: simParams.fertilizerIntensity === 'high' && isRaining ? 'danger' : 'normal'
    },
    buffer: {
      title: '구역 ② 수변 식생 완충대 (초본·목본)',
      status: hasBuffer ? '완충 기능 가동 중' : '완충대 미설치 (직방류)',
      detail: hasBuffer ? '갈대 및 목본 뿌리가 표토 침식을 막고 질산염을 탈질 중' : '농경지 유출수가 정화 없이 하천으로 직접 쏟아지는 상태',
      level: hasBuffer ? 'normal' : 'caution'
    },
    waterColumn: {
      title: '구역 ③ 하천 본류 및 수중 생태계',
      status: waterStatusDesc,
      detail: `용존산소: ${dissolvedOxygenMgL.toFixed(1)} mg/L, 탁도: ${turbidityNTU.toFixed(1)} NTU, 질산염: ${nitrateMgL.toFixed(1)} mg/L`,
      level: overallLevel
    },
    benthic: {
      title: '구역 ④ 하천 저질 퇴적층 (뻘·퇴적물)',
      status: isTurbid || phosphateMgL > 0.2 ? '퇴적물 누적 및 인 용출 위험' : '저질층 안정',
      detail: `인산염: ${phosphateMgL.toFixed(3)} mg/L. 저층 혐기화 시 퇴적물 속 인(P) 재용출 가능`,
      level: phosphateMgL >= 0.2 ? 'danger' : phosphateMgL >= 0.1 ? 'caution' : 'normal'
    }
  };

  const activeInfo = hoveredSection ? (sections as any)[hoveredSection] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            하천 유역 부위별 실시간 오염 상태 일러스트
          </span>
          <span className="text-[10px] font-mono bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.2 rounded-sm">
            LIVE SCHEMATIC
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          마우스 호버 시 부위별 상세 진단
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-21/9 bg-slate-900/5 rounded-lg overflow-hidden border border-slate-200">
        <svg viewBox="0 0 700 300" className="w-full h-full select-none">
          <defs>
            {/* Dynamic Water Gradient */}
            <linearGradient id="riverWaterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={waterGradientEnd} stopOpacity="0.8" />
              <stop offset="100%" stopColor={waterGradientStart} stopOpacity="0.95" />
            </linearGradient>

            {/* Farmland Soil Gradient */}
            <linearGradient id="soilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Buffer Greenery Gradient */}
            <linearGradient id="bufferGreenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>

            {/* Riverbed Sediment Gradient */}
            <linearGradient id="sedimentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>
          </defs>

          {/* SKY BACKDROP */}
          <rect x="0" y="0" width="700" height="150" fill={isRaining ? '#94a3b8' : '#e0f2fe'} />

          {/* CLOUDS OR RAIN */}
          {isRaining && (
            <g className="opacity-80">
              <ellipse cx="140" cy="35" rx="50" ry="20" fill="#475569" />
              <ellipse cx="180" cy="30" rx="60" ry="25" fill="#334155" />
              <ellipse cx="460" cy="35" rx="60" ry="22" fill="#475569" />
              <ellipse cx="500" cy="30" rx="70" ry="28" fill="#334155" />
              {/* Rain drops */}
              {[40, 80, 130, 170, 220, 270, 320, 370, 420, 470, 520, 570, 620, 660].map((rx, idx) => (
                <line
                  key={idx}
                  x1={rx}
                  y1={50 + (idx % 3) * 15}
                  x2={rx - 10}
                  y2={90 + (idx % 3) * 15}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              ))}
            </g>
          )}

          {/* ZONE 1: FARMLAND (Left Slope: x=0 to 240) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredSection('farmland')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Soil Body */}
            <polygon
              points="0,110 240,140 240,300 0,300"
              fill="url(#soilGradient)"
            />
            {/* Crops / Rice stalks */}
            {[20, 45, 70, 95, 120, 150, 180, 210].map((cx, idx) => (
              <g key={idx} transform={`translate(${cx}, ${110 + idx * 3.5})`}>
                <line x1="0" y1="0" x2="-4" y2="-18" stroke="#65a30d" strokeWidth="2.5" />
                <line x1="0" y1="0" x2="3" y2="-20" stroke="#84cc16" strokeWidth="2" />
                <line x1="0" y1="0" x2="7" y2="-14" stroke="#4d7c0f" strokeWidth="2" />
                {/* Fertilizer dots on soil if fertilizer intensity is high */}
                {simParams.fertilizerIntensity === 'high' && (
                  <circle cx="5" cy="4" r="2" fill="#facc15" />
                )}
              </g>
            ))}
            {/* Label */}
            <text x="70" y="180" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle">
              ① 농경지 (시비구역)
            </text>
            <text x="70" y="196" fill="#fde047" fontSize="9" textAnchor="middle">
              {simParams.fertilizerIntensity === 'high' ? '과다 시비 상태' : '적정 시비'}
            </text>

            {/* Runoff Arrows from farmland if raining */}
            {isRaining && (
              <g>
                <path
                  d="M 170,145 Q 210,150 245,155"
                  fill="none"
                  stroke={simParams.fertilizerIntensity === 'high' ? '#e11d48' : '#38bdf8'}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <polygon
                  points="245,155 237,150 239,157"
                  fill={simParams.fertilizerIntensity === 'high' ? '#e11d48' : '#38bdf8'}
                />
              </g>
            )}
          </g>

          {/* ZONE 2: RIPARIAN BUFFER STRIP (x=240 to 320) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredSection('buffer')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <polygon
              points="240,140 320,155 320,300 240,300"
              fill={hasBuffer ? 'url(#bufferGreenGradient)' : '#713f12'}
            />

            {hasBuffer ? (
              // Healthy Wetland & Trees
              <g>
                {/* Reeds & wetland grass */}
                {[250, 265, 280, 295, 310].map((bx, idx) => (
                  <g key={idx} transform={`translate(${bx}, ${143 + idx * 2.5})`}>
                    <line x1="0" y1="0" x2="-2" y2="-28" stroke="#16a34a" strokeWidth="2.5" />
                    <line x1="0" y1="0" x2="4" y2="-25" stroke="#22c55e" strokeWidth="2" />
                    <ellipse cx="-2" cy="-28" rx="2" ry="6" fill="#86efac" />
                  </g>
                ))}
                {/* Willow / Deep root tree */}
                <rect x="270" y="120" width="6" height="25" fill="#582d1d" />
                <circle cx="273" cy="110" r="16" fill="#15803d" />
                <circle cx="270" cy="104" r="12" fill="#22c55e" opacity="0.8" />
                
                {/* Subsurface Roots (Filtration graphic) */}
                <path d="M 273,145 L 260,180 M 273,145 L 285,190 M 273,145 L 273,205" stroke="#a3e635" strokeWidth="1.5" strokeDasharray="2 2" />
                
                <text x="280" y="240" fill="#bbf7d0" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ② 완충녹지
                </text>
                <text x="280" y="254" fill="#86efac" fontSize="8" textAnchor="middle">
                  유출수 여과 중
                </text>
              </g>
            ) : (
              // Bypassed/Degraded Bank
              <g>
                <text x="280" y="240" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle">
                  ② 완충대 부재
                </text>
                <text x="280" y="254" fill="#fecaca" fontSize="8" textAnchor="middle">
                  직방류 (비점오염)
                </text>
              </g>
            )}
          </g>

          {/* ZONE 3: RIVER WATER COLUMN (x=320 to 700, y=155 to 260) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-95"
            onMouseEnter={() => setHoveredSection('waterColumn')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Water Polygon */}
            <polygon
              points="320,155 700,155 700,260 320,260"
              fill="url(#riverWaterGradient)"
            />

            {/* Water surface ripples */}
            <path
              d="M 330,165 Q 400,160 470,165 T 610,165 T 690,165"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              opacity="0.4"
            />
            <path
              d="M 350,180 Q 420,175 490,180 T 630,180"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.25"
            />

            {/* FISH: Swimming happily or struggling */}
            {dissolvedOxygenMgL >= 5.0 ? (
              // Healthy Swimming Fish
              <g transform="translate(480, 205)">
                <ellipse cx="0" cy="0" rx="14" ry="7" fill="#f8fafc" />
                <polygon points="-12,0 -22,-6 -22,6" fill="#f8fafc" />
                <circle cx="8" cy="-2" r="1.5" fill="#0f172a" />
                {/* Oxygen bubbles */}
                <circle cx="-3" cy="-14" r="2.5" fill="#ffffff" opacity="0.7" />
                <circle cx="2" cy="-22" r="1.5" fill="#ffffff" opacity="0.6" />
                <text x="20" y="3" fill="#ffffff" fontSize="9" fontWeight="bold">정상 생육</text>
              </g>
            ) : (
              // Hypoxic / Struggling Fish near surface
              <g transform="translate(520, 172)">
                <ellipse cx="0" cy="0" rx="14" ry="7" fill="#fb7185" />
                <polygon points="-12,0 -20,-5 -20,5" fill="#fb7185" />
                <circle cx="8" cy="-2" r="1.5" fill="#881337" />
                <text x="18" y="3" fill="#fecdd3" fontSize="9" fontWeight="bold">저산소 스트레스</text>
              </g>
            )}

            {/* Suspended solids / Turbidity particles */}
            {isTurbid && (
              <g opacity="0.6">
                {[340, 380, 420, 460, 500, 550, 600, 650].map((px, idx) => (
                  <circle
                    key={idx}
                    cx={px}
                    cy={180 + (idx % 4) * 15}
                    r={2 + (idx % 2)}
                    fill="#fef08a"
                  />
                ))}
              </g>
            )}

            {/* Algae clusters if eutrophic */}
            {isEutrophic && (
              <g opacity="0.7">
                {[360, 410, 470, 530, 590, 640].map((ax, idx) => (
                  <ellipse
                    key={ax}
                    cx={ax}
                    cy={165 + (idx % 3) * 6}
                    rx="8"
                    ry="3"
                    fill="#4ade80"
                  />
                ))}
              </g>
            )}

            {/* Water Column Label */}
            <text x="510" y="235" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
              ③ 하천 본류 ({dissolvedOxygenMgL.toFixed(1)} mg/L DO · {nitrateMgL.toFixed(1)} mg/L NO₃⁻)
            </text>
          </g>

          {/* ZONE 4: RIVERBED SEDIMENT LAYER (x=320 to 700, y=260 to 300) */}
          <g
            className="cursor-pointer transition-opacity hover:opacity-90"
            onMouseEnter={() => setHoveredSection('benthic')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <polygon
              points="320,260 700,260 700,300 320,300"
              fill="url(#sedimentGradient)"
            />
            {/* Sediment rocks & silt */}
            {[340, 390, 450, 510, 580, 630, 670].map((sx, idx) => (
              <ellipse
                key={idx}
                cx={sx}
                cy={275 + (idx % 3) * 5}
                rx={12 + (idx % 5)}
                ry="5"
                fill="#27272a"
              />
            ))}
            <text x="510" y="290" fill="#a1a1aa" fontSize="10" textAnchor="middle">
              ④ 하천 바닥 저질층 (인산염 누적 및 저층 퇴적대: {phosphateMgL.toFixed(3)} mg/L)
            </text>
          </g>
        </svg>

        {/* Hover Readout Overlay Box */}
        {activeInfo && (
          <div className="absolute top-2 left-2 right-2 bg-slate-900/90 text-white p-2.5 rounded-lg text-xs backdrop-blur-xs border border-slate-700 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300">{activeInfo.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                activeInfo.level === 'danger'
                  ? 'bg-rose-900/80 text-rose-200'
                  : activeInfo.level === 'caution'
                  ? 'bg-amber-900/80 text-amber-200'
                  : 'bg-emerald-900/80 text-emerald-200'
              }`}>
                {activeInfo.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">{activeInfo.detail}</p>
          </div>
        )}
      </div>

      {/* Mini Legend & Section Badges */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div 
          onMouseEnter={() => setHoveredSection('farmland')}
          onMouseLeave={() => setHoveredSection(null)}
          className={`p-1.5 rounded-md border cursor-pointer ${
            hoveredSection === 'farmland' ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className="text-[10px] text-slate-500 block">① 농경지 표토</span>
          <span className="font-bold text-slate-800 text-[11px] truncate block">
            {simParams.fertilizerIntensity === 'high' ? '과다 시비' : '적정 시비'}
          </span>
        </div>

        <div 
          onMouseEnter={() => setHoveredSection('buffer')}
          onMouseLeave={() => setHoveredSection(null)}
          className={`p-1.5 rounded-md border cursor-pointer ${
            hoveredSection === 'buffer' ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className="text-[10px] text-slate-500 block">② 수변 완충대</span>
          <span className={`font-bold text-[11px] truncate block ${hasBuffer ? 'text-emerald-700' : 'text-slate-500'}`}>
            {hasBuffer ? '여과 가동 중' : '미설치'}
          </span>
        </div>

        <div 
          onMouseEnter={() => setHoveredSection('waterColumn')}
          onMouseLeave={() => setHoveredSection(null)}
          className={`p-1.5 rounded-md border cursor-pointer ${
            hoveredSection === 'waterColumn' ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className="text-[10px] text-slate-500 block">③ 하천 본류 수질</span>
          <span className={`font-bold text-[11px] truncate block ${
            overallLevel === 'danger' ? 'text-rose-700' : overallLevel === 'caution' ? 'text-amber-700' : 'text-cyan-800'
          }`}>
            {dissolvedOxygenMgL.toFixed(1)} mg/L (DO)
          </span>
        </div>

        <div 
          onMouseEnter={() => setHoveredSection('benthic')}
          onMouseLeave={() => setHoveredSection(null)}
          className={`p-1.5 rounded-md border cursor-pointer ${
            hoveredSection === 'benthic' ? 'border-cyan-500 bg-cyan-50/50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <span className="text-[10px] text-slate-500 block">④ 바닥 저질층</span>
          <span className="font-bold text-slate-800 text-[11px] truncate block">
            {phosphateMgL.toFixed(3)} mg/L (P)
          </span>
        </div>
      </div>
    </div>
  );
};
