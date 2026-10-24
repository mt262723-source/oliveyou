/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, Compass, Box, Trees } from 'lucide-react';

export type NavTab = 'results' | 'simulation3d' | 'bufferzone';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isRunning: boolean;
  onToggleRun: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onToggleRun,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Brand title, one line */}
      <button
        onClick={() => onTabChange('results')}
        className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 text-left cursor-pointer"
      >
        물지킴이 AI
      </button>

      {/* Zone 2: 3 clean single-line nav links */}
      <nav className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onTabChange('results')}
          className={`flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'results'
              ? 'text-cyan-700 font-bold underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>결과 및 맞춤 솔루션</span>
        </button>

        <button
          onClick={() => onTabChange('simulation3d')}
          className={`flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'simulation3d'
              ? 'text-cyan-700 font-bold underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          <Box className="w-4 h-4" />
          <span>2D 하천 3구간 시뮬레이터</span>
        </button>

        <button
          onClick={() => onTabChange('bufferzone')}
          className={`flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'bufferzone'
              ? 'text-cyan-700 font-bold underline underline-offset-8 decoration-2'
              : ''
          }`}
        >
          <Trees className="w-4 h-4" />
          <span>완충지대 구조 및 설치 가이드</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleRun}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isRunning
              ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
              : 'bg-cyan-700 text-white hover:bg-cyan-800'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>일시정지</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>재개</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
