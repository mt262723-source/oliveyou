/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sprout, 
  ExternalLink, 
  Layers, 
  Building2, 
  Trees,
  Sliders,
  CheckCircle2,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SolutionCase {
  id: string;
  title: string;
  condition: string;
  urgency: 'critical' | 'moderate' | 'stable';
  farmerAction: string;
  govAction: string;
  monitorAction: string;
  mechanism: string;
}

const SOLUTION_CATALOG: SolutionCase[] = [
  {
    id: 'case-1',
    title: '강우 동반 질산염(NO₃⁻) 침출 급증 대응',
    condition: '강우량 15mm/h 이상 + 질산염 6.0mg/L 이상',
    urgency: 'critical',
    farmerAction: '질소비료 살포 전면 중지, 논물꼬 10cm 높여 빗물 자연 담수 저류 유도, 부직포 피복',
    govAction: '하류 저류지 및 농업용 둠벙 수문 개방으로 초기 고농도 유출수 격리, 희석수 준비',
    monitorAction: '배수 유출구 질산성질소 간이 키트 측정 및 상류 지류 연속 농도 구배 추적',
    mechanism: '토양 음이온인 NO₃⁻의 용탈 특성을 차단하기 위해 유출 첨두량을 분산하고 목본 식생대 탈질(N2 환원) 유도'
  },
  {
    id: 'case-2',
    title: '표토 침식 및 인산염(PO₄³⁻)·탁도 급증 대응',
    condition: '탁도 20NTU 이상 + 인산염 0.20mg/L 이상',
    urgency: 'critical',
    farmerAction: '배수로 말단 볏짚 베일 및 모래주머니 임시 침사턱 설치, 인산비료 심층 경운 시비 전환',
    govAction: '소하천 전단 침사지(Sediment Trap) 수문 조작 및 부유 토사 슬러지 본류 확산 차단',
    monitorAction: '하천 부유물질(SS) 및 총인(T-P) 상관 분석, 토양 유실 지점 드론 항공 정찰',
    mechanism: '토양 입자에 강력히 결합하는 인의 특성을 이용해 유속을 늦춰 미립자 토사를 물리적으로 70% 이상 침전 여과'
  },
  {
    id: 'case-3',
    title: '수중 용존산소(DO) 급감 및 빈산소 수괴 대응',
    condition: '용존산소 4.5mg/L 이하 + 고수온 또는 부영양화',
    urgency: 'critical',
    farmerAction: '고농도 유기물 퇴수 배출 일시 중단 및 포장 내 저류',
    govAction: '이동식 수중 폭기장치(Aerator) 가동, 낙차보 수문 조절을 통한 자연 포기, 청정 저수지수 긴급 방류',
    monitorAction: '하천 어류 유영 상태 및 암모니아성 질소 농도 연속 검사',
    mechanism: '물-공기 접촉 면적을 급증시켜 대기 산소를 강제 재포기(Re-aeration)하고 정체 수괴 희석'
  },
  {
    id: 'case-4',
    title: '비강우기 농업 배수 및 복합 오염원 유입 대응',
    condition: '강우 없음(0~3mm/h) + 질산염/인산염 지속 고농도',
    urgency: 'moderate',
    farmerAction: '관개 퇴수의 하천 직방류를 멈추고 둠벙 저류 후 상류로 재양수하는 순환 관개 실시',
    govAction: '소규모 농촌 인공습지 유입 밸브 가동, 배수로 말단 퇴적 슬러지 준설',
    monitorAction: '인근 축산 분뇨 야적장 차수막 파손 및 개인 하수처리시설(정화조) 방류수 긴급 순찰',
    mechanism: '빗물 유출이 아닌 관개 퇴수 또는 비농업 오염원(축산/생활하수)을 분리하여 생태 순환 정화 유도'
  },
  {
    id: 'case-5',
    title: '선제적 집중 강우 대비 비점오염 사전 차단',
    condition: '기상청 강우 예보 및 강우 강도 상승 시작 단계',
    urgency: 'moderate',
    farmerAction: '향후 48시간 내 비료 및 가축분뇨 퇴비 살포 계획 전면 보류, 포장 내 배수로 정비',
    govAction: '재해대책본부 및 하천 수문 비상근무 돌입, 수변 완충식생대 차단망 점검',
    monitorAction: '주요 측정 지점 텔레메트리 갱신 주기 단축 모니터링',
    mechanism: '비가 내리기 전 지표면에 노출된 비료 성분을 원천 차단하여 초기 세척(First Flush) 오염 부하 예방'
  }
];

