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
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-[#FAF8F5] h-full shadow-xl border-l border-stone-200 z-10 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C85A32]" />
            <h3 className="font-semibold text-xs tracking-tight text-stone-900 uppercase">
              Analysis History
            </h3>
            <span className="text-[11px] font-mono text-stone-500">
              ({savedList.length})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {savedList.length === 0 ? (
            <div className="text-center py-16 px-4 text-stone-400">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-stone-300 stroke-[1.5]" />
              <p className="text-xs font-semibold text-stone-600">No saved analyses</p>
              <p className="text-[11px] text-stone-400 mt-0.5 max-w-xs mx-auto">
                Completed investigations will be saved here automatically.
              </p>
            </div>
          ) : (
            savedList.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={item.id}
                  className="group relative bg-white border border-stone-200 rounded-md p-3.5 hover:border-[#C85A32]/60 hover:shadow-2xs transition-all text-xs cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1 font-mono">
                    <span className="font-semibold text-[#C85A32] truncate max-w-[180px]">
                      {item.input.productCompany || 'Problem Analysis'}
                    </span>
                    <span>{dateStr}</span>
                  </div>

                  <h4 className="font-semibold text-stone-900 line-clamp-2 leading-relaxed group-hover:text-stone-700">
                    {item.input.problemStatement}
                  </h4>

                  {item.input.goal && (
                    <p className="text-[11px] text-stone-500 mt-1 truncate">
                      Goal: {item.input.goal}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 flex items-center gap-1 group-hover:text-[#C85A32] transition-colors">
                      <span>Open in Workspace</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-stone-100 transition-colors cursor-pointer"
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

        {/* Footer */}
        <div className="p-3.5 border-t border-stone-200 bg-white text-right">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
