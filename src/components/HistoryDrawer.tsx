import React from 'react';
import { SavedAnalysis } from '../types';
import { X, Clock, Trash2, ArrowUpRight, FolderOpen } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedList: SavedAnalysis[];
  onSelect: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedList,
  onSelect,
  onDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Analysis History
                </h3>
                <p className="text-xs text-gray-500">
                  {savedList.length} saved {savedList.length === 1 ? 'record' : 'records'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50">
            {savedList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <FolderOpen className="w-10 h-10 mb-3 text-gray-300 stroke-1" />
                <p className="text-sm font-medium text-gray-600 mb-1">
                  No Saved Analyses Yet
                </p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Run a problem diagnosis or load a sample scenario to automatically save your work here.
                </p>
              </div>
            ) : (
              savedList.map((item) => {
                const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-400 transition shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                        {item.input.productCompany || 'Problem Analysis'}
                      </span>
                      <span>{dateStr}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                      {item.input.problemStatement}
                    </h4>

                    {item.report?.executiveSummary && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                        {typeof item.report.executiveSummary === 'string'
                          ? item.report.executiveSummary
                          : item.report.executiveSummary.problemSummary || item.report.executiveSummary.coreInsight}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <button
                        onClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        <span>Open Report</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
