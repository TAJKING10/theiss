/**
 * O*NET Web Services Integration
 *
 * Provides access to O*NET's occupational data for evidence-based
 * competency assessment. O*NET is the U.S. Department of Labor's
 * database of occupational requirements and worker characteristics.
 *
 * Features:
 * - Search occupations by title/keyword
 * - Get detailed competencies for occupations
 * - Map O*NET competencies to interview rubric
 *
 * Note: Requires O*NET Web Services credentials (free registration)
 * Set ONET_USERNAME and ONET_PASSWORD in environment variables
 */

const ONET_BASE_URL = "https://services.onetcenter.org/ws";

interface OnetOccupation {
  code: string;
  title: string;
  description?: string;
}

interface OnetElement {
  id: string;
  name: string;
  description: string;
  score: {
    value: number;
    importance?: number;
  };
}

interface OnetCompetency {
  category: string;
  elements: OnetElement[];
}

export interface OnetOccupationDetails {
  code: string;
  title: string;
  description: string;
  abilities: OnetElement[];
  skills: OnetElement[];
  knowledge: OnetElement[];
  workActivities: OnetElement[];
  workStyles: OnetElement[];
}

// Authentication header for O*NET Web Services
function getAuthHeader(): string {
  const username = process.env.ONET_USERNAME || "demo";
  const password = process.env.ONET_PASSWORD || "demo";
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

// Search for occupations by keyword
export async function searchOccupations(keyword: string): Promise<OnetOccupation[]> {
  try {
    const response = await fetch(
      `${ONET_BASE_URL}/online/search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          Authorization: getAuthHeader(),
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("O*NET search failed:", response.status);
      return [];
    }

    const data = await response.json();
    return (data.occupation || []).map((occ: any) => ({
      code: occ.code,
      title: occ.title,
      description: occ.description,
    }));
  } catch (error) {
    console.error("O*NET search error:", error);
    return [];
  }
}

// Get occupation details by SOC code
export async function getOccupationDetails(code: string): Promise<OnetOccupationDetails | null> {
  try {
    // Fetch multiple data elements in parallel
    const [abilitiesRes, skillsRes, knowledgeRes, activitiesRes, stylesRes] = await Promise.all([
      fetch(`${ONET_BASE_URL}/online/occupations/${code}/abilities`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      }),
      fetch(`${ONET_BASE_URL}/online/occupations/${code}/skills`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      }),
      fetch(`${ONET_BASE_URL}/online/occupations/${code}/knowledge`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      }),
      fetch(`${ONET_BASE_URL}/online/occupations/${code}/work_activities`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      }),
      fetch(`${ONET_BASE_URL}/online/occupations/${code}/work_styles`, {
        headers: { Authorization: getAuthHeader(), Accept: "application/json" },
      }),
    ]);

    const parseElements = async (res: Response): Promise<OnetElement[]> => {
      if (!res.ok) return [];
      const data = await res.json();
      return (data.element || []).map((el: any) => ({
        id: el.id,
        name: el.name,
        description: el.description || "",
        score: {
          value: el.score?.value || 0,
          importance: el.score?.importance,
        },
      }));
    };

    const [abilities, skills, knowledge, workActivities, workStyles] = await Promise.all([
      parseElements(abilitiesRes),
      parseElements(skillsRes),
      parseElements(knowledgeRes),
      parseElements(activitiesRes),
      parseElements(stylesRes),
    ]);

    return {
      code,
      title: code.split("-").join(" "), // Placeholder title
      description: "",
      abilities: abilities.slice(0, 10), // Top 10
      skills: skills.slice(0, 10),
      knowledge: knowledge.slice(0, 10),
      workActivities: workActivities.slice(0, 10),
      workStyles: workStyles.slice(0, 10),
    };
  } catch (error) {
    console.error("O*NET occupation details error:", error);
    return null;
  }
}

// Map O*NET data to interview competencies
export function mapToInterviewCompetencies(onetData: OnetOccupationDetails): {
  suggestedCompetencies: string[];
  skills: string[];
  knowledge: string[];
  workStyles: string[];
} {
  return {
    suggestedCompetencies: [
      ...onetData.skills.slice(0, 5).map((s) => s.name),
      ...onetData.abilities.slice(0, 3).map((a) => a.name),
    ],
    skills: onetData.skills.map((s) => s.name),
    knowledge: onetData.knowledge.map((k) => k.name),
    workStyles: onetData.workStyles.map((w) => w.name),
  };
}

// Common position mappings (fallback when O*NET is unavailable)
const POSITION_COMPETENCY_MAP: Record<string, string[]> = {
  "software engineer": [
    "Programming",
    "Problem Solving",
    "Systems Analysis",
    "Critical Thinking",
    "Complex Problem Solving",
    "Technical Communication",
  ],
  "product manager": [
    "Decision Making",
    "Communication",
    "Strategic Planning",
    "Leadership",
    "Analytical Thinking",
    "Stakeholder Management",
  ],
  "data scientist": [
    "Data Analysis",
    "Machine Learning",
    "Statistics",
    "Programming",
    "Problem Solving",
    "Communication",
  ],
  "ux designer": [
    "User Research",
    "Visual Design",
    "Prototyping",
    "Communication",
    "Empathy",
    "Problem Solving",
  ],
  "marketing manager": [
    "Marketing Strategy",
    "Communication",
    "Data Analysis",
    "Creativity",
    "Leadership",
    "Budget Management",
  ],
  "hr manager": [
    "Employee Relations",
    "Communication",
    "Conflict Resolution",
    "Organizational Development",
    "Compliance",
    "Leadership",
  ],
  default: [
    "Communication",
    "Problem Solving",
    "Teamwork",
    "Adaptability",
    "Time Management",
    "Leadership",
  ],
};

/**
 * Get competencies for a position with graceful fallback
 *
 * THESIS DOCUMENTATION:
 * - Primary source: O*NET Web Services API (when available)
 * - Fallback: Static position-competency mappings
 *
 * When O*NET is available:
 * - Competencies are grounded in DOL occupational research
 * - Includes skills, knowledge, abilities from O*NET database
 *
 * When O*NET is unavailable (fallback mode):
 * - Uses curated static mappings for common positions
 * - This is a LIMITATION acknowledged in thesis
 * - Competencies are less role-specific
 */
export async function getCompetenciesForPosition(position: string): Promise<{
  source: "onet" | "fallback";
  competencies: string[];
  skills: string[];
  knowledge: string[];
  onetCode?: string;
  limitation?: string;
}> {
  const normalizedPosition = position.toLowerCase().trim();

  // Try O*NET first
  try {
    const occupations = await searchOccupations(normalizedPosition);
    if (occupations.length > 0) {
      const details = await getOccupationDetails(occupations[0].code);
      if (details) {
        const mapped = mapToInterviewCompetencies(details);
        return {
          source: "onet",
          competencies: mapped.suggestedCompetencies,
          skills: mapped.skills,
          knowledge: mapped.knowledge,
          onetCode: occupations[0].code,
        };
      }
    }
  } catch (error) {
    console.error("O*NET lookup failed, using fallback:", error);
  }

  // Fallback to static mapping
  const fallbackCompetencies =
    POSITION_COMPETENCY_MAP[normalizedPosition] ||
    Object.entries(POSITION_COMPETENCY_MAP).find(([key]) =>
      normalizedPosition.includes(key)
    )?.[1] ||
    POSITION_COMPETENCY_MAP.default;

  return {
    source: "fallback",
    competencies: fallbackCompetencies,
    skills: fallbackCompetencies,
    knowledge: [],
    limitation: "O*NET unavailable - using static competency mapping. Competencies may be less role-specific.",
  };
}

// Generate interview questions based on O*NET competencies
export function generateCompetencyQuestions(competencies: string[]): {
  competency: string;
  question: string;
  type: "behavioral" | "technical" | "situational";
}[] {
  const questionTemplates = {
    behavioral: [
      "Tell me about a time when you demonstrated {competency}.",
      "Can you describe a situation where you used {competency} to solve a problem?",
      "Give me an example of when {competency} was crucial to your success.",
    ],
    technical: [
      "How would you approach a situation requiring {competency}?",
      "What tools or methods do you use for {competency}?",
      "Describe your experience with {competency}.",
    ],
    situational: [
      "How would you handle a scenario where {competency} is critical?",
      "What would you do if you needed to apply {competency} under pressure?",
    ],
  };

  return competencies.map((competency, index) => {
    const type =
      index % 3 === 0
        ? "behavioral"
        : index % 3 === 1
          ? "technical"
          : "situational";
    const templates = questionTemplates[type];
    const question = templates[Math.floor(Math.random() * templates.length)].replace(
      "{competency}",
      competency.toLowerCase()
    );

    return { competency, question, type };
  });
}
