/**
 * Competency-Based Scoring Rubric
 *
 * This module defines the rubric for evaluating interview responses
 * based on multiple competencies rather than a single score.
 *
 * EU AI Act Compliance Note:
 * - All scoring is based on transcript content only
 * - Face/emotion metrics are NOT used in scoring
 * - Human oversight is required for final decisions
 */

export interface CompetencyScore {
  competency: string;
  score: number; // 0-100
  level: "novice" | "developing" | "proficient" | "expert";
  evidence: string[]; // Quotes from transcript supporting the score
  reasoning: string; // AI explanation for the score
}

export interface RubricEvaluation {
  competencies: CompetencyScore[];
  overallScore: number;
  strengths: string[];
  areasForGrowth: string[];
  recommendation: "strong_yes" | "yes" | "maybe" | "no";
  confidence: number; // AI confidence in evaluation (0-100)
  limitations: string[]; // Acknowledged limitations of the evaluation
}

// Core competencies for interview evaluation
export const CORE_COMPETENCIES = [
  {
    id: "communication",
    name: "Communication",
    description: "Ability to express ideas clearly, listen actively, and articulate thoughts",
    indicators: [
      "Clear and structured responses",
      "Appropriate use of examples",
      "Active listening signals",
      "Concise yet complete answers",
    ],
    levels: {
      novice: "Struggles to express ideas clearly; responses are disorganized or incomplete",
      developing: "Can communicate basic ideas but lacks structure or depth",
      proficient: "Communicates clearly with good structure and relevant examples",
      expert: "Exceptional clarity, compelling narratives, and sophisticated articulation",
    },
  },
  {
    id: "problem_solving",
    name: "Problem Solving",
    description: "Approach to analyzing problems, generating solutions, and handling challenges",
    indicators: [
      "Systematic approach to problems",
      "Creative solution generation",
      "Consideration of trade-offs",
      "Learning from failures",
    ],
    levels: {
      novice: "Unable to articulate problem-solving approach or gives generic answers",
      developing: "Shows basic problem-solving but lacks depth or methodology",
      proficient: "Demonstrates clear methodology and can explain reasoning",
      expert: "Shows sophisticated analytical thinking with multiple solution paths",
    },
  },
  {
    id: "relevance",
    name: "Relevance & Role Fit",
    description: "Alignment of experience and skills with the position requirements",
    indicators: [
      "Relevant experience cited",
      "Understanding of role requirements",
      "Transferable skills demonstrated",
      "Industry/domain knowledge",
    ],
    levels: {
      novice: "Limited relevant experience; poor understanding of role",
      developing: "Some relevant experience but gaps in key areas",
      proficient: "Good alignment with role requirements and relevant experience",
      expert: "Exceptional fit with extensive directly relevant experience",
    },
  },
  {
    id: "evidence_quality",
    name: "Evidence Quality",
    description: "Use of specific examples, metrics, and concrete evidence in responses",
    indicators: [
      "Specific examples with context",
      "Quantifiable results/metrics",
      "STAR method or similar structure",
      "Verifiable claims",
    ],
    levels: {
      novice: "Vague or no examples; claims without evidence",
      developing: "General examples but lacking specificity or metrics",
      proficient: "Good use of specific examples with some quantification",
      expert: "Compelling evidence with clear metrics and verifiable outcomes",
    },
  },
] as const;

