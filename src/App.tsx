/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  WaterQualityDataPoint, 
  StationInfo, 
  SimulationParameters 
} from './types/waterQuality';
import { STATIONS } from './constants/thresholds';
import { generateInitialHistory, generateNextPoint } from './services/dataGenerator';
import { evaluateWaterQualityRisk } from './services/riskEvaluator';
import { NoticeBanner } from './components/NoticeBanner';
import { Navbar, NavTab } from './components/Navbar';
import { ResultsAndSolutionPage } from './components/ResultsAndSolutionPage';
import { Detailed3DPage } from './components/Detailed3DPage';
import { BufferZoneGuidePage } from './components/BufferZoneGuidePage';

export default function App() {
  const [currentStation, setCurrentStation] = useState<StationInfo>(STATIONS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('simulation3d');
  const [selectedMetricKey, setSelectedMetricKey] = useState<string>('nitrateMgL');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [intervalSeconds, setIntervalSeconds] = useState<number>(3);

  // Simulation parameters
  const [simParams, setSimParams] = useState<SimulationParameters>({
    rainfallMmPerHour: 2.0,
    fertilizerIntensity: 'normal',
    vegetatedBufferActive: false,
    smartFertilizerActive: false,
  });

  // Data history state
  const [dataPoints, setDataPoints] = useState<WaterQualityDataPoint[]>(() => 
    generateInitialHistory(STATIONS[0], 30, 3)
  );

  const simParamsRef = useRef(simParams);
  useEffect(() => {
    simParamsRef.current = simParams;
  }, [simParams]);

  const currentStationRef = useRef(currentStation);
  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  // Tick generator
  const stepForward = useCallback(() => {
    setDataPoints((prev) => {
      if (prev.length === 0) return generateInitialHistory(currentStationRef.current, 30, 3);
      const last = prev[prev.length - 1];
      const next = generateNextPoint(last, currentStationRef.current, simParamsRef.current);
      const nextPoints = [...prev.slice(-59), next];
      return nextPoints;
    });
  }, []);

  // Realtime loop
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      stepForward();
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [isRunning, intervalSeconds, stepForward]);

  // Station switch
  const handleSelectStation = (station: StationInfo) => {
    setCurrentStation(station);
    setDataPoints(generateInitialHistory(station, 30, intervalSeconds));
  };

  const updateSimParams = (partial: Partial<SimulationParameters>) => {
    setSimParams((prev) => ({ ...prev, ...partial }));
  };

  const lastPoint = dataPoints[dataPoints.length - 1] || generateInitialHistory(currentStation, 1, 1)[0];
  const previousPoint = dataPoints.length >= 2 ? dataPoints[dataPoints.length - 2] : undefined;
  const riskEvaluation = evaluateWaterQualityRisk(lastPoint);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. Mandatory Simulated Warning Banner */}
      <NoticeBanner />

      {/* 2. Top Bar Navigation (3 Tabs: Results & Solutions / 3D Simulation / Buffer Zone Guide) */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRunning={isRunning}
        onToggleRun={() => setIsRunning((prev) => !prev)}
      />

      {/* 3. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulation3d' && (
          <Detailed3DPage
            currentStation={currentStation}
            onSelectStation={handleSelectStation}
            dataPoints={dataPoints}
            lastPoint={lastPoint}
            previousPoint={previousPoint}
            riskEvaluation={riskEvaluation}
            selectedMetricKey={selectedMetricKey}
            onSelectMetric={setSelectedMetricKey}
            simParams={simParams}
            onUpdateSimParams={updateSimParams}
          />
        )}

        {activeTab === 'results' && (
          <ResultsAndSolutionPage
            currentStation={currentStation}
            onSelectStation={handleSelectStation}
            dataPoint={lastPoint}
            riskEvaluation={riskEvaluation}
            simParams={simParams}
            onUpdateSimParams={updateSimParams}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning((prev) => !prev)}
          />
        )}

        {activeTab === 'bufferzone' && (
          <BufferZoneGuidePage onNavigateToSimulation={() => setActiveTab('simulation3d')} />
        )}
      </main>

      {/* 4. Quiet Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-800">물지킴이 AI (AquaShield AI)</span>
            <span className="mx-2">·</span>
            <span>농업용 비료 유출 위험 모니터링 및 수질 대응 웹앱</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>ENGINE: SIMULATED_STREAM_V1</span>
            <span>·</span>
            <span>교육 및 시연용 프로토타입</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
