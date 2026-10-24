/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldAlert, X } from 'lucide-react';
import { SIMULATION_DISCLAIMER_TEXT } from '../constants/thresholds';

export const NoticeBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside 
        aria-label="가상 데이터 안내"
        className="w-full bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900 transition-colors"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-950 tracking-tight">
                시뮬레이션 데이터 · 실제 센서 연결 안 됨
              </span>
              <span className="hidden sm:inline text-amber-700/80" aria-hidden="true">·</span>
              <span className="hidden md:inline text-amber-800">
                {SIMULATION_DISCLAIMER_TEXT}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="text-xs font-medium text-amber-900 hover:text-amber-950 underline underline-offset-2 hover:no-underline transition-colors cursor-pointer"
            >
              안내 및 한계 보기
            </button>
          </div>
        </div>
      </aside>

      {/* Educational Scope & Disclaimer Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="banner-modal-title"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 id="banner-modal-title" className="text-base font-semibold text-slate-900">
                  가상 수질 시뮬레이션 데이터 안내 및 이용 한계
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  본 애플리케이션의 데이터 생성 원리와 목적에 관한 설명입니다.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">1. 하드웨어 센서 미연결 프로토타입</p>
                <p>
                  화면에 표시되는 실시간 수질 측정치는 프로그램 내부의 수학적 가상 모델이 난수와 강우 시나리오를 결합하여 실시간 생성한 값입니다. 실제 하천에 설치된 계측 장비의 수치가 아닙니다.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">2. 시연용 교육 임계값 적용</p>
                <p>
                  질산염 및 인산염의 주의/위험 경보는 이해를 돕기 위해 사전에 설정된 교육용 기준치입니다. 환경부 하천 환경기준 및 수질예보제의 공식 수질 등급 기준과는 구분됩니다.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-medium text-slate-900 mb-1">3. 오염 원인 단정 불가 원칙</p>
                <p>
                  하천 수질의 변화는 농업용 비료 유출 외에도 축산 분뇨 유입, 미처리 생활하수, 산업 폐수, 하천 퇴적물 등 다양한 요인에 의해 발생합니다. 본 시뮬레이션 지표만으로 특정 농경지의 비료 과다 사용을 단정할 수 없습니다.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
