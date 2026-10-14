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
  const rawProvidedItems: PrioritizedExperimentItem[] = [
    ...(prioritization.quickWins || []),
    ...(prioritization.strategicBets || []),
    ...(prioritization.fillIns || []),
    ...(prioritization.deprioritize || []),
    ...(prioritization.moderatePriority || []),
  ];

  // Guarantee that every prioritized item strictly references an experiment from Section 9
  const resolvedItems: PrioritizedExperimentItem[] = experiments.map((exp) => {
    const matched = rawProvidedItems.find(
      (item) =>
        item.experimentName.toLowerCase().trim() === exp.experimentName.toLowerCase().trim() ||
        item.experimentName.toLowerCase().includes(exp.experimentName.toLowerCase()) ||
        exp.experimentName.toLowerCase().includes(item.experimentName.toLowerCase())
    );

    if (matched) {
      return {
        ...matched,
        experimentName: exp.experimentName,
      };
    }

    const impact = exp.impactLevel || 'Medium';
    const effort = exp.effortLevel || 'Medium';
    const isHighImpact = impact.toLowerCase() === 'high';
    const isLowEffort = effort.toLowerCase() === 'low';
    const isHighEffort = effort.toLowerCase() === 'high';
    const isLowImpact = impact.toLowerCase() === 'low';

    let priority = 'Medium';
    if (isHighImpact && isLowEffort) priority = 'High';
    else if (isLowImpact && isHighEffort) priority = 'Low';

    return {
      experimentName: exp.experimentName,
      impact,
      effort,
      priority,
      reason: `Derived from proposed test: "${exp.hypothesisTested}". Primary metric: ${exp.primaryMetric}.`,
      categoryExplanation: `Target cohort: ${exp.targetUsers} with ${exp.duration} test duration.`,
    };
  });

  const quickWins: PrioritizedExperimentItem[] = [];
  const strategicBets: PrioritizedExperimentItem[] = [];
  const fillIns: PrioritizedExperimentItem[] = [];
  const deprioritize: PrioritizedExperimentItem[] = [];
  const moderatePriority: PrioritizedExperimentItem[] = [];

  resolvedItems.forEach((item) => {
    const impactNorm = (item.impact || '').toLowerCase();
    const effortNorm = (item.effort || '').toLowerCase();

    const isHighImpact = impactNorm === 'high';
    const isLowImpact = impactNorm === 'low';
    const isMediumImpact = impactNorm === 'medium' || (!isHighImpact && !isLowImpact);

    const isHighEffort = effortNorm === 'high';
    const isLowEffort = effortNorm === 'low';
    const isMediumEffort = effortNorm === 'medium' || (!isHighEffort && !isLowEffort);

    if (isMediumImpact || isMediumEffort) {
      moderatePriority.push({
        ...item,
        categoryExplanation:
          item.categoryExplanation ||
          (isMediumImpact && isMediumEffort
            ? 'Balances moderate upside with standard delivery effort; best sequenced after initial quick wins.'
            : isMediumImpact
            ? `Involves medium impact with ${effortNorm} effort; yields helpful directional learnings without extreme ROI.`
            : `Delivers ${impactNorm} impact with medium effort; viable to stage once high-priority low-effort tests conclude.`),
      });
    } else if (isHighImpact && isLowEffort) {
      quickWins.push(item);
    } else if (isHighImpact && isHighEffort) {
      strategicBets.push(item);
    } else if (isLowImpact && isLowEffort) {
      fillIns.push(item);
    } else if (isLowImpact && isHighEffort) {
      deprioritize.push(item);
    } else {
      moderatePriority.push(item);
    }
  });

  const firstProposedName = experiments[0]?.experimentName || 'Initial Proposed Test';
  const recommendedFirst = prioritization.recommendedFirst || {
    experimentName:
      prioritization.recommendedFirstExperimentName ||
      firstProposedName,
    expectedImpact: 'High',
    requiredEffort: 'Low',
    whyRunFirst:
      prioritization.recommendedFirstRationale ||
      'Provides the fastest feedback loop to validate the primary hypothesis with minimal resource commitment.',
    whatWeNeedToLearn:
      experiments[0]?.decisionRule ||
      'Whether the observed behavioral signal confirms user demand before committing substantial engineering.',
  };

  const categories = [
    {
      title: 'Quick Wins',
      formula: 'High Impact + Low Effort',
      items: quickWins,
      borderClass: 'border-l-4 border-l-[#C85A32]',
      tagClass: 'text-[#C85A32] bg-[#FAF8F5]',
      desc: 'Immediate-return interventions generating rapid validation loops with low engineering overhead.',
    },
    {
      title: 'Strategic Bets',
      formula: 'High Impact + High Effort',
      items: strategicBets,
      borderClass: 'border-l-4 border-l-stone-800',
      tagClass: 'text-stone-800 bg-stone-100',
      desc: 'High-upside bets requiring substantive engineering and cross-functional capacity.',
    },
    {
      title: 'Moderate Priority',
      formula: 'Medium Impact or Medium Effort',
      items: moderatePriority,
      borderClass: 'border-l-4 border-l-stone-400',
      tagClass: 'text-stone-700 bg-stone-100',
      desc: 'Balanced experiments staged sequentially after rapid validation tests conclude.',
    },
    {
      title: 'Fill-ins',
      formula: 'Low Impact + Low Effort',
      items: fillIns,
      borderClass: 'border-l-4 border-l-stone-300',
      tagClass: 'text-stone-600 bg-stone-100',
      desc: 'Incremental adjustments suitable for quick sprints when primary testing bandwidth is constrained.',
    },
    {
      title: 'Deprioritize',
      formula: 'Low Impact + High Effort',
      items: deprioritize,
      borderClass: 'border-l-4 border-l-stone-300',
      tagClass: 'text-stone-500 bg-stone-100',
      desc: 'Unfavorable trade-off profile; defer until stronger telemetry justifies high resource spend.',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Editorial Note */}
      <div className="text-xs text-stone-500">
        Strict text-based prioritization mapping trade-offs across Impact and Effort for all proposed experiments.
      </div>

      {/* 5 Text-Based Categorization Tiers */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div
            key={cat.title}
            className={`bg-white border border-stone-200 rounded-md ${cat.borderClass} p-4 shadow-2xs space-y-2`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-900 tracking-tight">
                  {cat.title}
                </h4>
                <span className="text-[11px] font-mono text-stone-400">
                  ({cat.formula})
                </span>
              </div>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${cat.tagClass}`}>
                {cat.items.length} {cat.items.length === 1 ? 'experiment' : 'experiments'}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              {cat.desc}
            </p>

            {cat.items.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-1">
                No proposed experiments mapped to this tier.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {cat.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-md bg-[#FAF8F5] border border-stone-200/80 text-xs space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-stone-900">
                        {item.experimentName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-stone-500">
                        <span>Impact: <strong className="text-stone-800">{item.impact}</strong></span>
                        <span>·</span>
                        <span>Effort: <strong className="text-stone-800">{item.effort}</strong></span>
                        <span>·</span>
                        <span>Priority: <strong className="text-stone-800">{item.priority}</strong></span>
                      </div>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      {item.reason}
                    </p>

                    {item.categoryExplanation && (
                      <p className="text-[11px] text-stone-400 italic">
                        {item.categoryExplanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommended First Experiment Card (Highlighted with Terracotta Accent) */}
      <div className="bg-stone-900 text-stone-100 rounded-md p-5 border border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E5855E]" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#E5855E]">
              Recommended First Experiment
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-mono">
            <span>Impact: <strong className="text-stone-200">{recommendedFirst.expectedImpact}</strong></span>
            <span>·</span>
            <span>Effort: <strong className="text-stone-200">{recommendedFirst.requiredEffort}</strong></span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {recommendedFirst.experimentName}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="bg-stone-800/80 p-3 rounded-md border border-stone-700/80 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              Why Run First
            </span>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              {recommendedFirst.whyRunFirst}
            </p>
          </div>

          <div className="bg-stone-800/80 p-3 rounded-md border border-stone-700/80 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block font-semibold">
              What We Need to Learn
            </span>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              {recommendedFirst.whatWeNeedToLearn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
