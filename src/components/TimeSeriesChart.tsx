/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useId } from 'react';
import { WaterQualityDataPoint, MetricDefinition } from '../types/waterQuality';
import { METRIC_DEFINITIONS } from '../constants/thresholds';

interface TimeSeriesChartProps {
  data: WaterQualityDataPoint[];
  selectedMetricKey: string;
  onSelectMetric: (key: string) => void;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  selectedMetricKey,
  onSelectMetric,
}) => {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [windowSize, setWindowSize] = useState<number>(30);

  const metricDef = METRIC_DEFINITIONS[selectedMetricKey] || METRIC_DEFINITIONS.nitrateMgL;
  const displayData = data.slice(-windowSize);

  if (displayData.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
        표시할 가상 수질 데이터 포인트가 없습니다.
      </div>
    );
  }

  // Extract values
  const values = displayData.map((d) => (d as any)[selectedMetricKey] as number);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  // Buffer range so lines don't clip at top/bottom
  const padding = (rawMax - rawMin) * 0.2 || 0.5;
  const minY = Math.max(0, rawMin - padding);
  const maxY = Math.max(metricDef.dangerThreshold * 1.1, rawMax + padding);

  // SVG viewBox geometry
  const width = 800;
  const height = 280;
  const padLeft = 55;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (index: number) => {
    if (displayData.length <= 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (displayData.length - 1)) * plotWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padTop + plotHeight - ((clamped - minY) / (maxY - minY)) * plotHeight;
  };

  // Build path
  const points = displayData.map((_, i) => `${getX(i)},${getY(values[i])}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(displayData.length - 1)},${padTop + plotHeight} L ${padLeft},${padTop + plotHeight} Z`;

  // Threshold Y positions
  const cautionY = getY(metricDef.cautionThreshold);
  const dangerY = getY(metricDef.dangerThreshold);

  // Y-axis tick values (4 steps)
  const yTicks = [
    minY,
    minY + (maxY - minY) * 0.33,
    minY + (maxY - minY) * 0.66,
    maxY,
  ];

  const activePoint = hoverIndex !== null && displayData[hoverIndex] ? displayData[hoverIndex] : displayData[displayData.length - 1];
  const activeValue = activePoint ? (activePoint as any)[selectedMetricKey] as number : 0;
  const activeTime = activePoint ? new Date(activePoint.timestamp).toLocaleTimeString('ko-KR', { hour12: false }) : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {metricDef.label} 시계열 변화 추세
            </h2>
            <span className="text-xs font-mono text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-sm">
              SIMULATED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            가상 시뮬레이션 데이터 포인트 기준 (실제 하천 측정치 아님)
          </p>
        </div>

        {/* Controls: Window Size & Metric Quick Switch */}
        <div className="flex items-center gap-2">
          {/* Metric Selector */}
          <select
            value={selectedMetricKey}
            onChange={(e) => onSelectMetric(e.target.value)}
            className="text-xs font-medium border border-slate-200 bg-slate-50 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-cyan-600"
          >
            {Object.values(METRIC_DEFINITIONS).map((def) => (
              <option key={def.key} value={def.key}>
                {def.label} ({def.chemicalSymbol})
              </option>
            ))}
          </select>

          {/* Window size buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-mono">
            {[20, 30, 60].map((size) => (
              <button
                key={size}
                onClick={() => setWindowSize(size)}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  windowSize === size
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {size}개
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Plot Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const svgX = ((e.clientX - rect.left) / rect.width) * width;
            if (svgX < padLeft || svgX > padLeft + plotWidth) {
              setHoverIndex(null);
              return;
            }
            const ratio = (svgX - padLeft) / plotWidth;
            const idx = Math.round(ratio * (displayData.length - 1));
            setHoverIndex(Math.max(0, Math.min(displayData.length - 1, idx)));
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines & Y Labels */}
          {yTicks.map((val, idx) => {
            const y = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotWidth}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val.toFixed(metricDef.precision > 1 ? 2 : 1)}
                </text>
              </g>
            );
          })}

          {/* Caution Threshold Reference Line */}
          {cautionY >= padTop && cautionY <= padTop + plotHeight && (
            <g>
              <line
                x1={padLeft}
                y1={cautionY}
                x2={padLeft + plotWidth}
                y2={cautionY}
                stroke="#d97706"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={padLeft + plotWidth}
                y={cautionY - 4}
                textAnchor="end"
                className="text-[9px] fill-amber-700 font-mono font-medium"
              >
                주의 기준 ({metricDef.cautionThreshold} {metricDef.unit})
              </text>
            </g>
          )}

          {/* Danger Threshold Reference Line */}
          {dangerY >= padTop && dangerY <= padTop + plotHeight && (
            <g>
              <line
                x1={padLeft}
                y1={dangerY}
                x2={padLeft + plotWidth}
                y2={dangerY}
                stroke="#e11d48"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <text
                x={padLeft + plotWidth}
                y={dangerY - 4}
                textAnchor="end"
                className="text-[9px] fill-rose-700 font-mono font-medium"
              >
                위험 기준 ({metricDef.dangerThreshold} {metricDef.unit})
              </text>
            </g>
          )}

          {/* Gradient Fill under Curve */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Primary Trend Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0891b2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crosshair probe */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={padTop + plotHeight}
                stroke="#0e7490"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(values[hoverIndex])}
                r="4.5"
                fill="#ffffff"
                stroke="#0891b2"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          {displayData.map((d, i) => {
            // Show label for first, middle, last points
            if (i === 0 || i === Math.floor(displayData.length / 2) || i === displayData.length - 1) {
              const t = new Date(d.timestamp).toLocaleTimeString('ko-KR', { hour12: false });
              return (
                <text
                  key={i}
                  x={getX(i)}
                  y={padTop + plotHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {t}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Active Point Monospace Readout Overlay */}
        <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>
              선택 시각: <strong className="text-slate-800">{activeTime}</strong>
            </span>
            <span>·</span>
            <span>
              {metricDef.label} 농도:{' '}
              <strong className="text-cyan-800 text-sm">
                {activeValue.toFixed(metricDef.precision)} {metricDef.unit}
              </strong>
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            마우스 호버 시 특정 시각 측정치 확인 가능
          </div>
        </div>
      </div>
    </div>
  );
};
