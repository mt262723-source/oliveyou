/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  RiskEvaluationResult, 
  RiskLevel, 
  WaterQualityDataPoint, 
  TailoredSolution, 
  ActionItem 
} from '../types/waterQuality';
import { METRIC_DEFINITIONS } from '../constants/thresholds';

/**
 * Generates an intelligent, state-specific tailored solution based on the exact
 * combination of current water quality metrics, rainfall, and environmental conditions.
 */
function deriveTailoredSolution(point: WaterQualityDataPoint): TailoredSolution {
  const n = point.nitrateMgL;
  const p = point.phosphateMgL;
  const doVal = point.dissolvedOxygenMgL;
  const turb = point.turbidityNTU;
  const rain = point.rainfallMmPerHour;
  const temp = point.waterTemperatureC;

  const nDef = METRIC_DEFINITIONS.nitrateMgL;
  const pDef = METRIC_DEFINITIONS.phosphateMgL;
  const doDef = METRIC_DEFINITIONS.dissolvedOxygenMgL;
  const turbDef = METRIC_DEFINITIONS.turbidityNTU;

  // Case 1: Severe Hypoxia (DO depletion crisis)
  if (doVal <= doDef.cautionThreshold) {
    const isCritical = doVal <= doDef.dangerThreshold;
    return {
      solutionId: 'SOL-HYPOXIA',
      title: '하천 수중 용존산소(DO) 긴급 회복 및 생태계 보호 솔루션',
      urgency: isCritical ? 'critical' : 'moderate',
      urgencyLabel: isCritical ? '긴급 조치 (위험 저산소증)' : '주의 조치 (산소 저하)',
      diagnosticPattern: '유기물 분해 및 조류 사멸에 의한 수중 저산소증(Hypoxia) 패턴',
      evidenceText: `현재 용존산소(DO)가 ${doVal} mg/L로 ${isCritical ? '위험 기준(4.0mg/L 이하)' : '주의 기준(6.0mg/L 이하)'}에 도달했습니다. 수온(${temp}°C)과 영양염류(N: ${n}mg/L, P: ${p}mg/L)의 영향으로 수중 산소 소비가 급증한 상태입니다.`,
      actions: [
        {
          id: 'act-1',
          stage: '즉시 대응 (0~24h)',
          actor: '지자체/수자원',
          action: '하천 이동식 폭기 장치(Aerator) 가동 및 여울 수문 개방',
          detail: '정체 수역에 미세 기포 발생장치를 투입하여 공기 중 산소를 강제 용해시키고, 보/수문을 조작하여 인위적 포기 낙차를 형성합니다.',
          effectMechanism: '물-공기 접촉 면적을 급증시켜 물리적 산소 재폭기(Re-aeration) 유도'
        },
        {
          id: 'act-2',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '인근 농경지 고농도 배수 방류 전면 중단 및 둠벙 저류',
          detail: '배수 밸브를 닫아 영양염류와 유기물이 하천으로 추가 방류되는 것을 차단하고 농업용 둠벙에 가둡니다.',
          effectMechanism: '하천 내 생화학적 산소요구량(BOD/COD) 추가 부하 즉각 차단'
        },
        {
          id: 'act-3',
          stage: '단기 조치 (1~7일)',
          actor: '지자체/수자원',
          action: '상류 저수지 청정 하천유지용수 긴급 방류 (희석수 방류)',
          detail: '농어촌공사 저수지 비상 방류수를 확보하여 정체 구간의 고온·빈산소 수괴를 물리적으로 밀어내고 희석합니다.',
          effectMechanism: '수량 증대를 통한 하천 체류시간 단축 및 수온 강하'
        },
        {
          id: 'act-4',
          stage: '중장기 구조 개선',
          actor: '지자체/수자원',
          action: '자연형 여울(Riffle) 및 소(Pool) 복원 공법 도입',
          detail: '하천 바닥에 자연석 여울을 연속 배치하여 유속 변화와 자연 폭기가 상시 이루어지도록 생태 하천을 복원합니다.',
          effectMechanism: '무동력 지속가능 자연 정화 및 수생생물 피난처 확보'
        }
      ],
      recommendedSimParams: {
        fertilizerIntensity: 'low',
        vegetatedBufferActive: true,
        smartFertilizerActive: true,
      },
      expectedOutcome: '폭기 장치 및 유출 차단 시뮬레이션 적용 시 DO가 약 1.8~2.5 mg/L 회복되는 경향을 관찰할 수 있습니다.'
    };
  }

  // Case 2: Rain-Driven Nitrate Leaching
  if (n >= nDef.cautionThreshold && rain >= 8) {
    const isCritical = n >= nDef.dangerThreshold;
    return {
      solutionId: 'SOL-NITRATE-RAIN',
      title: '강우 동반 질산염(NO₃⁻) 침출 긴급 방지 솔루션',
      urgency: isCritical ? 'critical' : 'moderate',
      urgencyLabel: isCritical ? '긴급 조치 (질산염 위험)' : '주의 조치 (강우 질소 유출)',
      diagnosticPattern: '강우 추진력에 의한 가용성 질산태 질소 급속 용탈·침출 패턴',
      evidenceText: `강우 강도 ${rain} mm/h 조건에서 질산염이 ${n} mg/L로 ${isCritical ? '위험 기준(8.0mg/L 이상)' : '주의 기준(4.5mg/L 이상)'}에 도달했습니다. 토양 입자에 흡착되지 않는 질산염(NO₃⁻)의 음이온 특성상 빗물과 함께 대량 유출되고 있습니다.`,
      actions: [
        {
          id: 'act-1',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '질소계 화학비료(요소, 유안) 살포 즉시 전면 중단',
          detail: '강우 중 또는 강우 직후 추가 시비를 일체 금지하고, 빗물이 고인 포장에 비료를 뿌리지 않습니다.',
          effectMechanism: '토양 표면 용해성 질산염의 추가 공급원 원천 차단'
        },
        {
          id: 'act-2',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '논물꼬 10cm 상향 조절로 빗물 포장 내 체류 유도',
          detail: '배수 물꼬를 높여 빗물을 논에 일시 저류시킴으로써 하천으로의 순간 최대 유출 첨두량을 분산시킵니다.',
          effectMechanism: '천연 저류지 역할을 통한 유출 첨두 부하 40% 이상 저감'
        },
        {
          id: 'act-3',
          stage: '단기 조치 (1~7일)',
          actor: '농업인',
          action: '완효성 코팅비료(SRF) 및 분할 시비 계획으로 전환',
          detail: '다음 시비 시 1회 전량 살포 대신 작물 생육 단계별로 3회 이상 나누어 살포하는 처방을 적용합니다.',
          effectMechanism: '작물 흡수율 증대 및 토양 용탈 손실률 50% 억제'
        },
        {
          id: 'act-4',
          stage: '중장기 구조 개선',
          actor: '농업인/지자체',
          action: '지하수 탈질 목본 식생 완충대(Riparian Buffer) 조성',
          detail: '하천 제방 인접부에 버드나무·오리나무 등 심근성 목본대를 조성하여 혐기성 토양층에서 탈질 박테리아 활성을 극대화합니다.',
          effectMechanism: 'NO₃⁻를 무해한 질소가스(N₂)로 환원 기화시키는 생물학적 탈질 유도'
        }
      ],
      recommendedSimParams: {
        fertilizerIntensity: 'low',
        vegetatedBufferActive: true,
        smartFertilizerActive: true,
      },
      expectedOutcome: '완충대와 분할 시비 적용 시 질산염 하천 유입 피크 농도가 약 35~45% 감쇄되는 시나리오가 구현됩니다.'
    };
  }

  // Case 3: High Phosphate & Turbidity (Surface Soil Erosion & Phosphorus Runoff)
  if (p >= pDef.cautionThreshold && (turb >= 12 || rain >= 12)) {
    const isCritical = p >= pDef.dangerThreshold;
    return {
      solutionId: 'SOL-PHOSPHATE-EROSION',
      title: '토양 침식 방지 및 미립자 인(PO₄³⁻) 흡착 급속 차단 솔루션',
      urgency: isCritical ? 'critical' : 'moderate',
      urgencyLabel: isCritical ? '긴급 조치 (인산염·탁도 위험)' : '주의 조치 (토양 인 유출)',
      diagnosticPattern: '표토 침식에 의한 토양 흡착성 인(Particulate Phosphorus) 유출 패턴',
      evidenceText: `인산염 농도가 ${p} mg/L, 탁도가 ${turb} NTU로 토양 입자 및 미세 부유물과 함께 인 성분이 하천으로 유입되고 있습니다. 인은 조류 번식의 핵심 제한 영양소이므로 녹조 예방이 시급합니다.`,
      actions: [
        {
          id: 'act-1',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '농경지 말단 배수로에 볏짚 베일 및 모래주머니 임시 침사턱 설치',
          detail: '유출 경로에 볏짚과 차광막을 이용한 간이 침전 필터를 세워 표토 흙탕물의 직방류를 여과합니다.',
          effectMechanism: '유속 감쇄를 통한 조립질 부유 토사 및 흡착 인의 70% 물리적 침전'
        },
        {
          id: 'act-2',
          stage: '즉시 대응 (0~24h)',
          actor: '지자체/수자원',
          action: '하천 침사지(Sediment Trap) 수문 가동 및 슬러지 유출 차단',
          detail: '소하천 유입 전단 침사지를 가동하여 인 흡착 침전물이 본류로 확산되지 않도록 통제합니다.',
          effectMechanism: '하천 본류 저질 퇴적 및 2차 인 용출 방지'
        },
        {
          id: 'act-3',
          stage: '단기 조치 (1~7일)',
          actor: '농업인',
          action: '인산질 비료 표면 살포 중단 및 토양 혼화 심층 시비',
          detail: '지표면에 흩어뿌리는 시비를 금지하고 로터리 작업 시 10~15cm 깊이로 토양과 균일하게 섞어줍니다.',
          effectMechanism: '표면 우수 유출 시 빗물과의 직접 접촉 차단'
        },
        {
          id: 'act-4',
          stage: '중장기 구조 개선',
          actor: '농업인',
          action: '동계 피복작물(호밀, 헤어리베치) 재배 및 초본 완충대 설치',
          detail: '휴경기에 토양이 나지 상태로 방치되지 않도록 피복작물을 식재하여 강우 타격 에너지를 분산시킵니다.',
          effectMechanism: '토양 침식량 80% 이상 저감 및 유기물 환원'
        }
      ],
      recommendedSimParams: {
        vegetatedBufferActive: true,
        fertilizerIntensity: 'normal',
        smartFertilizerActive: true,
      },
      expectedOutcome: '식생 완충대 가동 시 탁도 및 인산염 수치가 초기 상승 후 빠르게 안정화 곡선을 그립니다.'
    };
  }

  // Case 4: Dry Weather High Nutrients (Effluent / Livestock / Groundwater baseflow)
  if ((n >= nDef.cautionThreshold || p >= pDef.cautionThreshold) && rain < 5) {
    return {
      solutionId: 'SOL-DRY-WEATHER',
      title: '비강우기 농업 배수 순환 관개 및 복합 오염원 전수 점검 솔루션',
      urgency: 'moderate',
      urgencyLabel: '주의 조치 (무강우 영양염류 유입)',
      diagnosticPattern: '비강우 상태에서의 관개 퇴수 또는 비농업 복합 오염원(축산/생활하수) 유입 패턴',
      evidenceText: `현재 강우량이 ${rain} mm/h로 거의 없음에도 질산염(${n} mg/L) 또는 인산염(${p} mg/L)이 높게 유지되고 있습니다. 이는 빗물 유출보다는 관개 퇴수의 고농도 지속 유출 또는 주변 축사·정화조 등 복합 오염원 영향을 시사합니다.`,
      actions: [
        {
          id: 'act-1',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '농업용 퇴수 배출 중단 및 둠벙 연계 순환 관개 전환',
          detail: '배출수를 하천으로 흘려보내지 않고 하류 둠벙에 모아 상류 포장으로 재양수하여 양분을 작물이 재흡수하도록 유도합니다.',
          effectMechanism: '하천 영양염류 배출 제로화 및 수자원 재이용'
        },
        {
          id: 'act-2',
          stage: '즉시 대응 (0~24h)',
          actor: '환경감시',
          action: '상류 축산 분뇨 야적장 및 정화조 방류수 긴급 현장 점검',
          detail: '비료 외 잠재 오염원인 축사 퇴비사 차수막 훼손, 생활하수 무단 연결관로를 감시단과 합동 점검합니다.',
          effectMechanism: '농업 외 비점/점오염원 혼재 여부 규명'
        },
        {
          id: 'act-3',
          stage: '단기 조치 (1~7일)',
          actor: '농업인',
          action: '흙토람 토양 비옥도 재검정 및 잔류 질소 처방전 발급',
          detail: '농업기술센터에 의뢰하여 토양 내 잔류 질산태질소 검정을 실시하고 잔여 양분만큼 시비량을 즉시 감축합니다.',
          effectMechanism: '토양 내 과잉 염류 축적 억제 및 비료 비용 절감'
        },
        {
          id: 'act-4',
          stage: '중장기 구조 개선',
          actor: '지자체/수자원',
          action: '소규모 농촌 마을 하수도 및 인공습지 연계 처리장치 구축',
          detail: '농업용 배수로 말단에 갈대 습지를 통과한 후 하천에 유입되는 생태 순환형 수질정화 시스템을 완공합니다.',
          effectMechanism: '상시 유입되는 질소·인 잔류 부하의 생물학적 고정'
        }
      ],
      recommendedSimParams: {
        smartFertilizerActive: true,
        fertilizerIntensity: 'low',
        vegetatedBufferActive: true,
      },
      expectedOutcome: '스마트 시비 관리와 완충녹지 동시 적용 시 기저 유출 농도가 기준선으로 수렴합니다.'
    };
  }

  // Case 5: Rain Incoming / Rising (Precautionary Action)
  if (rain >= 10 && n < nDef.cautionThreshold && p < pDef.cautionThreshold) {
    return {
      solutionId: 'SOL-PREVENTIVE-STORM',
      title: '선제적 집중 강우 대비 수질 오염 사전 예방 솔루션',
      urgency: 'moderate',
      urgencyLabel: '예방 조치 (강우 대비 선제 관리)',
      diagnosticPattern: '수질은 아직 정상이지만 강우 강도 상승으로 잠재적 유출 위험이 고조된 상태',
      evidenceText: `현재 질산염(${n} mg/L)과 인산염(${p} mg/L)은 양호하나, 모의 강우량이 ${rain} mm/h로 증가 중입니다. 사전에 배수 체계를 정비하지 않으면 30~60분 후 급격한 수질 악화가 발생할 수 있습니다.`,
      actions: [
        {
          id: 'act-1',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '강우 지속 기간 중 비료 및 퇴비 살포 계획 전면 보류',
          detail: '비가 내리는 중에는 어떤 형태의 비료나 액비도 살포하지 않고 기상 호전 시까지 밀봉 보관합니다.',
          effectMechanism: '빗물에 의한 즉각적인 비료 유실 위험 원천 차단'
        },
        {
          id: 'act-2',
          stage: '즉시 대응 (0~24h)',
          actor: '농업인',
          action: '배수로 토사 유실 방지망 점검 및 물꼬 높이 관리',
          detail: '배수로 낙하부에 부직포나 잡석을 덧대어 급격한 빗물 유입으로 인한 도랑 침식을 사전 방지합니다.',
          effectMechanism: '급경사지 표토 붕괴 및 초기 세척(First flush) 탁수 차단'
        },
        {
          id: 'act-3',
          stage: '단기 조치 (1~7일)',
          actor: '환경감시',
          action: '주요 합류부 수질 간이 측정 빈도 2배 상향',
          detail: '강우 후 24시간 동안 DO 및 탁도 변화를 집중 추적하여 오염원 발생 여부를 모니터링합니다.',
          effectMechanism: '수질 이상 시 신속한 조기 경보 체계 유지'
        }
      ],
      recommendedSimParams: {
        smartFertilizerActive: true,
        vegetatedBufferActive: true,
      },
      expectedOutcome: '사전 예방 관리를 활성화하면 강우 피크 시에도 영양염류 급상승을 효과적으로 억제할 수 있습니다.'
    };
  }

  // Case 6: Optimal / Normal baseline maintenance
  return {
    solutionId: 'SOL-OPTIMAL',
    title: '친환경 지속가능 농업 및 하천 수생태계 최적 유지 솔루션',
    urgency: 'stable',
    urgencyLabel: '안정 유지 (최적 수질 상태)',
    diagnosticPattern: '모든 수질 지표가 교육용 기준치 내에서 매우 안정적으로 유지되는 최적 상태',
    evidenceText: `질산염(${n} mg/L), 인산염(${p} mg/L), 용존산소(${doVal} mg/L), 탁도(${turb} NTU) 등 전 지표가 정상 범위입니다. 적정 시비와 건전한 유역 관리가 유지되는 모범 시나리오입니다.`,
    actions: [
      {
        id: 'act-1',
        stage: '즉시 대응 (0~24h)',
        actor: '농업인',
        action: '현재의 표준 권장 시비량 및 관수 관리 지속 유지',
        detail: '불필요한 추가 비료 투입을 억제하고 현재 설정된 토양 비옥도 균형을 유지합니다.',
        effectMechanism: '양분 과잉 축적 예방 및 안정적인 작물 생육 보장'
      },
      {
        id: 'act-2',
        stage: '단기 조치 (1~7일)',
        actor: '농업인',
        action: '수변 식생 완충대 초본류 상태 점검 및 보식',
        detail: '완충대에 식재된 달뿌리풀, 갈대 등 정화 식물의 생육 상태를 확인하고 고사체를 제거합니다.',
        effectMechanism: '식생대의 영양염류 흡수 여과 성능을 최고 수준으로 유지'
      },
      {
        id: 'act-3',
        stage: '중장기 구조 개선',
        actor: '농업인/지자체',
        action: '지역 단위 친환경 농산물 인증 및 저탄소 농업기술 확산',
        detail: '화학비료 사용량 30% 감축 기술(녹비작물, 완효성 비료)을 마을 공동체 단위로 확대합니다.',
        effectMechanism: '유역 전체의 근원적인 비점오염 부하량 경감'
      }
    ],
    recommendedSimParams: {
      fertilizerIntensity: 'normal',
      vegetatedBufferActive: true,
      smartFertilizerActive: true,
    },
    expectedOutcome: '현행 친환경 농법을 유지할 경우 계절 변화 속에서도 안정적인 수질 등급을 확보할 수 있습니다.'
  };
}

