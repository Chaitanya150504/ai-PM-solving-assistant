import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: Boolean(apiKey) });
  });

  // Core problem analysis endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { problemStatement, productCompany, targetUsers, goal, additionalContext } = req.body;

      if (!problemStatement || typeof problemStatement !== 'string' || !problemStatement.trim()) {
        return res.status(400).json({ error: 'Problem statement is required.' });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in environment secrets.',
        });
      }

      const prompt = `
You are a Principal Product Manager acting as an expert Product Problem-Solving & Decision-Support tool.
Analyze the following product/business problem systematically through rigorous product thinking.

CRITICAL INSTRUCTIONS & FACTUAL INTEGRITY RULES:
- Do NOT generate a PRD. This is a problem-solving and decision-support analysis report.
- NEVER invent, assume, or present specific numerical data, user behavior, market statistics, competitor behavior, operational observations, or validated facts unless they were explicitly provided by the user.
- If the user did not supply specific numbers (e.g. retention percentages, conversion rates, baseline metrics, revenue numbers, discount percentages, delivery distances, user counts, survey results):
  * Do NOT invent them.
  * For baselines without user data: set baseline strictly to "Baseline: Not provided".
  * For targets without user data: set targetSuggestion strictly to "Suggested target: Define after establishing the baseline".
  * Do NOT generate fake percentage lifts (e.g. do NOT say "+15% lift"). Explain how to measure the effect instead.
- ROOT CAUSE ANALYSIS:
  Separate findings into:
  1. User-provided facts (facts stated directly in the user input; do not add unstated assertions here)
  2. Possible root causes (unconfirmed potential mechanisms; label each as an assumption/hypothesis, never as an observed phenomenon)
  3. Hypotheses requiring validation (concrete hypotheses to investigate)
- HYPOTHESES:
  Hypotheses must remain hypotheses even when confidence is high. Use tentative language:
  "This could be true because...", "This should be validated by...", "Possible explanation...".
  Do not convert reasoning into factual claims.
- COMPETITORS:
  Do NOT claim that users are switching to a specific competitor unless the user explicitly provided that information.
  You may write: "Investigate whether users are switching to competitors such as X or Y." Do not state that they are switching.
- LABELING:
  Clearly label unverified information as: "Unknown", "Assumption", "Hypothesis", "Illustrative example", or "Data required to validate".
  Never label an AI-generated assumption as "Observed", "Validated", or "Confirmed" unless explicit evidence was supplied by the user.

INPUT DETAILS:
- Problem Statement: ${problemStatement.trim()}
- Product / Company: ${productCompany?.trim() || 'Not specified'}
- Target Users: ${targetUsers?.trim() || 'Not specified'}
- Goal: ${goal?.trim() || 'Not specified'}
- Additional Context: ${additionalContext?.trim() || 'None provided'}

Generate a thorough, evidence-based Product Management analysis report in structured JSON format matching the schema strictly.
`;

      const systemInstruction = `You are a world-class Principal Product Manager and Product Strategist.
You analyze product problems with extreme rigor, clear logic, and scientific product discovery discipline.
You adhere to strict evidence-based reasoning: NEVER invent baseline numbers, conversion rates, percentages, competitor actions, or market data not provided in the input.

You follow this exact structured flow:
1. Executive Summary
2. Problem Definition (redefined, affected stakeholders, why it matters)
3. Problem Breakdown (dimensions and sub-components)
4. Root Cause Analysis:
   - User-provided facts (strictly facts stated in the input)
   - Possible root causes (unconfirmed potential mechanisms, labeled as assumptions)
   - Hypotheses requiring validation
   - Cautionary note
5. Hypotheses (tentative language: 'This could be true because...', 'This should be validated by...')
6. Investigation Questions (practical questions across behavioral, funnel, operational, competitive angles)
7. Data & Signals Needed (analytics, qualitative research, customer feedback, priorities)
8. Potential Solutions (name, description, problem addressed, impact, effort, key assumption)
9. Experiments (name, hypothesis tested, target users, design, duration, primary metric, expected result, decision rule, impact/effort)
10. Experiment Prioritization:
    Every experiment listed in Experiment Prioritization must also appear in the Proposed Experiments section (Section 9). Do NOT invent additional experiments during prioritization that were not previously proposed.
    Present experiment prioritization as a clear text-based analysis (do NOT use a 2x2 matrix, chart, graph, quadrant, or grid).
    Ensure experiment categorization is logically consistent based strictly on Impact and Effort:
    - Quick Wins = High Impact + Low Effort (ONLY)
    - Strategic Bets = High Impact + High Effort (ONLY)
    - Fill-ins = Low Impact + Low Effort (ONLY)
    - Deprioritize = Low Impact + High Effort (ONLY)
    - Moderate Priority = If an experiment has Medium impact OR Medium effort, do NOT force it into an incorrect category. Classify it as "Moderate Priority" and explain why.

    For each experiment, show:
    - Experiment Name (must match an experiment from Section 9)
    - Impact: High / Medium / Low
    - Effort: High / Medium / Low
    - Priority: High / Medium / Low
    - Reason: Explain why this experiment has this priority
    Group into the 5 text categories:
    1. Quick Wins (High Impact + Low Effort - explain why each is valuable)
    2. Strategic Bets (High Impact + High Effort - explain why each may be worth pursuing despite higher effort)
    3. Fill-ins (Low Impact + Low Effort - explain why these can be considered later)
    4. Deprioritize (Low Impact + High Effort - explain why these should not be prioritized now)
    5. Moderate Priority (Medium Impact or Medium Effort - explain why this falls in the moderate tier)

    Then include the clearly highlighted section:
    Recommended First Experiment:
    - Experiment name (must be one of the proposed experiments)
    - Expected impact
    - Required effort
    - Why it should be run first
    - What we need to learn from it
11. Success Metrics:
    - If user provided no baseline numbers, write: 'Baseline: Not provided'
    - For target, write: 'Suggested target: Define after establishing the baseline'
    - Do not invent fake percentages or dollar amounts.
12. Risks & Assumptions (Risks with mitigations, Assumptions labeled as unvalidated, Dependencies, Unknowns)
13. Recommended Action Plan (Step-by-step sequential action plan with stepNumber, title, owner/focus, timeframe, and concrete action; ends naturally after the final step)

You MUST respond strictly with valid JSON.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          executiveSummary: {
            type: Type.OBJECT,
            properties: {
              problemSummary: { type: Type.STRING },
              recommendedDirection: { type: Type.STRING },
              coreInsight: { type: Type.STRING },
            },
            required: ['problemSummary', 'recommendedDirection', 'coreInsight'],
          },
          problemDefinition: {
            type: Type.OBJECT,
            properties: {
              redefinedProblem: { type: Type.STRING },
              affectedStakeholders: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              businessImpactAndUrgency: { type: Type.STRING },
              whyItMatters: { type: Type.STRING },
            },
            required: ['redefinedProblem', 'affectedStakeholders', 'businessImpactAndUrgency', 'whyItMatters'],
          },
          problemBreakdown: {
            type: Type.OBJECT,
            properties: {
              dimensions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dimensionName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    subComponents: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['dimensionName', 'description', 'subComponents'],
                },
              },
            },
            required: ['dimensions'],
          },
          rootCauseAnalysis: {
            type: Type.OBJECT,
            properties: {
              userProvidedFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              possibleRootCauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    cause: { type: Type.STRING },
                    mechanism: { type: Type.STRING },
                    category: { type: Type.STRING },
                    isAssumption: { type: Type.BOOLEAN },
                    statusLabel: { type: Type.STRING },
                  },
                  required: ['cause', 'mechanism', 'category', 'isAssumption', 'statusLabel'],
                },
              },
              hypothesesRequiringValidation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              cautionaryNote: { type: Type.STRING },
            },
            required: ['userProvidedFacts', 'possibleRootCauses', 'hypothesesRequiringValidation', 'cautionaryNote'],
          },
          hypotheses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                hypothesis: { type: Type.STRING },
                whyItCouldBeTrue: { type: Type.STRING },
                evidenceNeeded: { type: Type.STRING },
                confidenceLevel: { type: Type.STRING },
                confidenceRationale: { type: Type.STRING },
              },
              required: ['id', 'hypothesis', 'whyItCouldBeTrue', 'evidenceNeeded', 'confidenceLevel', 'confidenceRationale'],
            },
          },
          investigationQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                question: { type: Type.STRING },
                whyAskThis: { type: Type.STRING },
              },
              required: ['category', 'question', 'whyAskThis'],
            },
          },
          dataAndSignalsNeeded: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                sourceOrMetric: { type: Type.STRING },
                whatToLookFor: { type: Type.STRING },
                priority: { type: Type.STRING },
              },
              required: ['category', 'sourceOrMetric', 'whatToLookFor', 'priority'],
            },
          },
          potentialSolutions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                solutionName: { type: Type.STRING },
                description: { type: Type.STRING },
                problemAddressed: { type: Type.STRING },
                expectedImpact: { type: Type.STRING },
                impactRationale: { type: Type.STRING },
                effort: { type: Type.STRING },
                effortRationale: { type: Type.STRING },
                keyAssumption: { type: Type.STRING },
              },
              required: ['id', 'solutionName', 'description', 'problemAddressed', 'expectedImpact', 'impactRationale', 'effort', 'effortRationale', 'keyAssumption'],
            },
          },
          experiments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                experimentName: { type: Type.STRING },
                hypothesisTested: { type: Type.STRING },
                targetUsers: { type: Type.STRING },
                experimentDesign: { type: Type.STRING },
                duration: { type: Type.STRING },
                primaryMetric: { type: Type.STRING },
                expectedResult: { type: Type.STRING },
                decisionRule: { type: Type.STRING },
                quadrant: { type: Type.STRING },
                impactLevel: { type: Type.STRING },
                effortLevel: { type: Type.STRING },
              },
              required: ['id', 'experimentName', 'hypothesisTested', 'targetUsers', 'experimentDesign', 'duration', 'primaryMetric', 'expectedResult', 'decisionRule', 'quadrant', 'impactLevel', 'effortLevel'],
            },
          },
          experimentPrioritization: {
            type: Type.OBJECT,
            properties: {
              quickWins: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experimentName: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    categoryExplanation: { type: Type.STRING },
                  },
                  required: ['experimentName', 'impact', 'effort', 'priority', 'reason'],
                },
              },
              strategicBets: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experimentName: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    categoryExplanation: { type: Type.STRING },
                  },
                  required: ['experimentName', 'impact', 'effort', 'priority', 'reason'],
                },
              },
              fillIns: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experimentName: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    categoryExplanation: { type: Type.STRING },
                  },
                  required: ['experimentName', 'impact', 'effort', 'priority', 'reason'],
                },
              },
              deprioritize: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experimentName: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    categoryExplanation: { type: Type.STRING },
                  },
                  required: ['experimentName', 'impact', 'effort', 'priority', 'reason'],
                },
              },
              moderatePriority: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    experimentName: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    effort: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    categoryExplanation: { type: Type.STRING },
                  },
                  required: ['experimentName', 'impact', 'effort', 'priority', 'reason'],
                },
              },
              recommendedFirst: {
                type: Type.OBJECT,
                properties: {
                  experimentName: { type: Type.STRING },
                  expectedImpact: { type: Type.STRING },
                  requiredEffort: { type: Type.STRING },
                  whyRunFirst: { type: Type.STRING },
                  whatWeNeedToLearn: { type: Type.STRING },
                },
                required: ['experimentName', 'expectedImpact', 'requiredEffort', 'whyRunFirst', 'whatWeNeedToLearn'],
              },
            },
            required: ['quickWins', 'strategicBets', 'fillIns', 'deprioritize', 'moderatePriority', 'recommendedFirst'],
          },
          successMetrics: {
            type: Type.OBJECT,
            properties: {
              primaryMetric: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  whyChosen: { type: Type.STRING },
                  baseline: { type: Type.STRING },
                  targetSuggestion: { type: Type.STRING },
                  measurementMethod: { type: Type.STRING },
                },
                required: ['name', 'definition', 'whyChosen', 'baseline', 'targetSuggestion', 'measurementMethod'],
              },
              secondaryMetrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    relevance: { type: Type.STRING },
                    baselineStatus: { type: Type.STRING },
                  },
                  required: ['name', 'definition', 'relevance', 'baselineStatus'],
                },
              },
              guardrailMetrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    definition: { type: Type.STRING },
                    thresholdOrWarning: { type: Type.STRING },
                    whyCrucial: { type: Type.STRING },
                  },
                  required: ['name', 'definition', 'thresholdOrWarning', 'whyCrucial'],
                },
              },
            },
            required: ['primaryMetric', 'secondaryMetrics', 'guardrailMetrics'],
          },
          risksAndAssumptions: {
            type: Type.OBJECT,
            properties: {
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    risk: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    mitigation: { type: Type.STRING },
                  },
                  required: ['risk', 'severity', 'mitigation'],
                },
              },
              assumptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    assumption: { type: Type.STRING },
                    validationStatus: { type: Type.STRING },
                  },
                  required: ['assumption', 'validationStatus'],
                },
              },
              dependencies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              unknowns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['risks', 'assumptions', 'dependencies', 'unknowns'],
          },
          recommendedActionPlan: {
            type: Type.OBJECT,
            properties: {
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    ownerOrFocus: { type: Type.STRING },
                    action: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                  },
                  required: ['stepNumber', 'title', 'ownerOrFocus', 'action', 'timeframe'],
                },
              },
            },
            required: ['steps'],
          },
        },
        required: [
          'executiveSummary',
          'problemDefinition',
          'problemBreakdown',
          'rootCauseAnalysis',
          'hypotheses',
          'investigationQuestions',
          'dataAndSignalsNeeded',
          'potentialSolutions',
          'experiments',
          'experimentPrioritization',
          'successMetrics',
          'risksAndAssumptions',
          'recommendedActionPlan',
        ],
      };

      // Resilient Gemini invocation with automatic retry on transient spikes
      const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let lastError: any = null;
      let rawText = '';

      for (const modelName of candidateModels) {
        try {
          console.log(`[AI Problem-Solving Assistant] Attempting analysis with model: ${modelName}`);
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema,
              temperature: 0.2,
            },
          });

          if (response.text) {
            rawText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI Problem-Solving Assistant] Model ${modelName} error:`, err?.message || err);
          // Wait briefly before trying fallback
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }

      if (!rawText) {
        throw lastError || new Error('Unable to generate analysis response from AI models.');
      }
      let parsedData;
      try {
        parsedData = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', parseErr, rawText);
        return res.status(500).json({
          error: 'The AI model generated an invalid format. Please try again.',
          raw: rawText,
        });
      }

      return res.json({ success: true, report: parsedData });
    } catch (err: any) {
      console.error('Analysis error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to analyze the problem. Please check your network and try again.',
      });
    }
  });

  // Setup Vite middleware in development or static serving in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Problem-Solving Assistant] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
