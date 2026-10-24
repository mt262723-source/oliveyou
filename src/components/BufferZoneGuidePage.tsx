/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Trees, 
  MapPin, 
  Layers, 
  CheckCircle2, 
  Sprout, 
  Droplets, 
  ShieldCheck, 
  ArrowRight,
  TrendingDown,
  Building,
  Info
} from 'lucide-react';

interface BufferZoneGuidePageProps {
  onNavigateToSimulation?: () => void;
}

export const BufferZoneGuidePage: React.FC<BufferZoneGuidePageProps> = ({
  onNavigateToSimulation,
}) => {
  const [activeZoneDetail, setActiveZoneDetail] = useState<'zone1' | 'zone2' | 'zone3'>('zone1');

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <Trees className="w-5 h-5" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              수변 식생 완충지대(Riparian Buffer Strip) 구조 및 설치 가이드
            </h1>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            수변 식생 완충지대는 농경지와 하천 사이에 조성하는 3단계 복합 식생대로, 강우 시 빗물과 함께 쏟아지는 비료(질소·인)와 흙탕물을 물리적·생물학적으로 70% 이상 차단·정화하는 가장 효과적인 친환경 비점오염 저감 시설입니다.
          </p>
        </div>

        {onNavigateToSimulation && (
          <button
            onClick={onNavigateToSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>2D 시뮬레이션에서 효과 시험하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 🌟 PART 1: 완충지대의 비점오염 저감 효과 (Efficacy & Numbers) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <TrendingDown className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            완충지대 설치 시 수질오염 저감 효과 (국립환경과학원 표준 연구치)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">총질소 (T-N / 질산염) 저감</span>
            <span className="text-3xl font-black font-mono text-emerald-800 tabular-nums">50~75%</span>
            <span className="text-[10px] text-slate-500 block mt-1">심근성 목본의 탈질작용(N₂ 환원)</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">총인 (T-P / 인산염) 저감</span>
            <span className="text-3xl font-black font-mono text-emerald-800 tabular-nums">60~85%</span>
            <span className="text-[10px] text-slate-500 block mt-1">토양 흡착 및 미립자 물리적 침전</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">부유토사 (SS / 탁도) 차단</span>
            <span className="text-3xl font-black font-mono text-emerald-800 tabular-nums">70~90%</span>
            <span className="text-[10px] text-slate-500 block mt-1">초본류 마찰저항에 의한 유속 감쇄</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center">
            <span className="text-[11px] font-bold text-emerald-900 block mb-1">수온 상승 억제 및 수생태 보호</span>
            <span className="text-3xl font-black font-mono text-emerald-800 tabular-nums">2~4°C↓</span>
            <span className="text-[10px] text-slate-500 block mt-1">수관 그늘 형성을 통한 녹조 예방</span>
          </div>
        </div>
      </div>

      {/* 🌟 PART 2: 완충지대를 어디에 설치하면 좋을까? (WHERE TO INSTALL) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <MapPin className="w-4 h-4 text-cyan-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              완충지대 적정 설치 입지 기준 (어디에 설치할 것인가?)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              비점오염 유출 위험이 가장 높고 정화 효율이 극대화되는 4대 우선 설치 입지입니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center">1</span>
              <h3 className="text-xs font-bold text-slate-900">농경지와 하천 제방의 직결 경계면</h3>
            </div>
            <p className="text-slate-600 leading-relaxed pl-7">
              답작·전작 농경지의 유출수가 하천으로 직접 떨어지는 경사도 3~8% 미만의 완경사 제방 부지. 폭 10~15m를 확보할 때 정화 효율이 가장 높습니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center">2</span>
              <h3 className="text-xs font-bold text-slate-900">농업 배수로 말단 및 소하천 합류구</h3>
            </div>
            <p className="text-slate-600 leading-relaxed pl-7">
              여러 필지에서 모인 농업 퇴수와 빗물이 소하천으로 합류하는 최종 배수구 주변에 소규모 인공습지 및 침사지와 결합하여 설치합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center">3</span>
              <h3 className="text-xs font-bold text-slate-900">축산 농가 및 야적 퇴비사 하류 사면</h3>
            </div>
            <p className="text-slate-600 leading-relaxed pl-7">
              우기 시 가축분뇨 침출수 및 고농도 암모니아성 질소의 유출 가능성이 높은 축사 경계면 사면에 다열 목본 식생대를 우선 조성합니다.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center">4</span>
              <h3 className="text-xs font-bold text-slate-900">상수원 취수탑 상류 500m 이내 보호구역</h3>
            </div>
            <p className="text-slate-600 leading-relaxed pl-7">
              지역 주민의 식수를 공급하는 취수보 및 호소 상류의 법정 수변구역으로, 조류 번식 방지를 위한 영양염류(질소·인) 차단 최우선 구간입니다.
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 PART 3: 완충지대를 어떻게 설치하면 좋을까? 3단계 구조 설계도 (HOW TO INSTALL) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Layers className="w-4 h-4 text-emerald-700" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              완충지대 구조적 3단계 단면 설계 (어떻게 설치할 것인가?)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              농경지에서 하천에 이르는 3대 구역(Zone)의 구조와 식재 수종 설계도입니다. 구역을 클릭하여 상세 스펙을 확인하세요.
            </p>
          </div>
        </div>

        {/* Interactive 3-Zone Cross-Section Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Zone 3: Grass Filter Strip (Farmland side) */}
          <div
            onClick={() => setActiveZoneDetail('zone3')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeZoneDetail === 'zone3'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                1차 차단대 (폭 2~4m)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">농경지 인접</span>
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Zone 3: 초본 완충초지 (Filter Strip)
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              농경지 바로 끝단에 설치하여 강우 초기 빗물의 유속을 늦추고 큰 흙먼지와 모래를 1차로 걸러냅니다.
            </p>
            <div className="mt-3 text-[10px] text-emerald-900 bg-white p-2 rounded-md border border-emerald-200">
              <strong>추천 식재:</strong> 수크령, 물억새, 사초과 초본
            </div>
          </div>

          {/* Zone 2: Shrub / Wetland Buffer (Middle) */}
          <div
            onClick={() => setActiveZoneDetail('zone2')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeZoneDetail === 'zone2'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                2차 정화대 (폭 3~5m)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">중간 완충</span>
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Zone 2: 중간 관목 및 습지대 (Shrub Zone)
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              관목류와 정화 습지 식물이 복합 작용하여 토양에 흡착된 인산염(P) 입자를 침전시키고 분해합니다.
            </p>
            <div className="mt-3 text-[10px] text-emerald-900 bg-white p-2 rounded-md border border-emerald-200">
              <strong>추천 식재:</strong> 갈대, 달뿌리풀, 부들, 찔레나무
            </div>
          </div>

          {/* Zone 1: Forest Tree Zone (Stream side) */}
          <div
            onClick={() => setActiveZoneDetail('zone1')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeZoneDetail === 'zone1'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                최종 수변 수목대 (폭 5~10m)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">하천 수변</span>
            </div>
            <h3 className="text-xs font-bold text-slate-900">
              Zone 1: 수변 수목대 (Stream-side Trees)
            </h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              하천 둑 바로 옆에 깊은 뿌리를 내리는 교목을 식재하여 지하수 속 질산염을 영구 탈질하고 제방 붕괴를 막습니다.
            </p>
            <div className="mt-3 text-[10px] text-emerald-900 bg-white p-2 rounded-md border border-emerald-200">
              <strong>추천 식재:</strong> 버드나무, 물푸레나무, 오리나무
            </div>
          </div>
        </div>

        {/* Selected Zone Deep Dive Spec */}
        <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs space-y-2">
          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            선택된 {activeZoneDetail === 'zone1' ? 'Zone 1(수변 수목대)' : activeZoneDetail === 'zone2' ? 'Zone 2(중간 관목·습지대)' : 'Zone 3(초본 완충초지)'} 정밀 시공 지침
          </div>
          <p className="text-slate-700 leading-relaxed">
            {activeZoneDetail === 'zone1' && (
              '하천 수면과 맞닿는 제방 사면에 버드나무와 오리나무를 지그재그(Zig-zag) 형태로 2~3열 밀식합니다. 목본류의 깊은 뿌리는 혐기성 토양층에서 서식하는 탈질 박테리아와 공생하여 물속 질산염(NO₃⁻)을 기체인 질소(N₂)로 공기 중에 방출시키는 생물학적 탈질을 완결합니다.'
            )}
            {activeZoneDetail === 'zone2' && (
              '다년생 수생 식물인 달뿌리풀과 갈대를 ㎡당 15~20본 밀식합니다. 줄기 밀도가 높아 빗물의 유속을 초당 0.1m 이하로 늦추며, 흙탕물 속에 부유하는 미립자 인(PO₄)을 바닥에 가라앉히고 식물체 세포벽 형성 물질로 직접 흡수합니다.'
            )}
            {activeZoneDetail === 'zone3' && (
              '농경지 경계선에 2~4m 폭으로 수크령과 톨페스큐 등 화본과 잔디를 띠 형태로 파종합니다. 트랙터나 농기계의 제방 진입 완충 공간 역할을 동시에 수행하며, 경작지에서 쏟아지는 초기 세척 우수의 토양 유실을 80% 이상 물리적으로 억제합니다.'
            )}
          </p>
        </div>
      </div>

      {/* 🌟 PART 4: 단계별 설치 및 시공 4단계 로드맵 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sprout className="w-4 h-4 text-cyan-700" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            완충지대 단계별 시공 및 사후 유지관리 가이드 (4단계)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-mono font-bold text-cyan-700 text-xs">STEP 01</span>
            <h4 className="font-bold text-slate-900">지형 실측 및 사면 완경사 정비</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              제방 급경사를 1:2~1:3의 완경사로 정비하고, 유실 위험이 높은 구간에 야자매트(코코넛 섬유)를 포설하여 토양을 안정화합니다.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-mono font-bold text-cyan-700 text-xs">STEP 02</span>
            <h4 className="font-bold text-slate-900">초본류 파종 및 1차 피복</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              봄(3~4월) 또는 가을(9~10월)에 수크령, 잔디류를 종자 뿜어붙이기(Hydro-seeding) 방식으로 파종하여 초기 잔디대를 형성합니다.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-mono font-bold text-cyan-700 text-xs">STEP 03</span>
            <h4 className="font-bold text-slate-900">다열 목본 및 수생식물 식재</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              수변 안쪽부터 버드나무 묘목과 갈대 뗏장을 식재하고 지주대를 설치하여 홍수 시 유실되지 않도록 고정합니다.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="font-mono font-bold text-cyan-700 text-xs">STEP 04</span>
            <h4 className="font-bold text-slate-900">연간 예초 부산물 수거 관리</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              가을철에 자란 갈대와 풀을 베어낸 후 반드시 하천 밖으로 수거해야 합니다. (수거하지 않고 썩히면 흡수했던 질소·인이 다시 하천으로 방출됨)
            </p>
          </div>
        </div>
      </div>

      {/* PART 5: 정부 지원 사업 안내 */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-700 shrink-0" />
          <span>
            <strong>정부 지원 연계 안내:</strong> 환경부 및 4대강 수계관리위원회에서는 수변구역 토지매수 및 완충녹지 조성 사업 비용을 70~100% 국비 지원하고 있습니다.
          </span>
        </div>
        <span className="font-semibold text-cyan-800">문의: 환경부 수생태보전과 / 관할 유역환경청</span>
      </div>
    </div>
  );
};
