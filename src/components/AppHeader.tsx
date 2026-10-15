import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

interface AppHeaderProps {
  onOpenHistory: () => void;
  savedCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenHistory, savedCount }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              AI Problem-Solving Assistant
            </h1>
            <p className="text-xs text-gray-500">
              Structured product problem-solving &amp; decision-support tool
            </p>
          </div>
        </div>

        <button
          onClick={onOpenHistory}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition shadow-xs cursor-pointer"
        >
          <Clock className="w-4 h-4 text-gray-500" />
          <span>History</span>
          {savedCount > 0 && (
            <span className="ml-0.5 px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
              {savedCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
