/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetricDefinition, StationInfo } from '../types/waterQuality';

export const SIMULATION_DISCLAIMER_TEXT = 
  "본 화면의 수치는 가상 시뮬레이터가 생성한 교육·시연용 데이터이며 실제 센서나 공공기관의 공식 경보와 무관합니다.";

export const STATIONS: StationInfo[] = [
  {
    id: 'SIM-RIVER-01',
    name: '가상 하천 지점 A (상류 농경지 인근)',
    region: '가상 평야 유역',
    description: '집중 농경지 배수로 인근으로 강우 시 비료 및 토양 유출 영향이 가장 빠르게 반영되는 모의 지점입니다.',
    catchmentCharacteristics: '답작·전작 혼합 농경지 (경사도 4%)',
    baselineNitrate: 2.2,
    baselinePhosphate: 0.08,
    baselineDO: 8.2,
  },
  {
    id: 'SIM-RIVER-02',
    name: '가상 하천 지점 B (중류 지류 합류부)',
    region: '가상 복합 유역',
    description: '농업 배수와 자연 소하천이 합류하여 희석 및 확산 양상을 관찰하기 위한 모의 관측 지점입니다.',
    catchmentCharacteristics: '지류 합류구역 및 습지 완충대',
    baselineNitrate: 1.8,
    baselinePhosphate: 0.05,
    baselineDO: 7.9,
  },
  {
    id: 'SIM-RIVER-03',
    name: '가상 하천 지점 C (하류 수변 생태보호구역)',
    region: '가상 하류 유역',
    description: '하류 유수지로 장기적인 영양염류 누적 및 조류 번식, 용존산소 저하 위험을 관찰하는 모의 지점입니다.',
    catchmentCharacteristics: '유속 완만 구역 및 친수 생태공원',
    baselineNitrate: 1.5,
    baselinePhosphate: 0.04,
    baselineDO: 7.5,
  },
];

export const METRIC_DEFINITIONS: Record<string, MetricDefinition> = {
  nitrateMgL: {
    key: 'nitrateMgL',
    label: '질산염',
    chemicalSymbol: 'NO₃⁻',
    unit: 'mg/L',
    precision: 2,
    description: '물속 질산염 농도. 농경지 질소비료 유출 시 상승할 수 있는 대표적 영양염류 지표입니다.',
    cautionThreshold: 4.5, // 교육용 주의 기준
    dangerThreshold: 8.0,  // 교육용 위험 기준
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '질산염(NO₃⁻) 농도와 질산성 질소(NO₃-N) 농도는 화학종이 다릅니다. (1 mg NO₃-N/L ≈ 4.43 mg NO₃⁻/L)'
  },
  phosphateMgL: {
    key: 'phosphateMgL',
    label: '인산염',
    chemicalSymbol: 'PO₄³⁻',
    unit: 'mg/L',
    precision: 3,
    description: '물속 인산염 농도. 하천 부영양화와 녹조 증식을 촉진하는 주요 제한 영양소 지표입니다.',
    cautionThreshold: 0.15,
    dangerThreshold: 0.35,
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '인산염(PO₄³⁻)과 인산염-인(PO₄-P)은 구분되어야 합니다. (1 mg PO₄-P/L ≈ 3.06 mg PO₄³⁻/L)'
  },
  dissolvedOxygenMgL: {
    key: 'dissolvedOxygenMgL',
    label: '용존산소 (DO)',
    chemicalSymbol: 'DO',
    unit: 'mg/L',
    precision: 2,
    description: '물에 녹아있는 산소의 양. 영양염류 유입 후 미생물 분해나 조류 사멸 시 급격히 저하될 수 있습니다.',
    cautionThreshold: 6.0,
    dangerThreshold: 4.0,
    direction: 'lower_is_worse',
    chemicalDistinctionNote: '수온이 높을수록 산소 용해도가 낮아지며, 주야간 광합성 주기에 따라서도 변동합니다.'
  },
  turbidityNTU: {
    key: 'turbidityNTU',
    label: '탁도',
    chemicalSymbol: 'Turbidity',
    unit: 'NTU',
    precision: 1,
    description: '물의 흐림 정도. 강우 시 표토 및 퇴비 등 부유물질 유출 시 급증합니다.',
    cautionThreshold: 15.0,
    dangerThreshold: 35.0,
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '영양염류 농도를 직접 측정하는 것은 아니며, 토양 침식 및 부유 입자의 간접 지표입니다.'
  },
  waterTemperatureC: {
    key: 'waterTemperatureC',
    label: '수온',
    chemicalSymbol: 'Temp',
    unit: '°C',
    precision: 1,
    description: '하천의 온도. 조류 증식 속도와 기체의 용해도(DO)에 중대한 영향을 미칩니다.',
    cautionThreshold: 24.0,
    dangerThreshold: 28.0,
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '자연적 계절·일주기 변화가 주원인이며 영양염류 분해 반응 속도를 촉진합니다.'
  },
  pH: {
    key: 'pH',
    label: '수소이온농도',
    chemicalSymbol: 'pH',
    unit: '',
    precision: 2,
    description: '물의 산성·중성·알칼리성 정도. 급격한 변화 시 수생태계에 악영향을 미칩니다.',
    cautionThreshold: 8.3,
    dangerThreshold: 8.8,
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '농업 비료 유출의 단독 직접 증거는 아니며, 조류 광합성 활성화 시 pH가 상승할 수 있습니다.'
  },
  rainfallMmPerHour: {
    key: 'rainfallMmPerHour',
    label: '가상 강우량',
    chemicalSymbol: 'Rain',
    unit: 'mm/h',
    precision: 1,
    description: '유역 내 시간당 모의 강우 강도. 농경지 비료 성분의 표면 유출 및 하천 유입의 주 추진력입니다.',
    cautionThreshold: 15.0,
    dangerThreshold: 30.0,
    direction: 'higher_is_worse',
    chemicalDistinctionNote: '시간당 강우량(mm/h) 기준이며 실제 지형 및 토양 수분 상태에 따라 유출률이 달라집니다.'
  }
};
