import React from 'react';
import { Experiment, ExperimentPrioritization, PrioritizedExperimentItem } from '../types';
import { Award, Zap, Target, Clock, ShieldAlert, AlertCircle } from 'lucide-react';

interface PrioritizationSectionProps {
  prioritization: ExperimentPrioritization;
  experiments: Experiment[];
}

export const PrioritizationSection: React.FC<PrioritizationSectionProps> = ({
  prioritization,
  experiments,
}) => {
  // Aggregate all prioritization items provided by the AI
  const rawProvidedItems: PrioritizedExperimentItem[] = [
    ...(prioritization.quickWins || []),
    ...(prioritization.strategicBets || []),
    ...(prioritization.fillIns || []),
    ...(prioritization.deprioritize || []),
    ...(prioritization.moderatePriority || []),
  ];

  // Enforce rule: "Every experiment listed in Experiment Prioritization must also appear in the Proposed Experiments section.
  // Do not invent additional experiments during prioritization that were not previously proposed."
  // We align prioritized items to the canonical experiments from Section 9.
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
        experimentName: exp.experimentName, // keep canonical name from Section 9
      };
    }

    // If not explicitly matched in AI prioritization list, derive from proposed experiment
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

  // Strict logical categorization:
  // Quick Wins = High Impact + Low Effort (ONLY)
  // Strategic Bets = High Impact + High Effort (ONLY)
  // Fill-ins = Low Impact + Low Effort (ONLY)
  // Deprioritize = Low Impact + High Effort (ONLY)
  // Moderate Priority = Medium impact OR Medium effort (explain why)
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
      // Must not be forced into incorrect category!
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

  // Recommended first experiment normalization
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

  const getBadgeStyle = (value: string) => {
    switch (value?.toLowerCase()) {
      case 'high':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Intro Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
        <span className="font-semibold text-gray-800">Categorization Logic:</span> Experiments from Section 9 are systematically classified by their Impact and Effort profile. Experiments with Medium impact or Medium effort are placed in Moderate Priority rather than forced into extreme quadrants.
      </div>

      {/* 1. Quick Wins */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                1. Quick Wins (High Impact + Low Effort)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              High impact, low effort experiments. Highest immediate leverage.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            High Leverage
          </span>
        </div>

        {quickWins.length > 0 ? (
          <div className="space-y-3.5">
            {quickWins.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-200/90 rounded-lg p-4 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.experimentName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">Impact:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.impact)}`}>
                      {item.impact}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Effort:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.effort)}`}>
                      {item.effort}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {item.reason}
                </div>

                {item.categoryExplanation && (
                  <div className="text-gray-600 bg-white p-2.5 rounded border border-gray-200/80 leading-relaxed">
                    <span className="font-semibold text-emerald-800">Why Valuable: </span>
                    {item.categoryExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No proposed experiments meet both criteria of High Impact and Low Effort.
          </p>
        )}
      </div>

      {/* 2. Strategic Bets */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                2. Strategic Bets (High Impact + High Effort)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              High impact, high effort experiments. Require planning and dedicated resources.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Strategic Investment
          </span>
        </div>

        {strategicBets.length > 0 ? (
          <div className="space-y-3.5">
            {strategicBets.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-200/90 rounded-lg p-4 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.experimentName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">Impact:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.impact)}`}>
                      {item.impact}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Effort:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.effort)}`}>
                      {item.effort}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {item.reason}
                </div>

                {item.categoryExplanation && (
                  <div className="text-gray-600 bg-white p-2.5 rounded border border-gray-200/80 leading-relaxed">
                    <span className="font-semibold text-indigo-800">Why Worth Pursuing: </span>
                    {item.categoryExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No proposed experiments meet both criteria of High Impact and High Effort.
          </p>
        )}
      </div>

      {/* 3. Fill-ins */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                3. Fill-ins (Low Impact + Low Effort)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Low impact, low effort experiments. Opportunistic fill-ins.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Opportunistic
          </span>
        </div>

        {fillIns.length > 0 ? (
          <div className="space-y-3.5">
            {fillIns.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-200/90 rounded-lg p-4 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.experimentName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">Impact:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.impact)}`}>
                      {item.impact}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Effort:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.effort)}`}>
                      {item.effort}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {item.reason}
                </div>

                {item.categoryExplanation && (
                  <div className="text-gray-600 bg-white p-2.5 rounded border border-gray-200/80 leading-relaxed">
                    <span className="font-semibold text-amber-800">Why Considered Later: </span>
                    {item.categoryExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No proposed experiments meet both criteria of Low Impact and Low Effort.
          </p>
        )}
      </div>

      {/* 4. Deprioritize */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                4. Deprioritize (Low Impact + High Effort)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Low impact, high effort experiments. Disproportionate effort for negligible return.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            Do Not Prioritize
          </span>
        </div>

        {deprioritize.length > 0 ? (
          <div className="space-y-3.5">
            {deprioritize.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-200/90 rounded-lg p-4 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.experimentName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">Impact:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.impact)}`}>
                      {item.impact}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Effort:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.effort)}`}>
                      {item.effort}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {item.reason}
                </div>

                {item.categoryExplanation && (
                  <div className="text-gray-600 bg-white p-2.5 rounded border border-gray-200/80 leading-relaxed">
                    <span className="font-semibold text-rose-800">Why Not Prioritized Now: </span>
                    {item.categoryExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No proposed experiments meet both criteria of Low Impact and High Effort.
          </p>
        )}
      </div>

      {/* 5. Moderate Priority (Medium Impact or Medium Effort) */}
      <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                5. Moderate Priority (Medium Impact or Medium Effort)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Experiments with balanced or intermediate trade-offs. Not forced into extreme categories.
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Moderate Priority
          </span>
        </div>

        {moderatePriority.length > 0 ? (
          <div className="space-y-3.5">
            {moderatePriority.map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 border border-gray-200/90 rounded-lg p-4 text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-bold text-gray-900 text-sm">
                    {item.experimentName}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-gray-500 font-medium">Impact:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.impact)}`}>
                      {item.impact}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Effort:</span>
                    <span className={`px-2 py-0.5 rounded font-semibold border ${getBadgeStyle(item.effort)}`}>
                      {item.effort}
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-500 font-medium">Priority:</span>
                    <span className={`px-2 py-0.5 rounded font-bold border ${getBadgeStyle(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed">
                  <span className="font-semibold text-gray-900">Reason: </span>
                  {item.reason}
                </div>

                {item.categoryExplanation && (
                  <div className="text-gray-600 bg-white p-2.5 rounded border border-gray-200/80 leading-relaxed">
                    <span className="font-semibold text-amber-800">Why Moderate Priority: </span>
                    {item.categoryExplanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No proposed experiments have Medium impact or Medium effort.
          </p>
        )}
      </div>

      {/* HIGHLIGHTED SECTION: Recommended First Experiment */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/90 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Primary Recommendation
            </span>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              Recommended First Experiment
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-blue-100 p-5 space-y-3.5 text-xs shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
              Experiment Name
            </span>
            <div className="text-sm font-bold text-blue-950">
              {recommendedFirst.experimentName}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <span className="font-bold text-gray-700 block mb-0.5">
                Expected Impact:
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded font-semibold border ${getBadgeStyle(recommendedFirst.expectedImpact)}`}>
                {recommendedFirst.expectedImpact}
              </span>
            </div>
            <div>
              <span className="font-bold text-gray-700 block mb-0.5">
                Required Effort:
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded font-semibold border ${getBadgeStyle(recommendedFirst.requiredEffort)}`}>
                {recommendedFirst.requiredEffort}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">
              Why It Should Be Run First:
            </span>
            <p className="text-gray-700 leading-relaxed">
              {recommendedFirst.whyRunFirst}
            </p>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <span className="font-bold text-gray-900 block mb-1">
              What We Need to Learn From It:
            </span>
            <p className="text-gray-700 leading-relaxed">
              {recommendedFirst.whatWeNeedToLearn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
