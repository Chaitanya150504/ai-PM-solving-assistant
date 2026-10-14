import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  Clock,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TopNavProps {
  onNewAnalysis: () => void;
  onOpenHistory: () => void;
  onOpenHowItWorks: () => void;
  savedCount: number;
  hasReport: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onNewAnalysis,
  onOpenHistory,
  onOpenHowItWorks,
  savedCount,
  hasReport,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-stone-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Abstract Product Icon & Brand Title */}
        <div
          onClick={onNewAnalysis}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {/* Simple abstract product icon */}
          <div className="w-7 h-7 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center shadow-2xs group-hover:bg-[#C85A32] transition-colors">
            <Layers className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
              Product Diagnosis Studio
            </span>
            <span className="hidden sm:inline text-[10px] tracking-wider uppercase text-stone-400 font-medium -mt-0.5">
              Product Strategy Workspace
            </span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-stone-600">
          <button
            onClick={onNewAnalysis}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              !hasReport
                ? 'text-stone-900 bg-stone-200/70 font-semibold'
                : 'hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            Workspace
          </button>

          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:text-stone-900 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>Analysis History</span>
            {savedCount > 0 && (
              <span className="font-mono text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-800">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:text-stone-900 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* Right: Status Indicator & Subtle New Analysis Button */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-stone-500 font-mono bg-stone-100/90 rounded border border-stone-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Engine Ready</span>
          </div>

          <button
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded-md hover:border-stone-400 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>New Analysis</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-200/60"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 py-3 space-y-2">
          <button
            onClick={() => {
              onNewAnalysis();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-900 rounded-md hover:bg-stone-200/60 flex items-center justify-between"
          >
            <span>Workspace</span>
            <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
          </button>

          <button
            onClick={() => {
              onOpenHistory();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 rounded-md hover:bg-stone-200/60 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Analysis History</span>
            </span>
            {savedCount > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-700">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onOpenHowItWorks();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs font-medium text-stone-700 rounded-md hover:bg-stone-200/60 flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>How It Works</span>
          </button>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <span>Status: Engine Ready</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          </div>
        </div>
      )}
    </header>
  );
};
