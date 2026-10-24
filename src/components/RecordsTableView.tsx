/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Filter, BookOpen, Search } from 'lucide-react';
import { WaterQualityDataPoint } from '../types/waterQuality';
import { METRIC_DEFINITIONS } from '../constants/thresholds';

interface RecordsTableViewProps {
  dataPoints: WaterQualityDataPoint[];
}

export const RecordsTableView: React.FC<RecordsTableViewProps> = ({ dataPoints }) => {
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Reverse so newest is at the top
  const sortedPoints = [...dataPoints].reverse();

  const filteredPoints = sortedPoints.filter((point) => {
    if (filterRiskOnly) {
      const isRisky =
        point.nitrateMgL >= METRIC_DEFINITIONS.nitrateMgL.cautionThreshold ||
        point.phosphateMgL >= METRIC_DEFINITIONS.phosphateMgL.cautionThreshold ||
        point.dissolvedOxygenMgL <= METRIC_DEFINITIONS.dissolvedOxygenMgL.cautionThreshold;
      if (!isRisky) return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        point.stationName.toLowerCase().includes(term) ||
        point.timestamp.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleDownloadCsv = () => {
    const headers = [
      'Timestamp (ISO-8601)',
      'Station ID',
      'Station Name',
      'Data Type',
      'Nitrate (NO3- mg/L)',
      'Phosphate (PO4 3- mg/L)',
      'Dissolved Oxygen (DO mg/L)',
      'Turbidity (NTU)',
      'Water Temp (deg C)',
      'pH',
      'Rainfall (mm/h)',
    ];

    const rows = sortedPoints.map((p) => [
      p.timestamp,
      p.stationId,
      `"${p.stationName}"`,
      p.dataType,
      p.nitrateMgL,
      p.phosphateMgL,
      p.dissolvedOxygenMgL,
      p.turbidityNTU,
      p.waterTemperatureC,
      p.pH,
      p.rainfallMmPerHour,
    ]);

    const disclaimerComment =
      '# DISCLAIMER: This data is 100% synthetically generated for educational/demonstration purposes (SIMULATED). No real sensor connection.\n';

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      disclaimerComment +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `water_quality_simulated_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Chemical Species & Unit Reference Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-cyan-700" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            수질 화학종 구분 및 단위 해석 가이드 (PRD 기준)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border border-slate-100">
            <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">측정 항목</th>
                <th className="py-2.5 px-3">본 앱 표시 단위</th>
                <th className="py-2.5 px-3">주의할 화학종 구분</th>
                <th className="py-2.5 px-3">환산 관계 및 생태적 의미</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">질산염 (Nitrate)</td>
                <td className="py-2 px-3 font-mono">mg/L (as NO₃⁻)</td>
                <td className="py-2 px-3 text-amber-800 font-medium">질산염(NO₃⁻) vs 질산성 질소(NO₃-N)</td>
                <td className="py-2 px-3">
                  공공 수질기준은 질소 원자 질량 기준인 <strong className="font-mono">NO₃-N</strong>을 주로 사용합니다. (1 mg NO₃-N/L ≈ 4.43 mg NO₃⁻/L)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">인산염 (Phosphate)</td>
                <td className="py-2 px-3 font-mono">mg/L (as PO₄³⁻)</td>
                <td className="py-2 px-3 text-amber-800 font-medium">인산염(PO₄³⁻) vs 인산염-인(PO₄-P)</td>
                <td className="py-2 px-3">
                  수계 부영양화 총인(T-P) 기준 비교 시 <strong className="font-mono">PO₄-P</strong>와의 분자량 차이를 감안해야 합니다. (1 mg PO₄-P/L ≈ 3.06 mg PO₄³⁻/L)
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">용존산소 (DO)</td>
                <td className="py-2 px-3 font-mono">mg/L</td>
                <td className="py-2 px-3">수온 및 포화도 상관관계</td>
                <td className="py-2 px-3">
                  수온이 상승하면 기체 용해도가 감소하여 DO 기본값이 낮아집니다. 영양염류 급증 후 호기성 미생물 분해 시 고갈 위험이 커집니다.
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-slate-900">탁도 (Turbidity)</td>
                <td className="py-2 px-3 font-mono">NTU</td>
                <td className="py-2 px-3">토양 침식 간접 지표</td>
                <td className="py-2 px-3">
                  영양염류 자체의 농도가 아니며, 강우 시 농경지 표토 유출 및 유기물질 부유 정도를 신속히 파악하는 대리지표입니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="측정소명 또는 시각 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-cyan-600 w-52"
            />
          </div>

          {/* Filter button */}
          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              filterRiskOnly
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>주의·위험 수치만 보기</span>
          </button>

          <span className="text-xs text-slate-500 font-mono">
            총 {filteredPoints.length}건 / 세션 보관 {dataPoints.length}건
          </span>
        </div>

        {/* CSV Download Button */}
        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>가상 데이터 CSV 다운로드</span>
        </button>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[520px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3 font-mono">기록 시각</th>
                <th className="py-2.5 px-3">관측 지점</th>
                <th className="py-2.5 px-3 font-mono">유형</th>
                <th className="py-2.5 px-3 font-mono text-right">질산염 (mg/L)</th>
                <th className="py-2.5 px-3 font-mono text-right">인산염 (mg/L)</th>
                <th className="py-2.5 px-3 font-mono text-right">용존산소 (mg/L)</th>
                <th className="py-2.5 px-3 font-mono text-right">탁도 (NTU)</th>
                <th className="py-2.5 px-3 font-mono text-right">수온 (°C)</th>
                <th className="py-2.5 px-3 font-mono text-right">pH</th>
                <th className="py-2.5 px-3 font-mono text-right">강우량 (mm/h)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
              {filteredPoints.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
                    일치하는 데이터 포인트가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredPoints.map((p, idx) => {
                  const isNitrateHigh = p.nitrateMgL >= METRIC_DEFINITIONS.nitrateMgL.cautionThreshold;
                  const isPhosHigh = p.phosphateMgL >= METRIC_DEFINITIONS.phosphateMgL.cautionThreshold;
                  const isDoLow = p.dissolvedOxygenMgL <= METRIC_DEFINITIONS.dissolvedOxygenMgL.cautionThreshold;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {new Date(p.timestamp).toLocaleTimeString('ko-KR', { hour12: false })}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-800 whitespace-nowrap">
                        {p.stationName}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-cyan-800">
                        {p.dataType}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${isNitrateHigh ? 'text-amber-700 font-bold' : ''}`}>
                        {p.nitrateMgL.toFixed(2)}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${isPhosHigh ? 'text-amber-700 font-bold' : ''}`}>
                        {p.phosphateMgL.toFixed(3)}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${isDoLow ? 'text-rose-700 font-bold' : ''}`}>
                        {p.dissolvedOxygenMgL.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {p.turbidityNTU.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {p.waterTemperatureC.toFixed(1)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {p.pH.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {p.rainfallMmPerHour.toFixed(1)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
