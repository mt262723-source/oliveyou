/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { Sliders, Sparkles, Check, Info, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { StationInfo, SimulationParameters } from '../types/waterQuality';
import { projectScenarioCurve } from '../services/dataGenerator';

interface SimulationSandboxViewProps {
  currentStation: StationInfo;
  simParams: SimulationParameters;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
  onApplyToLive: () => void;
}

export const SimulationSandboxView: React.FC<SimulationSandboxViewProps> = ({
  currentStation,
  simParams,
  onUpdateSimParams,
  onApplyToLive,
}) => {
  const gradientId = useId();
  const [activePreset, setActivePreset] = useState<string>('custom');
  const [activeParamTab, setActiveParamTab] = useState<'nitrate' | 'phosphate' | 'do'>('nitrate');

  // Compute forward projection curve
  const projection = projectScenarioCurve(currentStation, simParams, 12);

  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'baseline':
        onUpdateSimParams({
          rainfallMmPerHour: 2,
          fertilizerIntensity: 'normal',
          vegetatedBufferActive: false,
          smartFertilizerActive: false,
        });
        break;
      case 'storm_excess':
        onUpdateSimParams({
          rainfallMmPerHour: 45,
          fertilizerIntensity: 'high',
          vegetatedBufferActive: false,
          smartFertilizerActive: false,
        });
        break;
      case 'mitigated':
        onUpdateSimParams({
          rainfallMmPerHour: 45,
          fertilizerIntensity: 'normal',
          vegetatedBufferActive: true,
          smartFertilizerActive: true,
        });
        break;
      case 'drought_shower':
        onUpdateSimParams({
          rainfallMmPerHour: 28,
          fertilizerIntensity: 'high',
          vegetatedBufferActive: true,
          smartFertilizerActive: false,
        });
        break;
      default:
        break;
    }
  };

  // Peak comparison calculation
  const maxSimN = Math.max(...projection.map((p) => p.simulatedNitrate));
  const maxSimP = Math.max(...projection.map((p) => p.simulatedPhosphate));
  const minSimDO = Math.min(...projection.map((p) => p.simulatedDO));

  // SVG Chart Geometry for comparative trajectory
  const width = 800;
  const height = 260;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  let keyToInspect = 'simulatedNitrate';
  let baseKeyToInspect = 'baselineNitrate';
  let yUnit = 'mg/L';
  let chartTitle = '질산염(NO₃⁻) 가상 농도 변화 시나리오';
  let maxYVal = Math.max(10, maxSimN * 1.25);
  let minYVal = 0;

  if (activeParamTab === 'phosphate') {
    keyToInspect = 'simulatedPhosphate';
    baseKeyToInspect = 'baselinePhosphate';
    chartTitle = '인산염(PO₄³⁻) 가상 농도 변화 시나리오';
    maxYVal = Math.max(0.4, maxSimP * 1.3);
  } else if (activeParamTab === 'do') {
    keyToInspect = 'simulatedDO';
    baseKeyToInspect = 'baselineNitrate'; // placeholder
    chartTitle = '용존산소(DO) 가상 반응 시나리오 (낮을수록 위험)';
    maxYVal = 10.0;
    minYVal = 2.0;
  }

  const getX = (idx: number) => padLeft + (idx / (projection.length - 1)) * plotWidth;
  const getY = (val: number) => {
    const clamped = Math.max(minYVal, Math.min(maxYVal, val));
    return padTop + plotHeight - ((clamped - minYVal) / (maxYVal - minYVal)) * plotHeight;
  };

  const simPoints = projection.map((p, i) => `${getX(i)},${getY((p as any)[keyToInspect])}`);
  const simLinePath = `M ${simPoints.join(' L ')}`;

  const basePoints = projection.map((p, i) => {
    const val = activeParamTab === 'do' ? currentStation.baselineDO : (p as any)[baseKeyToInspect];
    return `${getX(i)},${getY(val)}`;
  });
  const baseLinePath = `M ${basePoints.join(' L ')}`;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-700 shrink-0" />
          <span>
            <strong>교육용 가상 모델 안내:</strong> 본 시뮬레이션의 계산 결과는 수질 변화의 역학적 원리를 설명하기 위한 가상 시나리오 비교이며, 실제 현장의 저감률이나 절대적인 수질을 보장하지 않습니다.
          </span>
        </div>
      </div>

      {/* Preset Scenarios Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-2.5">
          가상 교육 시나리오 프리셋 선택
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset('baseline')}
            className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
              activePreset === 'baseline'
                ? 'bg-cyan-50/50 border-cyan-500 ring-1 ring-cyan-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900">01. 평상시 맑은 날</div>
            <div className="text-[11px] text-slate-500 mt-1">
              강우 2mm/h · 적정 시비 · 기준 상태
            </div>
          </button>

          <button
            onClick={() => applyPreset('storm_excess')}
            className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
              activePreset === 'storm_excess'
                ? 'bg-rose-50/50 border-rose-500 ring-1 ring-rose-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
              <span>02. 장마철 폭우 + 과다 시비</span>
              <span className="text-[10px] text-rose-600 font-bold font-mono">위험</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              강우 45mm/h · 고농도 비료 · 완충대 없음
            </div>
          </button>

          <button
            onClick={() => applyPreset('mitigated')}
            className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
              activePreset === 'mitigated'
                ? 'bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
              <span>03. 완충대 + 스마트 시비 적용</span>
              <span className="text-[10px] text-emerald-700 font-bold font-mono">개선</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              강우 45mm/h 동일 조건 · 완충녹지 및 예보연동
            </div>
          </button>

          <button
            onClick={() => applyPreset('drought_shower')}
            className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
              activePreset === 'drought_shower'
                ? 'bg-cyan-50/50 border-cyan-500 ring-1 ring-cyan-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-xs text-slate-900">04. 급성 소나기 유출</div>
            <div className="text-[11px] text-slate-500 mt-1">
              강우 28mm/h · 초기 세척(First Flush) 현상
            </div>
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid: Parameter Controls (Left) & Projection Graph (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Form (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              시뮬레이션 환경 변수 상세 조절
            </h2>
            <span className="text-xs font-mono text-slate-500">
              {currentStation.id}
            </span>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-800">모의 강우 강도</span>
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
                setActivePreset('custom');
                onUpdateSimParams({ rainfallMmPerHour: Number(e.target.value) });
              }}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 (무강우)</span>
              <span>25 (보통 비)</span>
              <span>80 (극한 호우)</span>
            </div>
          </div>

          {/* Fertilizer Intensity */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-800">비료 시비 강도 (질소·인 투입량)</span>
              <span className="font-semibold text-slate-700">
                {simParams.fertilizerIntensity === 'high' ? '과다 투입 (+80%)' : simParams.fertilizerIntensity === 'low' ? '소량 투입 (-40%)' : '표준 적정량'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    setActivePreset('custom');
                    onUpdateSimParams({ fertilizerIntensity: lvl });
                  }}
                  className={`py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                    simParams.fertilizerIntensity === lvl
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'low' ? '낮음' : lvl === 'normal' ? '보통' : '높음'}
                </button>
              ))}
            </div>
          </div>

          {/* Mitigation Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-800 block">
              친환경 완충 및 저감 대책 적용
            </span>

            {/* Buffer Strip */}
            <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={simParams.vegetatedBufferActive}
                onChange={(e) => {
                  setActivePreset('custom');
                  onUpdateSimParams({ vegetatedBufferActive: e.target.checked });
                }}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  수변 식생 완충대 (Vegetated Buffer Strip)
                </span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  농경지와 하천 사이에 5~10m 초본·목본 완충대를 두어 표면 유출수 유속을 늦추고 토양 입자 및 영양염류를 물리적으로 포집·흡착합니다.
                </span>
              </div>
            </label>

            {/* Smart Fertilizer */}
            <label className="flex items-start gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={simParams.smartFertilizerActive}
                onChange={(e) => {
                  setActivePreset('custom');
                  onUpdateSimParams({ smartFertilizerActive: e.target.checked });
                }}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  스마트 기상 연동 비료 관리 (Smart Fertilizer)
                </span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  토양검정 처방에 따른 분할 시비 및 강우 24시간 전 비료 살포 전면 중단 조치를 가상 시뮬레이션에 반영합니다.
                </span>
              </div>
            </label>
          </div>

          {/* Action button: Apply current parameters to live background simulator */}
          <div className="pt-2">
            <button
              onClick={onApplyToLive}
              className="w-full py-2 px-4 bg-cyan-700 text-white rounded-lg text-xs font-semibold hover:bg-cyan-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>현재 시나리오 설정을 실시간 대시보드에 적용</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Projection Chart & Findings (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {chartTitle}
              </h2>
              <span className="text-xs text-slate-500">
                12단계 모의 경과 시간 (+15분 ~ +180분 추이)
              </span>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveParamTab('nitrate')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeParamTab === 'nitrate'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                질산염 (NO₃⁻)
              </button>
              <button
                onClick={() => setActiveParamTab('phosphate')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeParamTab === 'phosphate'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                인산염 (PO₄³⁻)
              </button>
              <button
                onClick={() => setActiveParamTab('do')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  activeParamTab === 'do'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                용존산소 (DO)
              </button>
            </div>
          </div>

          {/* SVG Comparative Chart */}
          <div className="relative w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
              {/* Grid Lines */}
              {[minYVal, minYVal + (maxYVal - minYVal) * 0.5, maxYVal].map((val, idx) => (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={getY(val)}
                    x2={padLeft + plotWidth}
                    y2={getY(val)}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={getY(val) + 3}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Baseline Reference Line (Dashed) */}
              <path
                d={baseLinePath}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Scenario Projected Curve (Solid Cyan) */}
              <path
                d={simLinePath}
                fill="none"
                stroke="#0891b2"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {projection.map((p, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getY((p as any)[keyToInspect])}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#0891b2"
                  strokeWidth="2"
                />
              ))}

              {/* Time labels */}
              {projection.map((p, i) => {
                if (i % 3 === 0 || i === projection.length - 1) {
                  return (
                    <text
                      key={i}
                      x={getX(i)}
                      y={padTop + plotHeight + 16}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-400 font-mono"
                    >
                      {p.timeLabel}
                    </text>
                  );
                }
                return null;
              })}
            </svg>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 font-mono border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-cyan-600 inline-block"></span>
                  <span className="font-sans text-slate-800">설정 시나리오 모의 결과</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-slate-400 inline-block border-b border-dashed"></span>
                  <span className="font-sans text-slate-500">평상시 기준선 (Baseline)</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                단위: {activeParamTab === 'phosphate' ? 'mg/L (PO₄³⁻)' : activeParamTab === 'nitrate' ? 'mg/L (NO₃⁻)' : 'mg/L (DO)'}
              </div>
            </div>
          </div>

          {/* Scenario Comparison Stats Box */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">시나리오 최고 질산염</span>
              <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                {maxSimN} mg/L
              </span>
              <span className="text-[10px] text-slate-400">
                (기준치 {currentStation.baselineNitrate} 대비 +{((maxSimN - currentStation.baselineNitrate)).toFixed(2)})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">시나리오 최고 인산염</span>
              <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                {maxSimP} mg/L
              </span>
              <span className="text-[10px] text-slate-400">
                (기준치 {currentStation.baselinePhosphate} 대비 +{((maxSimP - currentStation.baselinePhosphate)).toFixed(3)})
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[11px]">시나리오 최저 용존산소</span>
              <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block tabular-nums">
                {minSimDO} mg/L
              </span>
              <span className="text-[10px] text-slate-400">
                (기저 {currentStation.baselineDO} 대비 -{((currentStation.baselineDO - minSimDO)).toFixed(2)})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
