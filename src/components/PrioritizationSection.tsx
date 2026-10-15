import React from 'react';
import { Experiment, ExperimentPrioritization, PrioritizedExperimentItem } from '../types';
import { Zap, CheckCircle2 } from 'lucide-react';

interface PrioritizationSectionProps {
  prioritization: ExperimentPrioritization;
  experiments: Experiment[];
}

export const PrioritizationSection: React.FC<PrioritizationSectionProps> = ({
  prioritization,
  experiments,
}) => {
  const getExperimentDetails = (name: string) => {
    return experiments.find(
      (e) =>
        e.experimentName?.toLowerCase().trim() === name?.toLowerCase().trim() ||
        e.id?.toLowerCase().trim() === name?.toLowerCase().trim()
    );
  };

  const renderCategoryList = (
    title: string,
    tagline: string,
    badgeColor: string,
    borderColor: string,
    bgColor: string,
    items: PrioritizedExperimentItem[] = []
  ) => {
    return (
      <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-base">{title}</h4>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">{tagline}</p>

          {items.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              No experiments mapped to this category.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const exp = getExperimentDetails(item.experimentName);
                const titleToDisplay = item.experimentName || exp?.experimentName || `Experiment ${idx + 1}`;
                const expIdLabel = exp?.id || `EXP-0${idx + 1}`;

                return (
                  <div
                    key={idx}
                    className="bg-white rounded-lg p-3.5 border border-gray-200/80 shadow-xs hover:border-blue-400 transition"
                  >
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {expIdLabel}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {titleToDisplay}
                      </span>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">
                        {item.reason}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-gray-500 pt-1.5 border-t border-gray-100">
                      <span>
                        <strong className="text-gray-700">Impact:</strong> {item.impact}
                      </span>
                      <span>·</span>
                      <span>
                        <strong className="text-gray-700">Effort:</strong> {item.effort}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const reconsiderItems =
    prioritization.deprioritize ||
    (prioritization as any).reconsider ||
    [];

  return (
    <div>
      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 mb-6 text-xs text-blue-900 flex items-start gap-3">
        <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Text-Based Prioritization Matrix:</span>{' '}
          Validation initiatives are evaluated by expected customer impact against implementation complexity. Focus first on Quick Wins to establish rapid momentum, followed by Strategic Bets with strict milestone gates.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCategoryList(
          'Quick Wins',
          'High Impact · Low Effort — Immediate validation priority with rapid feedback loop',
          'bg-emerald-100 text-emerald-800',
          'border-emerald-200',
          'bg-emerald-50/30',
          prioritization.quickWins || []
        )}

        {renderCategoryList(
          'Strategic Bets',
          'High Impact · High Effort — Requires structured milestone validation before committing full engineering',
          'bg-blue-100 text-blue-800',
          'border-blue-200',
          'bg-blue-50/30',
          prioritization.strategicBets || []
        )}

        {renderCategoryList(
          'Fill-ins',
          'Low Impact · Low Effort — Secondary improvements when idle engineering capacity is available',
          'bg-amber-100 text-amber-800',
          'border-amber-200',
          'bg-amber-50/30',
          prioritization.fillIns || []
        )}

        {renderCategoryList(
          'Reconsider',
          'Low Impact · High Effort — Disproportionate cost for marginal returns; deprioritize or eliminate',
          'bg-gray-100 text-gray-800',
          'border-gray-200',
          'bg-gray-50/40',
          reconsiderItems
        )}
      </div>

      {prioritization.recommendedFirst && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-800 block mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Recommended First Experiment:{' '}
            <span className="text-blue-700 font-semibold">
              {prioritization.recommendedFirst.experimentName}
            </span>
          </strong>
          <p>{prioritization.recommendedFirst.whyRunFirst}</p>
        </div>
      )}
    </div>
  );
};