// Position-specific competencies that can be added based on role
export const POSITION_COMPETENCIES = {
  technical: {
    id: "technical_depth",
    name: "Technical Depth",
    description: "Technical knowledge and ability to discuss complex technical topics",
    indicators: [
      "Accurate technical terminology",
      "Understanding of underlying principles",
      "Awareness of trade-offs and limitations",
      "Current with industry trends",
    ],
    levels: {
      novice: "Superficial technical knowledge; incorrect or missing fundamentals",
      developing: "Basic technical understanding but gaps in depth",
      proficient: "Solid technical knowledge with good depth",
      expert: "Deep technical expertise with nuanced understanding",
    },
  },
  leadership: {
    id: "leadership",
    name: "Leadership & Influence",
    description: "Ability to lead, influence, and work with teams",
    indicators: [
      "Team leadership examples",
      "Conflict resolution",
      "Mentoring others",
      "Driving initiatives",
    ],
    levels: {
      novice: "No leadership experience; difficulty describing teamwork",
      developing: "Some team experience but limited leadership",
      proficient: "Clear leadership examples with positive outcomes",
      expert: "Extensive leadership with measurable team impact",
    },
  },
  adaptability: {
    id: "adaptability",
    name: "Adaptability & Learning",
    description: "Ability to adapt to change, learn new things, and handle ambiguity",
    indicators: [
      "Learning from failures",
      "Handling ambiguity",
      "Quick skill acquisition",
      "Flexibility in approach",
    ],
    levels: {
      novice: "Rigid approach; difficulty with change",
      developing: "Can adapt when guided but prefers structure",
      proficient: "Comfortable with change and demonstrates learning agility",
      expert: "Thrives in ambiguity; proactive learning and adaptation",
    },
  },
};

// Score thresholds for levels
export function getLevel(score: number): "novice" | "developing" | "proficient" | "expert" {
  if (score >= 85) return "expert";
  if (score >= 70) return "proficient";
  if (score >= 50) return "developing";
  return "novice";
}

/**
 * COMPETENCY WEIGHTS - LOCKED FOR THESIS EVALUATION
 * DO NOT MODIFY without updating thesis documentation
 *
 * Weights based on job performance research:
 * - Problem Solving: Higher weight as predictor of job success
 * - Communication: Essential for all roles
 * - Relevance: Direct role fit assessment
 * - Evidence Quality: Indicates depth and credibility
 */
export const COMPETENCY_WEIGHTS: Record<string, number> = {
  "Communication": 0.25,        // 25%
  "Problem Solving": 0.30,      // 30%
  "Relevance & Role Fit": 0.25, // 25%
  "Evidence Quality": 0.20,     // 20%
};

// Calculate overall score from competencies (WEIGHTED average)
// Formula: Final Score = Σ(competency_score × weight) / Σ(weights)
export function calculateOverallScore(competencies: CompetencyScore[]): number {
  if (competencies.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  competencies.forEach((c) => {
    const weight = COMPETENCY_WEIGHTS[c.competency] || 0.25; // Default equal weight
    weightedSum += c.score * weight;
    totalWeight += weight;
  });

  // Normalize if weights don't sum to 1
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// Get scoring formula for thesis documentation
export function getScoringFormula(): string {
  return `Final Score = (Communication × 25%) + (Problem Solving × 30%) + (Relevance × 25%) + (Evidence Quality × 20%)`;
}

// Determine recommendation based on scores
export function getRecommendation(
  overallScore: number,
  competencies: CompetencyScore[]
): "strong_yes" | "yes" | "maybe" | "no" {
  // Check for any critical failures (novice in any area)
  const hasNovice = competencies.some(c => c.level === "novice");

  if (overallScore >= 85 && !hasNovice) return "strong_yes";
  if (overallScore >= 70 && !hasNovice) return "yes";
  if (overallScore >= 50) return "maybe";
  return "no";
}

// Generate the evaluation prompt for AI
export function generateRubricPrompt(
  question: string,
  answer: string,
  position: string
): string {
  const competencies = CORE_COMPETENCIES.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description,
    levels: c.levels,
  }));

  return `You are evaluating an interview response using a competency-based rubric.

POSITION: ${position}

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

COMPETENCIES TO EVALUATE:
${competencies.map(c => `
${c.name}: ${c.description}
- Novice (0-49): ${c.levels.novice}
- Developing (50-69): ${c.levels.developing}
- Proficient (70-84): ${c.levels.proficient}
- Expert (85-100): ${c.levels.expert}
`).join("\n")}

Evaluate the answer and return a JSON object with this structure:
{
  "competencies": [
    {
      "competency": "Communication",
      "score": <0-100>,
      "level": "<novice|developing|proficient|expert>",
      "evidence": ["<direct quote from answer>", ...],
      "reasoning": "<why this score>"
    },
    // ... for each competency
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasForGrowth": ["<area 1>", "<area 2>"],
  "confidence": <0-100>,
  "limitations": ["<limitation of this evaluation>"]
}

CRITICAL REQUIREMENTS:
- Only evaluate based on what is EXPLICITLY stated in the transcript
- Evidence MUST be exact verbatim quotes from the answer - do NOT paraphrase or invent
- If you cannot find a direct quote, leave evidence array empty and note this in limitations
- Be honest about limitations and confidence
- Do not infer qualities not demonstrated in the answer
- Consider the specific position requirements
- If answer is too short or vague, score lower and explain why in reasoning`;
}

