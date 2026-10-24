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
import { MetricCard } from './MetricCard';
import { TimeSeriesChart } from './TimeSeriesChart';
import { RecordsTableView } from './RecordsTableView';
import { Layers, Database, MapPin } from 'lucide-react';

interface DetailedDataPageProps {
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

export const DetailedDataPage: React.FC<DetailedDataPageProps> = ({
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
  const [subSection, setSubSection] = useState<'map_and_metrics' | 'table_history'>('map_and_metrics');

  return (
    <div className="space-y-6">
      {/* Sub-view toggle buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-cyan-700" />
          <span className="text-xs font-semibold text-slate-700">현재 관측 지점:</span>
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
            {currentStation.name}
          </span>
          <span className="hidden sm:inline text-xs text-slate-500">
            ({currentStation.catchmentCharacteristics})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSubSection('map_and_metrics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              subSection === 'map_and_metrics'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D 구간 지도 & 실시간 지표</span>
          </button>
          <button
            onClick={() => setSubSection('table_history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              subSection === 'table_history'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>전체 데이터 이력 & CSV</span>
          </button>
        </div>
      </div>

      {subSection === 'map_and_metrics' && (
        <>
          {/* 🌟 1. 2D River Flow Section Map (Upstream, Midstream, Downstream) */}
          <River2DSectionMap
            currentStation={currentStation}
            onSelectStation={onSelectStation}
            data={lastPoint}
            simParams={simParams}
            onUpdateSimParams={onUpdateSimParams}
            overallLevel={riskEvaluation.overallLevel}
          />

          {/* 2. 7 Key Metric Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                실시간 수질 지표 정밀 측정치 (7개 항목)
              </h2>
              <span className="text-xs text-slate-500">
                카드를 클릭하여 하단 시계열 그래프의 표시 지표를 전환할 수 있습니다.
              </span>
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

          {/* 3. Interactive Time-Series Chart */}
          <TimeSeriesChart
            data={dataPoints}
            selectedMetricKey={selectedMetricKey}
            onSelectMetric={onSelectMetric}
          />
        </>
      )}

      {subSection === 'table_history' && (
        <RecordsTableView dataPoints={dataPoints} />
      )}
    </div>
  );
};