/**
 * Evaluates simulated water quality and generates the tailored solution.
 */
export function evaluateWaterQualityRisk(point: WaterQualityDataPoint): RiskEvaluationResult {
  const anomalies: string[] = [];
  let riskScore = 0; // 0 = normal, 1-2 = caution, 3+ = danger

  const nDef = METRIC_DEFINITIONS.nitrateMgL;
  const pDef = METRIC_DEFINITIONS.phosphateMgL;
  const doDef = METRIC_DEFINITIONS.dissolvedOxygenMgL;
  const turbDef = METRIC_DEFINITIONS.turbidityNTU;

  // Check Nitrate (NO3-)
  if (point.nitrateMgL >= nDef.dangerThreshold) {
    anomalies.push(`질산염(${point.nitrateMgL} mg/L)이 시연용 위험 기준(${nDef.dangerThreshold} mg/L)을 초과함`);
    riskScore += 2;
  } else if (point.nitrateMgL >= nDef.cautionThreshold) {
    anomalies.push(`질산염(${point.nitrateMgL} mg/L)이 시연용 주의 기준(${nDef.cautionThreshold} mg/L)에 도달함`);
    riskScore += 1;
  }

  // Check Phosphate (PO4 3-)
  if (point.phosphateMgL >= pDef.dangerThreshold) {
    anomalies.push(`인산염(${point.phosphateMgL} mg/L)이 시연용 위험 기준(${pDef.dangerThreshold} mg/L)을 초과함`);
    riskScore += 2;
  } else if (point.phosphateMgL >= pDef.cautionThreshold) {
    anomalies.push(`인산염(${point.phosphateMgL} mg/L)이 시연용 주의 기준(${pDef.cautionThreshold} mg/L)에 도달함`);
    riskScore += 1;
  }

  // Check Dissolved Oxygen (DO) - lower is worse
  if (point.dissolvedOxygenMgL <= doDef.dangerThreshold) {
    anomalies.push(`용존산소(DO: ${point.dissolvedOxygenMgL} mg/L)가 시연용 위험 저하선(${doDef.dangerThreshold} mg/L) 이하로 급감함`);
    riskScore += 2;
  } else if (point.dissolvedOxygenMgL <= doDef.cautionThreshold) {
    anomalies.push(`용존산소(DO: ${point.dissolvedOxygenMgL} mg/L)가 시연용 주의선(${doDef.cautionThreshold} mg/L)에 근접함`);
    riskScore += 1;
  }

  // Check Turbidity
  if (point.turbidityNTU >= turbDef.dangerThreshold) {
    anomalies.push(`탁도(${point.turbidityNTU} NTU)가 강우 및 토양 부유물로 인해 높게 나타남`);
    riskScore += 1;
  }

  let overallLevel: RiskLevel = 'normal';
  let levelLabel = '정상 범위 (시연용 규칙 기준)';
  let summary = '모든 가상 수질 지표가 교육용 정상 범위 내에서 안정적으로 유지되고 있습니다.';

  if (riskScore >= 3) {
    overallLevel = 'danger';
    levelLabel = '높은 위험 (시연용 규칙 기준)';
    summary = '가상 데이터에서 복수의 영양염류 수치 초과 및 용존산소 저하가 감지되어 부영양화 시뮬레이션 위험 단계입니다.';
  } else if (riskScore >= 1) {
    overallLevel = 'caution';
    levelLabel = '주의 상태 (시연용 규칙 기준)';
    summary = '가상 데이터에서 일부 영양염류 또는 탁도 수치가 시연용 주의 기준을 상회하고 있습니다.';
  }

  let explanation = '';
  if (overallLevel === 'danger') {
    explanation = '질산염과 인산염 농도가 동시에 높고 용존산소 감소 추세가 나타나고 있습니다. 강우에 의한 농경지 표면 유출 가능성 또는 상류 유입원 영향이 모의된 상태입니다. 단, 실제 현장에서는 축산분뇨, 미처리 생활하수, 산업계 유입 등 복합 원인을 종합 검토해야 합니다.';
  } else if (overallLevel === 'caution') {
    explanation = '단일 영양염류 또는 탁도가 일시적으로 상승했습니다. 경작지 배수 또는 초기 우수 유출 시나리오가 반영 중일 수 있으며, 지속적인 수질 추이 관찰이 권장됩니다.';
  } else {
    explanation = '현재 지표는 양호한 상태를 모의하고 있습니다. 평상시 적정 토양 관리와 균형 잡힌 시비 계획이 유지되는 가상 조건입니다.';
  }

  const tailoredSolution = deriveTailoredSolution(point);

  return {
    overallLevel,
    levelLabel,
    summary,
    primaryRiskFactors: anomalies.length > 0 ? anomalies : ['특이 이상 징후 없음 (모든 지표 기준치 내)'],
    explanation,
    tailoredSolution,
    disclaimer: '본 판정은 프로그램이 사전에 정의한 시연용 규칙 기반 결과이며, 환경부의 공식 환경기준이나 법적 경보가 아닙니다. 화면의 데이터는 100% 가상 생성값입니다.'
  };
}
