/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  RefreshCw, 
  FastForward, 
  Sliders, 
  MapPin, 
  Clock, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  WaterQualityDataPoint, 
  StationInfo, 
  SimulationParameters, 
  RiskEvaluationResult 
} from '../types/waterQuality';
import { STATIONS, METRIC_DEFINITIONS } from '../constants/thresholds';
import { MetricCard } from './MetricCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { IntegratedDiagnosisHero } from './IntegratedDiagnosisHero';
import { RiskAssessmentPanel } from './RiskAssessmentPanel';

interface DashboardViewProps {
  currentStation: StationInfo;
  onSelectStation: (station: StationInfo) => void;
  dataPoints: WaterQualityDataPoint[];
  lastPoint: WaterQualityDataPoint;
  previousPoint?: WaterQualityDataPoint;
  riskEvaluation: RiskEvaluationResult;
  selectedMetricKey: string;
  onSelectMetric: (key: string) => void;
  simParams: SimulationParameters;
  onUpdateSimParams: (params: Partial<SimulationParameters>) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStepForward: () => void;
  onReset: () => void;
  intervalSeconds: number;
  onChangeInterval: (sec: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentStation,
  onSelectStation,
  dataPoints,
  lastPoint,
  previousPoint,
  riskEvaluation,
  selectedMetricKey,
  onSelectMetric,
  simParams,
  onUpdateSimParams,
  isRunning,
  onToggleRun,
  onStepForward,
  onReset,
  intervalSeconds,
  onChangeInterval,
}) => {
  const lastUpdatedTime = new Date(lastPoint.timestamp).toLocaleTimeString('ko-KR', {
    hour12: false,
  });

  return (
    <div className="space-y-6">
      {/* 🌟 1. RESULTS FIRST: SPLIT SCREEN (LEFT: CURRENT STATE & REAL-TIME ILLUSTRATION, RIGHT: SOLUTIONS & FERTILIZER DIRECTIONS) */}
      <IntegratedDiagnosisHero
        currentPoint={lastPoint}
        riskEvaluation={riskEvaluation}
        simParams={simParams}
        onUpdateSimParams={onUpdateSimParams}
      />

      {/* 2. Station Selection & Live Simulation Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Station Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">모의 관측 지점:</span>
          </div>

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

        {/* Live Controls: Interval, Step, Reset */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>최근 갱신:</span>
            <span className="font-semibold text-slate-800 tabular-nums">
              {lastUpdatedTime}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1" aria-hidden="true" />

          {/* Interval selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">주기:</span>
            <select
              value={intervalSeconds}
              onChange={(e) => onChangeInterval(Number(e.target.value))}
              className="text-xs font-mono border border-slate-200 bg-slate-50 rounded-md px-1.5 py-1 text-slate-700 cursor-pointer"
            >
              <option value={2}>2초</option>
              <option value={3}>3초</option>
              <option value={5}>5초</option>
              <option value={10}>10초</option>
            </select>
          </div>

          {/* Step forward */}
          <button
            onClick={onStepForward}
            title="수동 1스텝 데이터 생성"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1회 갱신</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title="기본 상태로 시뮬레이션 초기화"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </div>

      {/* 3. 7 Current Value Metric Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              실시간 가상 수질 지표 (7개 항목)
            </h2>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              카드를 클릭하여 하단 시계열 그래프를 전환할 수 있습니다.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.values(METRIC_DEFINITIONS).map((def) => {
            const currentVal = (lastPoint as any)[def.key] as number;
            const prevVal = previousPoint ? ((previousPoint as any)[def.key] as number) : undefined;
            const isSelected = selectedMetricKey === def.key;

            return (
              <MetricCard
                key={def.key}
                definition={def}
                currentValue={currentVal}
                previousValue={prevVal}
                isSelected={isSelected}
                onSelect={() => onSelectMetric(def.key)}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Quick Simulation Tweaker Strip */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-700" />
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">
              실시간 가상 환경 변수 제어 (시뮬레이터에 즉시 반영)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            강우량이나 시비량을 조절하면 상단의 일러스트와 솔루션이 즉각 재계산됩니다.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Rainfall Slider */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-slate-700">모의 강우 강도</span>
              <span className="font-mono font-semibold text-cyan-800 tabular-nums">
                {simParams.rainfallMmPerHour} mm/h
              </span>
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
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0 (맑음)</span>
              <span>20 (보통)</span>
              <span>60 (폭우)</span>
            </div>
          </div>

          {/* Fertilizer Intensity */}
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-medium text-slate-700">농경지 비료 시비 수준</span>
              <span className="font-semibold text-slate-800">
                {simParams.fertilizerIntensity === 'high' ? '과다 시비' : simParams.fertilizerIntensity === 'low' ? '소량 시비' : '적정 시비'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['low', 'normal', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onUpdateSimParams({ fertilizerIntensity: lvl })}
                  className={`py-1 rounded text-center font-medium transition-colors cursor-pointer ${
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

          {/* Vegetated Buffer Strip Switch */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">수변 식생 완충대 조성</span>
              <span className={`font-semibold ${simParams.vegetatedBufferActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                {simParams.vegetatedBufferActive ? '적용 중 (-40%)' : '미적용'}
              </span>
            </div>
            <button
              onClick={() => onUpdateSimParams({ vegetatedBufferActive: !simParams.vegetatedBufferActive })}
              className={`mt-2 py-1.5 px-3 rounded text-center font-medium transition-colors cursor-pointer ${
                simParams.vegetatedBufferActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {simParams.vegetatedBufferActive ? '완충녹지 효과 활성' : '식생 완충대 켜기'}
            </button>
          </div>

          {/* Smart Fertilizer Application Switch */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">스마트 분할 시비 관리</span>
              <span className={`font-semibold ${simParams.smartFertilizerActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                {simParams.smartFertilizerActive ? '적용 중 (-30%)' : '미적용'}
              </span>
            </div>
            <button
              onClick={() => onUpdateSimParams({ smartFertilizerActive: !simParams.smartFertilizerActive })}
              className={`mt-2 py-1.5 px-3 rounded text-center font-medium transition-colors cursor-pointer ${
                simParams.smartFertilizerActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {simParams.smartFertilizerActive ? '예보연동 시비 관리 활성' : '스마트 시비 관리 켜기'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Primary Time-Series Trend Chart */}
      <TimeSeriesChart
        data={dataPoints}
        selectedMetricKey={selectedMetricKey}
        onSelectMetric={onSelectMetric}
      />

      {/* 6. Rule-Based Risk Assessment & Diagnostic Breakdown */}
      <RiskAssessmentPanel evaluation={riskEvaluation} />
    </div>
  );
};