// Parse AI response into RubricEvaluation
export function parseRubricResponse(response: string): RubricEvaluation | null {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and construct evaluation
    const competencies: CompetencyScore[] = (parsed.competencies || []).map((c: any) => ({
      competency: c.competency || "",
      score: Math.max(0, Math.min(100, Number(c.score) || 0)),
      level: getLevel(Number(c.score) || 0),
      evidence: Array.isArray(c.evidence) ? c.evidence : [],
      reasoning: c.reasoning || "",
    }));

    const overallScore = calculateOverallScore(competencies);

    return {
      competencies,
      overallScore,
      strengths: parsed.strengths || [],
      areasForGrowth: parsed.areasForGrowth || [],
      recommendation: getRecommendation(overallScore, competencies),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 70)),
      limitations: parsed.limitations || [],
    };
  } catch (error) {
    console.error("Failed to parse rubric response:", error);
    return null;
  }
}

// Dynamic competency type for O*NET integration
export interface DynamicCompetency {
  id: string;
  name: string;
  description: string;
  source: "onet" | "core" | "custom";
  indicators: string[];
  levels: {
    novice: string;
    developing: string;
    proficient: string;
    expert: string;
  };
}

// Generate dynamic competencies from O*NET skills
export function createOnetCompetencies(skills: string[]): DynamicCompetency[] {
  return skills.map((skill, index) => ({
    id: `onet_${index}`,
    name: skill,
    description: `Ability to demonstrate ${skill.toLowerCase()} in professional contexts`,
    source: "onet" as const,
    indicators: [
      `Shows understanding of ${skill.toLowerCase()}`,
      `Provides relevant examples of ${skill.toLowerCase()}`,
      `Demonstrates practical application`,
    ],
    levels: {
      novice: `Limited understanding or experience with ${skill.toLowerCase()}`,
      developing: `Basic understanding but limited practical experience`,
      proficient: `Solid understanding with relevant experience`,
      expert: `Deep expertise with demonstrated impact`,
    },
  }));
}

// Generate rubric prompt with O*NET competencies
export function generateDynamicRubricPrompt(
  question: string,
  answer: string,
  position: string,
  onetCompetencies: string[]
): string {
  // Combine core competencies with O*NET-specific ones
  const allCompetencies = [
    ...CORE_COMPETENCIES.slice(0, 2), // Communication and Problem Solving
    ...createOnetCompetencies(onetCompetencies.slice(0, 4)), // Top 4 O*NET skills
  ];

  return `You are evaluating an interview response using a competency-based rubric.

POSITION: ${position}

QUESTION: ${question}

CANDIDATE'S ANSWER: ${answer}

COMPETENCIES TO EVALUATE:
${allCompetencies.map(c => `
${c.name}: ${c.description}
- Novice (0-49): ${c.levels.novice}
- Developing (50-69): ${c.levels.developing}
- Proficient (70-84): ${c.levels.proficient}
- Expert (85-100): ${c.levels.expert}
`).join("\n")}

NOTE: These competencies are derived from O*NET occupational data for the ${position} role.

Evaluate the answer and return a JSON object with this structure:
{
  "competencies": [
    {
      "competency": "<competency name>",
      "score": <0-100>,
      "level": "<novice|developing|proficient|expert>",
      "evidence": ["<direct quote from answer>", ...],
      "reasoning": "<why this score>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "areasForGrowth": ["<area 1>", "<area 2>"],
  "confidence": <0-100>,
  "limitations": ["<limitation of this evaluation>"],
  "onetAlignment": "<how well the answer aligns with role requirements>"
}

IMPORTANT:
- Only evaluate based on what is IN the transcript
- Cite specific quotes as evidence
- Be honest about limitations and confidence
- Do not infer qualities not demonstrated in the answer
- Consider the specific O*NET-defined requirements for this role`;
}
