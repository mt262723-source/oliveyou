/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataType = 'SIMULATED' | 'REAL_OBSERVED' | 'PROJECTED';

export type RiskLevel = 'normal' | 'caution' | 'danger';

export interface WaterQualityDataPoint {
  timestamp: string; // ISO-8601
  stationId: string;
  stationName: string;
  dataType: DataType;
  nitrateMgL: number;        // 질산염 (NO3-) mg/L
  phosphateMgL: number;      // 인산염 (PO4) mg/L
  dissolvedOxygenMgL: number;// 용존산소 (DO) mg/L
  turbidityNTU: number;      // 탁도 NTU
  waterTemperatureC: number; // 수온 °C
  pH: number;                // 수소이온농도
  rainfallMmPerHour: number; // 강우량 mm/h
}

export interface StationInfo {
  id: string;
  name: string;
  region: string;
  description: string;
  catchmentCharacteristics: string;
  baselineNitrate: number;
  baselinePhosphate: number;
  baselineDO: number;
}

export interface MetricDefinition {
  key: keyof Omit<WaterQualityDataPoint, 'timestamp' | 'stationId' | 'stationName' | 'dataType'>;
  label: string;
  chemicalSymbol: string;
  unit: string;
  precision: number;
  description: string;
  cautionThreshold: number; // 시연용 주의 기준치
  dangerThreshold: number;  // 시연용 위험 기준치
  direction: 'higher_is_worse' | 'lower_is_worse';
  chemicalDistinctionNote: string;
}

export interface ActionItem {
  id: string;
  stage: '즉시 대응 (0~24h)' | '단기 조치 (1~7일)' | '중장기 구조 개선';
  actor: '농업인' | '지자체/수자원' | '환경감시' | '농업인/지자체';
  action: string;
  detail: string;
  effectMechanism: string; // 과학적 정화 메커니즘
}

export interface TailoredSolution {
  solutionId: string;
  title: string;
  urgency: 'critical' | 'moderate' | 'stable';
  urgencyLabel: string;
  diagnosticPattern: string; // 현재 측정 수치에 따른 진단 패턴명
  evidenceText: string;      // 현재 수질 지표의 구체적 근거
  actions: ActionItem[];
  recommendedSimParams: Partial<SimulationParameters>;
  expectedOutcome: string;
}

export interface RiskEvaluationResult {
  overallLevel: RiskLevel;
  levelLabel: string;
  summary: string;
  primaryRiskFactors: string[];
  explanation: string;
  tailoredSolution: TailoredSolution;
  disclaimer: string;
}

export interface SimulationParameters {
  rainfallMmPerHour: number;
  fertilizerIntensity: 'low' | 'normal' | 'high';
  vegetatedBufferActive: boolean;
  smartFertilizerActive: boolean;
}

export interface ScenarioPoint {
  timeStep: number;
  label: string;
  baselineNitrate: number;
  simulatedNitrate: number;
  baselinePhosphate: number;
  simulatedPhosphate: number;
  simulatedDO: number;
  simulatedTurbidity: number;
}
