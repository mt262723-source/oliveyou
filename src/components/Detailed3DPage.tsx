/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  WaterQualityDataPoint, 
  StationInfo, 
  SimulationParameters, 
  RiskEvaluationResult 
} from '../types/waterQuality';
import { METRIC_DEFINITIONS, STATIONS } from '../constants/thresholds';
import { River2DSectionMap } from './River2DSectionMap';
import { RiverCrossSectionIllustration } from './RiverCrossSectionIllustration';
import { MetricCard } from './MetricCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { RecordsTableView } from './RecordsTableView';
import { Layers, Database, MapPin, CheckCircle2, SplitSquareVertical } from 'lucide-react';

interface Detailed3DPageProps {
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
}

export const Detailed3DPage: React.FC<Detailed3DPageProps> = ({
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
}) => {
  const [selectedZone, setSelectedZone] = useState<'upstream' | 'midstream' | 'downstream'>('upstream');
  const [subSection, setSubSection] = useState<'2d_view' | 'cross_section' | 'history_table'>('2d_view');

  const handleZoneSelect = (zone: 'upstream' | 'midstream' | 'downstream') => {
    setSelectedZone(zone);
    if (zone === 'upstream') onSelectStation(STATIONS[0]);
    if (zone === 'midstream') onSelectStation(STATIONS[1]);
    if (zone === 'downstream') onSelectStation(STATIONS[2]);
  };

  // Generate zone-specific adjusted values for the 7 metrics based on user selection
  const isUp = currentStation.id === 'STATION_A' || selectedZone === 'upstream';
  const isMid = currentStation.id === 'STATION_B' || selectedZone === 'midstream';
  const hasBuffer = simParams.vegetatedBufferActive;

  const currentZonePoint: WaterQualityDataPoint = {
    ...lastPoint,
    stationName: isUp ? '상류 (농경지 유입구)' : isMid ? '가운데 (중류 합류부 & 완충대)' : '하류 (생태보호 유수지)',
    nitrateMgL: Number((lastPoint.nitrateMgL * (isUp ? 1.15 : isMid ? (hasBuffer ? 0.75 : 0.95) : (hasBuffer ? 0.65 : 0.9))).toFixed(2)),
    phosphateMgL: Number((lastPoint.phosphateMgL * (isUp ? 1.2 : isMid ? (hasBuffer ? 0.65 : 1.0) : (hasBuffer ? 0.55 : 0.9))).toFixed(3)),
    dissolvedOxygenMgL: Number((lastPoint.dissolvedOxygenMgL * (isUp ? 0.95 : isMid ? 1.0 : (hasBuffer ? 1.05 : 0.88))).toFixed(2)),
    turbidityNTU: Number((lastPoint.turbidityNTU * (isUp ? (simParams.rainfallMmPerHour > 0 ? 1.3 : 1.0) : isMid ? (hasBuffer ? 0.6 : 1.0) : 0.8)).toFixed(1)),
    rainfallMmPerHour: simParams.rainfallMmPerHour,
  };

  const zoneTitle = 
    selectedZone === 'upstream' ? '① 상류 구간 (농경지 배수 유입구)' :
    selectedZone === 'midstream' ? '② 가운데 구간 (중류 합류부 & 완충녹지)' :
    '③ 하류 구간 (생태보호 유수지 & 취수구역)';

  const zoneDesc =
    selectedZone === 'upstream' ? '강우 시 농경지 비료 및 표토 침식이 가장 먼저 직접 유입되는 지점입니다.' :
    selectedZone === 'midstream' ? '소하천 지류 합류 및 수변 식생 완충대(버드나무·갈대)의 여과 작용이 일어나는 지점입니다.' :
    '유속이 느려지며 누적된 영양염류로 인한 조류 번식 및 용존산소(DO) 저하를 관찰하는 지점입니다.';

  return (
    <div className="space-y-6">
      {/* Top View Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-semibold text-slate-700">현재 선택된 관측 구역:</span>
          <span className="text-xs font-bold text-slate-900 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md">
            {zoneTitle}
          </span>
        </div>

        {/* 3 Sub-View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSubSection('2d_view')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              subSection === '2d_view'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D 하천 3대 구간 시뮬레이터</span>
          </button>
          <button
            onClick={() => setSubSection('cross_section')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              subSection === 'cross_section'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>하천·토양 단면도 (유출 & 침투)</span>
          </button>
          <button
            onClick={() => setSubSection('history_table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              subSection === 'history_table'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>측정 이력 & CSV</span>
          </button>
        </div>
      </div>

      {subSection === '2d_view' && (
        <>
          {/* 🌟 1. 2D RIVER SIMULATION VIEWER (상류/가운데/하류 3대 구간 인터랙티브 시뮬레이터) */}
          <River2DSectionMap
            currentStation={currentStation}
            onSelectStation={(st) => {
              onSelectStation(st);
              if (st.id === 'STATION_A') setSelectedZone('upstream');
              else if (st.id === 'STATION_B') setSelectedZone('midstream');
              else setSelectedZone('downstream');
            }}
            data={lastPoint}
            simParams={simParams}
            onUpdateSimParams={onUpdateSimParams}
            overallLevel={riskEvaluation.overallLevel}
          />

          {/* 🌟 2. SECTION SPECIFIC 7 METRICS DISPLAY (DYNAMICALLY UPDATED ON 3-ZONE CLICK) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-700" />
                  {zoneTitle} 상세 수질 지표 정밀 측정치 (7개 항목)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {zoneDesc}
                </p>
              </div>

              {/* Quick Section Switch Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => handleZoneSelect('upstream')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedZone === 'upstream' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ① 상류
                </button>
                <button
                  onClick={() => handleZoneSelect('midstream')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedZone === 'midstream' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ② 가운데(중류)
                </button>
                <button
                  onClick={() => handleZoneSelect('downstream')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    selectedZone === 'downstream' ? 'bg-cyan-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ③ 하류
                </button>
              </div>
            </div>

            {/* 7 Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
              {Object.values(METRIC_DEFINITIONS).map((def) => {
                const currentVal = (currentZonePoint as any)[def.key] as number;
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

          {/* 3. Interactive Time-Series Chart */}
          <TimeSeriesChart
            data={dataPoints}
            selectedMetricKey={selectedMetricKey}
            onSelectMetric={onSelectMetric}
          />
        </>
      )}

      {subSection === 'cross_section' && (
        <div className="space-y-6">
          <RiverCrossSectionIllustration
            data={lastPoint}
            simParams={simParams}
            overallLevel={riskEvaluation.overallLevel}
          />

          {/* 7 Metric Cards Grid in Cross Section View */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <CheckCircle2 className="w-4 h-4 text-cyan-700" />
              단면도 대응 수질 지표 현황
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-1">
              {Object.values(METRIC_DEFINITIONS).map((def) => {
                const currentVal = (lastPoint as any)[def.key] as number;
                const isSelected = selectedMetricKey === def.key;
                return (
                  <MetricCard
                    key={def.key}
                    definition={def}
                    currentValue={currentVal}
                    isSelected={isSelected}
                    onSelect={() => onSelectMetric(def.key)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {subSection === 'history_table' && (
        <RecordsTableView dataPoints={dataPoints} />
      )}
    </div>
  );
};