export const ActionGuideView: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1');
  const selectedCase = SOLUTION_CATALOG.find((c) => c.id === selectedCaseId) || SOLUTION_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          수질 상태별 맞춤 솔루션 도감 및 대응 가이드
        </h2>
        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-4xl">
          하천의 수질 오염은 단일 처방으로 해결되지 않습니다. 현재 측정되는 질산염, 인산염, 탁도, 용존산소, 강우량의 복합 상태에 따라 원인 메커니즘이 완전히 달라지므로, 상황에 최적화된 맞춤형 대응 프로토콜을 적용해야 합니다.
        </p>
      </div>

      {/* 🌟 Dynamic Tailored Solution Protocol Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-cyan-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              수질 상황별 5대 맞춤 대응 프로토콜 도감
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              상황을 클릭하여 이행 주체별 세부 행동 계획과 정화 과학 원리를 확인하세요.
            </p>
          </div>
        </div>

        {/* Case Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
          {SOLUTION_CATALOG.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                selectedCaseId === c.id
                  ? 'bg-cyan-50/70 border-cyan-500 ring-1 ring-cyan-500'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="text-[10px] font-mono text-cyan-800 font-bold">CASE 0{idx + 1}</div>
              <div className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">{c.title}</div>
              <div className="text-[10px] text-slate-500 mt-1">{c.condition}</div>
            </button>
          ))}
        </div>

        {/* Selected Case Detailed Strategy */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedCase.title}</h4>
              <span className="text-xs text-slate-600">발생 조건: {selectedCase.condition}</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
              selectedCase.urgency === 'critical'
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {selectedCase.urgency === 'critical' ? '🚨 긴급 대응 프로토콜' : '⚠️ 주의 조치 프로토콜'}
            </span>
          </div>

          {/* 3 Actor Action Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-emerald-800 block mb-1">👨‍🌾 농경지 관리자 (농업인 실천)</span>
              <p className="text-slate-700 leading-relaxed">{selectedCase.farmerAction}</p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-cyan-800 block mb-1">💧 하천·수자원 관리자 (지자체/공공)</span>
              <p className="text-slate-700 leading-relaxed">{selectedCase.govAction}</p>
            </div>

            <div className="p-3.5 bg-white rounded-lg border border-slate-200">
              <span className="font-bold text-purple-800 block mb-1">🔬 환경 감시단 & 연구자 점검</span>
              <p className="text-slate-700 leading-relaxed">{selectedCase.monitorAction}</p>
            </div>
          </div>

          {/* Scientific Purification Mechanism */}
          <div className="p-3 bg-white rounded-lg border border-cyan-200 text-xs text-cyan-900 leading-relaxed">
            <span className="font-bold">🧪 수질 개선 메커니즘: </span>
            <span>{selectedCase.mechanism}</span>
          </div>
        </div>
      </div>

      {/* 4R Nutrient Stewardship & Best Management Practices */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            농업 비료 유출 방지 4대 핵심 실천 원칙 (4R 영양관리)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-mono text-cyan-800 text-xs font-bold block mb-1">01. RIGHT SOURCE</span>
            <span className="font-bold text-slate-900 block mb-1.5">적정 비료 종류 선택</span>
            <p className="text-slate-600 leading-relaxed">
              작물별 요구 성분과 토양 특성에 맞는 비료를 선택하고, 초기 용출이 빠른 속효성 비료 대신 완효성 비료(SRF)를 사용하여 유실률을 줄입니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-mono text-cyan-800 text-xs font-bold block mb-1">02. RIGHT RATE</span>
            <span className="font-bold text-slate-900 block mb-1.5">토양 검정 기반 적정 시비</span>
            <p className="text-slate-600 leading-relaxed">
              관행적인 과다 시비를 지양하고, 농업기술센터 또는 흙토람 비료사용처방서에서 권장하는 기준 시비량을 철저히 준수합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-mono text-cyan-800 text-xs font-bold block mb-1">03. RIGHT TIME</span>
            <span className="font-bold text-slate-900 block mb-1.5">강우 전 시비 금지 및 분할 시비</span>
            <p className="text-slate-600 leading-relaxed">
              기상청 일기예보를 확인하여 24~48시간 이내 비 예보가 있을 시 시비를 중단하고, 생육 단계별로 2~3회 나누어 살포합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-mono text-cyan-800 text-xs font-bold block mb-1">04. RIGHT PLACE</span>
            <span className="font-bold text-slate-900 block mb-1.5">표토 심층 시비 및 피복</span>
            <p className="text-slate-600 leading-relaxed">
              지표면에 비료를 노출시키지 않고 토양과 골고루 섞어주며, 수확 후 호밀·헤어리베치 등 피복작물(녹비)을 재배하여 토양 침식을 방지합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Vegetated Buffer Strips Guide */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Trees className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            하천 수변 식생 완충대 (Riparian Buffer Strip)의 원리
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
            <h4 className="font-bold text-emerald-950 mb-1.5">1구역: 수변 수목대 (하천 인접)</h4>
            <p>
              하천 둑 바로 옆에 버드나무, 물푸레나무 등 뿌리가 깊은 목본류를 식재하여 하안 침식을 방지하고, 미생물 탈질 작용을 통해 지하수 중 질산염을 흡수·제거합니다.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
            <h4 className="font-bold text-emerald-950 mb-1.5">2구역: 관목 및 관수대 (중간 완충)</h4>
            <p>
              물억새, 달뿌리풀, 갈대 등 다년생 초본과 관목을 밀식하여 표면 유출수의 유속을 늦추고 토양 입자와 흡착된 인(P) 성분을 침전·여과합니다.
            </p>
          </div>

          <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
            <h4 className="font-bold text-emerald-950 mb-1.5">3구역: 잔디 및 초지대 (농경지 인접)</h4>
            <p>
              농경지 끝단에 3~5m 폭의 사초과 식생대를 유지하여 트랙터 진입 완충 및 강우 초기 고농도 유출수의 분산 유입을 유도합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Multifactorial Pollution Investigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-5 h-5 text-amber-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            복합 오염원 감별 및 해석 시 유의사항
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          하천에서 질산염 또는 인산염이 급증했다고 해서 무조건 농업 비료 유출로 단정할 수 없습니다. 수계 내에는 다양한 비점오염원과 점오염원이 복합 작용하므로 다음과 같은 요인을 종합적으로 고려해야 합니다:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">축산 분뇨 및 퇴비사 유출</span>
            <p className="text-slate-600">
              인근 축사나 야적된 가축분뇨 퇴비에서 강우 시 고농도 암모니아성 질소 및 인산염이 다량 용출될 수 있습니다. (BOD와 대장균군수 동시 측정 필요)
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">농촌 마을 미처리 생활하수</span>
            <p className="text-slate-600">
              하수처리구역 외 지역의 정화조 방류수나 세탁 세제(인산염 함유)가 지류로 유입되면 계절과 무관하게 인 농도가 상승할 수 있습니다.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block mb-1">하천 바닥 퇴적층 영양염 재용출</span>
            <p className="text-slate-600">
              여름철 수온 상승 및 하천 저층 무산소 상태 지속 시, 바닥 뻘층에 흡착되어 있던 인산염이 다시 수중으로 용출(Internal Loading)될 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* Official Portals & Contact Links */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-cyan-700" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            실제 하천 수질 공공 데이터 확인 및 신고 안내
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                환경부 물환경정보시스템 (Water Environment Information System)
              </span>
              <p className="text-slate-600 leading-relaxed mb-3">
                전국 국가 하천 및 지방 1·2급 하천의 수질측정망 실측 데이터, 수온, DO, BOD, COD, T-N, T-P 측정치를 조회할 수 있습니다.
              </p>
            </div>
            <a
              href="https://water.nier.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-cyan-700 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 mt-auto"
            >
              <span>water.nier.go.kr 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                농촌진흥청 흙토람 (토양환경정보시스템)
              </span>
              <p className="text-slate-600 leading-relaxed mb-3">
                지번별 토양 화학성 분석 자료 및 작물별 비료사용처방서를 무료로 발급받아 최적 시비량을 확인할 수 있습니다.
              </p>
            </div>
            <a
              href="https://soil.rda.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-cyan-700 hover:text-cyan-800 font-semibold inline-flex items-center gap-1 mt-auto"
            >
              <span>soil.rda.go.kr 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
          <span>실제 하천 유류 유출, 폐수 무단 방류 등 오염 사고 목격 시 신고처:</span>
          <span className="font-bold text-slate-900 font-mono">환경신문고 국번없이 128 / 관할 시·군청 환경과</span>
        </div>
      </div>
    </div>
  );
};
