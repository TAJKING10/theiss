// Comprehensive interview questions database
// Categories: behavioral, technical, situational, leadership, cultural

export interface InterviewQuestionData {
  question: string;
  category: "behavioral" | "technical" | "situational" | "leadership" | "cultural";
  assesses: string;
  followUps: string[];
  lookFor: string[];
  difficulty: "easy" | "medium" | "hard";
  roles: string[]; // Which roles this question applies to
}

// Universal behavioral questions (all roles)
export const behavioralQuestions: InterviewQuestionData[] = [
  {
    question: "Tell me about a time when you had to deal with a difficult coworker or team member. How did you handle the situation?",
    category: "behavioral",
    assesses: "Conflict resolution, interpersonal skills, emotional intelligence",
    followUps: [
      "What was the outcome?",
      "What would you do differently if faced with a similar situation?",
      "How did this experience change your approach to teamwork?"
    ],
    lookFor: [
      "Specific example with clear context",
      "Focus on their own actions, not blaming others",
      "Evidence of empathy and understanding",
      "Positive or constructive outcome"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "Describe a situation where you had to learn something new quickly. How did you approach it?",
    category: "behavioral",
    assesses: "Learning agility, adaptability, resourcefulness",
    followUps: [
      "What resources did you use?",
      "How long did it take you to become proficient?",
      "How have you applied this learning since?"
    ],
    lookFor: [
      "Structured approach to learning",
      "Use of multiple learning resources",
      "Self-awareness about learning style",
      "Application of new knowledge"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "Tell me about a time you failed at something. What did you learn from it?",
    category: "behavioral",
    assesses: "Self-awareness, growth mindset, accountability",
    followUps: [
      "How did you feel in the moment?",
      "What specific changes did you make afterward?",
      "Have you faced a similar situation since? How did you handle it?"
    ],
    lookFor: [
      "Honest acknowledgment of failure",
      "Takes responsibility, doesn't blame others",
      "Clear learnings and growth",
      "Evidence of applying those learnings"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "Describe a time when you had to work under tight deadlines. How did you manage your time and priorities?",
    category: "behavioral",
    assesses: "Time management, prioritization, stress management",
    followUps: [
      "What tools or methods did you use to stay organized?",
      "Did you have to say no to anything? How did you handle that?",
      "What would you do differently next time?"
    ],
    lookFor: [
      "Clear prioritization strategy",
      "Communication with stakeholders",
      "Quality maintained despite pressure",
      "Proactive problem-solving"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "Give me an example of a goal you set for yourself and how you achieved it.",
    category: "behavioral",
    assesses: "Goal setting, self-motivation, follow-through",
    followUps: [
      "How did you track your progress?",
      "What obstacles did you face?",
      "How did achieving this goal impact you?"
    ],
    lookFor: [
      "SMART goal characteristics",
      "Persistence through challenges",
      "Self-directed action",
      "Measurable outcome"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "Tell me about a time you received constructive criticism. How did you respond?",
    category: "behavioral",
    assesses: "Receptiveness to feedback, humility, growth mindset",
    followUps: [
      "Who gave you the feedback?",
      "What changes did you make as a result?",
      "Do you actively seek feedback now?"
    ],
    lookFor: [
      "Open and non-defensive response",
      "Specific actions taken",
      "Appreciation for the feedback",
      "Ongoing improvement"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "Describe a situation where you had to convince someone to see things your way.",
    category: "behavioral",
    assesses: "Persuasion, communication, stakeholder management",
    followUps: [
      "What approach did you take?",
      "How did you understand their perspective first?",
      "What was the final outcome?"
    ],
    lookFor: [
      "Empathy and active listening",
      "Data-driven arguments",
      "Win-win solutions",
      "Respectful approach"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "Tell me about a time you went above and beyond what was expected of you.",
    category: "behavioral",
    assesses: "Initiative, work ethic, dedication",
    followUps: [
      "What motivated you to do more?",
      "How did others respond?",
      "Is this something you do regularly?"
    ],
    lookFor: [
      "Genuine motivation (not just seeking recognition)",
      "Positive impact on team or project",
      "Sustainable approach (not burnout-inducing)",
      "Awareness of when extra effort is valuable"
    ],
    difficulty: "easy",
    roles: ["all"]
  }
];

// Technical questions for developers/engineers
export const technicalQuestions: InterviewQuestionData[] = [
  {
    question: "Describe the most challenging technical problem you've solved. Walk me through your approach.",
    category: "technical",
    assesses: "Problem-solving, technical depth, analytical thinking",
    followUps: [
      "What alternatives did you consider?",
      "How did you validate your solution?",
      "What would you do differently now?"
    ],
    lookFor: [
      "Clear problem definition",
      "Systematic debugging approach",
      "Consideration of trade-offs",
      "Technical depth appropriate to level"
    ],
    difficulty: "hard",
    roles: ["developer", "engineer", "software", "technical"]
  },
  {
    question: "How do you ensure the code you write is maintainable and scalable?",
    category: "technical",
    assesses: "Code quality, best practices, forward thinking",
    followUps: [
      "Can you give a specific example?",
      "How do you balance speed vs. quality?",
      "What tools or processes do you use?"
    ],
    lookFor: [
      "Mentions testing (unit, integration)",
      "Code review practices",
      "Documentation habits",
      "Design patterns knowledge"
    ],
    difficulty: "medium",
    roles: ["developer", "engineer", "software", "technical"]
  },
  {
    question: "Explain a complex technical concept to me as if I were non-technical.",
    category: "technical",
    assesses: "Communication, understanding depth, simplification",
    followUps: [
      "How do you know if someone understood?",
      "How do you adjust your explanation for different audiences?"
    ],
    lookFor: [
      "Avoids jargon or explains it",
      "Uses relatable analogies",
      "Checks for understanding",
      "Patient and clear"
    ],
    difficulty: "medium",
    roles: ["developer", "engineer", "software", "technical"]
  },
  {
    question: "How do you stay updated with new technologies and programming trends?",
    category: "technical",
    assesses: "Continuous learning, curiosity, self-improvement",
    followUps: [
      "What's the most recent thing you learned?",
      "How do you decide what to learn next?",
      "Have you applied any new learning to your work?"
    ],
    lookFor: [
      "Active learning habits",
      "Balance of breadth and depth",
      "Practical application",
      "Community involvement"
    ],
    difficulty: "easy",
    roles: ["developer", "engineer", "software", "technical"]
  },
  {
    question: "Describe how you would design a system to handle millions of users.",
    category: "technical",
    assesses: "System design, scalability thinking, architecture knowledge",
    followUps: [
      "How would you handle database scaling?",
      "What about caching strategies?",
      "How would you ensure reliability?"
    ],
    lookFor: [
      "Horizontal scaling concepts",
      "Load balancing awareness",
      "Database optimization",
      "Caching strategies"
    ],
    difficulty: "hard",
    roles: ["developer", "engineer", "software", "senior", "architect"]
  },
  {
    question: "Tell me about a time you had to debug a production issue. What was your process?",
    category: "technical",
    assesses: "Debugging skills, pressure handling, systematic thinking",
    followUps: [
      "How did you prioritize?",
      "What tools did you use?",
      "How did you prevent it from happening again?"
    ],
    lookFor: [
      "Calm under pressure",
      "Systematic debugging approach",
      "Root cause analysis",
      "Prevention measures implemented"
    ],
    difficulty: "medium",
    roles: ["developer", "engineer", "software", "devops", "sre"]
  },
  {
    question: "How do you approach code reviews, both giving and receiving?",
    category: "technical",
    assesses: "Collaboration, code quality standards, communication",
    followUps: [
      "What do you look for when reviewing?",
      "How do you give constructive feedback?",
      "How do you handle disagreements?"
    ],
    lookFor: [
      "Constructive feedback approach",
      "Focus on code, not person",
      "Balance of thoroughness and timeliness",
      "Open to receiving feedback"
    ],
    difficulty: "easy",
    roles: ["developer", "engineer", "software", "technical"]
  }
];

// Leadership and management questions
export const leadershipQuestions: InterviewQuestionData[] = [
  {
    question: "Describe your leadership style. How do you adapt it to different situations or team members?",
    category: "leadership",
    assesses: "Self-awareness, adaptability, leadership philosophy",
    followUps: [
      "Can you give an example of when you adapted?",
      "How do you identify what style someone needs?",
      "What's been your biggest leadership challenge?"
    ],
    lookFor: [
      "Clear leadership philosophy",
      "Evidence of situational adaptability",
      "Self-awareness about strengths/weaknesses",
      "Focus on team success"
    ],
    difficulty: "medium",
    roles: ["manager", "lead", "director", "vp", "executive", "supervisor"]
  },
  {
    question: "Tell me about a time you had to make a difficult decision that wasn't popular with your team.",
    category: "leadership",
    assesses: "Decision-making, communication, courage",
    followUps: [
      "How did you communicate the decision?",
      "How did you handle the pushback?",
      "What was the outcome?"
    ],
    lookFor: [
      "Clear reasoning process",
      "Transparency in communication",
      "Empathy for team concerns",
      "Stood by decision while remaining open"
    ],
    difficulty: "hard",
    roles: ["manager", "lead", "director", "vp", "executive", "supervisor"]
  },
  {
    question: "How do you handle underperforming team members?",
    category: "leadership",
    assesses: "Performance management, coaching, difficult conversations",
    followUps: [
      "Can you walk me through a specific example?",
      "How do you balance support with accountability?",
      "What if improvement doesn't happen?"
    ],
    lookFor: [
      "Clear expectations setting",
      "Regular feedback and support",
      "Documentation practices",
      "Fair but firm approach"
    ],
    difficulty: "hard",
    roles: ["manager", "lead", "director", "vp", "executive", "supervisor"]
  },
  {
    question: "How do you build and maintain trust with your team?",
    category: "leadership",
    assesses: "Trust-building, relationship management, integrity",
    followUps: [
      "What's most important for building trust?",
      "How do you rebuild trust if it's broken?",
      "How do you balance being friendly with being a leader?"
    ],
    lookFor: [
      "Consistency in actions",
      "Transparency and honesty",
      "Following through on commitments",
      "Creating psychological safety"
    ],
    difficulty: "medium",
    roles: ["manager", "lead", "director", "vp", "executive", "supervisor"]
  },
  {
    question: "Describe how you've developed or mentored someone on your team.",
    category: "leadership",
    assesses: "Coaching, development focus, investment in others",
    followUps: [
      "How did you identify their development needs?",
      "What approach did you take?",
      "What was the outcome for them?"
    ],
    lookFor: [
      "Genuine interest in development",
      "Structured approach",
      "Balance of challenge and support",
      "Pride in others' growth"
    ],
    difficulty: "medium",
    roles: ["manager", "lead", "director", "vp", "executive", "supervisor", "senior"]
  },
  {
    question: "How do you prioritize competing demands from multiple stakeholders?",
    category: "leadership",
    assesses: "Prioritization, stakeholder management, strategic thinking",
    followUps: [
      "How do you communicate priorities?",
      "How do you handle pushback from those deprioritized?",
      "What framework do you use?"
    ],
    lookFor: [
      "Clear prioritization framework",
      "Stakeholder communication skills",
      "Data-driven decisions",
      "Alignment with organizational goals"
    ],
    difficulty: "hard",
    roles: ["manager", "lead", "director", "vp", "executive", "product"]
  }
];

// Situational questions (hypothetical scenarios)
export const situationalQuestions: InterviewQuestionData[] = [
  {
    question: "If you discovered a colleague was not following company policy, what would you do?",
    category: "situational",
    assesses: "Ethics, judgment, conflict handling",
    followUps: [
      "What if it was your manager?",
      "What if it was a minor vs. major violation?",
      "How would you balance loyalty with integrity?"
    ],
    lookFor: [
      "Ethical reasoning",
      "Balanced approach",
      "Understanding of proper channels",
      "Courage to act"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "How would you handle a situation where you strongly disagree with a decision made by leadership?",
    category: "situational",
    assesses: "Professional maturity, disagreement handling, commitment",
    followUps: [
      "At what point would you escalate?",
      "How would you communicate your concerns?",
      "What if they still didn't change the decision?"
    ],
    lookFor: [
      "Respectful disagreement",
      "Proper channels used",
      "Data-driven arguments",
      "Commitment after decision"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "Imagine you're assigned a project with unclear requirements. How would you proceed?",
    category: "situational",
    assesses: "Ambiguity handling, initiative, communication",
    followUps: [
      "Who would you talk to first?",
      "What if you couldn't get clarity?",
      "How would you manage stakeholder expectations?"
    ],
    lookFor: [
      "Proactive clarification seeking",
      "Stakeholder identification",
      "Risk management",
      "Iterative approach"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "If you were overwhelmed with work and a colleague asked for help, what would you do?",
    category: "situational",
    assesses: "Teamwork, boundary setting, prioritization",
    followUps: [
      "How would you decide whether to help?",
      "How would you communicate if you couldn't help?",
      "What if it was urgent for them?"
    ],
    lookFor: [
      "Team-first mentality",
      "Honest communication",
      "Creative problem-solving",
      "Healthy boundary setting"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "You notice a significant bug in production that no one else has found. It's Friday evening. What do you do?",
    category: "situational",
    assesses: "Responsibility, judgment, urgency assessment",
    followUps: [
      "How do you assess the severity?",
      "Who do you notify?",
      "What if the fix could cause other issues?"
    ],
    lookFor: [
      "Ownership mentality",
      "Proper escalation",
      "Risk assessment",
      "Communication"
    ],
    difficulty: "medium",
    roles: ["developer", "engineer", "software", "technical", "devops", "sre"]
  }
];

// Cultural fit questions
export const culturalQuestions: InterviewQuestionData[] = [
  {
    question: "What type of work environment do you thrive in?",
    category: "cultural",
    assesses: "Self-awareness, cultural fit, work preferences",
    followUps: [
      "Can you give an example of an environment where you thrived?",
      "What about one where you struggled?",
      "How do you adapt to different environments?"
    ],
    lookFor: [
      "Self-awareness",
      "Honest preferences",
      "Flexibility",
      "Alignment with company culture"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "How do you handle working with people who have different working styles than yours?",
    category: "cultural",
    assesses: "Collaboration, adaptability, emotional intelligence",
    followUps: [
      "Can you give a specific example?",
      "What's most challenging for you?",
      "What have you learned from diverse teams?"
    ],
    lookFor: [
      "Openness to different styles",
      "Adaptation strategies",
      "Focus on results over methods",
      "Appreciation of diversity"
    ],
    difficulty: "medium",
    roles: ["all"]
  },
  {
    question: "What motivates you to do your best work?",
    category: "cultural",
    assesses: "Intrinsic motivation, values, engagement drivers",
    followUps: [
      "How do you stay motivated during routine tasks?",
      "What demotivates you?",
      "How do you handle periods of low motivation?"
    ],
    lookFor: [
      "Intrinsic motivation (not just money)",
      "Alignment with role",
      "Self-management",
      "Sustainable motivation"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "How do you balance work and personal life?",
    category: "cultural",
    assesses: "Work-life balance, sustainability, self-care",
    followUps: [
      "How do you handle busy periods?",
      "What boundaries do you set?",
      "How has this evolved in your career?"
    ],
    lookFor: [
      "Clear boundaries",
      "Sustainable practices",
      "Flexibility when needed",
      "Not glorifying overwork"
    ],
    difficulty: "easy",
    roles: ["all"]
  },
  {
    question: "What does diversity and inclusion mean to you in the workplace?",
    category: "cultural",
    assesses: "Inclusivity mindset, awareness, values",
    followUps: [
      "How have you contributed to an inclusive environment?",
      "What challenges have you seen?",
      "How do you ensure all voices are heard?"
    ],
    lookFor: [
      "Genuine understanding",
      "Active not passive approach",
      "Specific examples",
      "Awareness of unconscious bias"
    ],
    difficulty: "medium",
    roles: ["all"]
  }
];

// Designer-specific questions
export const designerQuestions: InterviewQuestionData[] = [
  {
    question: "Walk me through your design process from start to finish.",
    category: "technical",
    assesses: "Design methodology, process thinking, completeness",
    followUps: [
      "How do you handle constraints?",
      "How do you involve stakeholders?",
      "How do you know when a design is done?"
    ],
    lookFor: [
      "User-centered approach",
      "Research foundation",
      "Iteration mindset",
      "Stakeholder involvement"
    ],
    difficulty: "medium",
    roles: ["designer", "ux", "ui", "product designer"]
  },
  {
    question: "How do you handle feedback or criticism on your designs?",
    category: "behavioral",
    assesses: "Receptiveness, ego management, collaboration",
    followUps: [
      "How do you distinguish helpful from unhelpful feedback?",
      "How do you push back when you disagree?",
      "How do you incorporate feedback iteratively?"
    ],
    lookFor: [
      "Open to critique",
      "Separates self from work",
      "Seeks understanding",
      "Professional disagreement"
    ],
    difficulty: "medium",
    roles: ["designer", "ux", "ui", "product designer"]
  },
  {
    question: "How do you balance user needs with business requirements?",
    category: "technical",
    assesses: "Business acumen, user advocacy, compromise",
    followUps: [
      "Can you give an example of this tension?",
      "How do you advocate for users?",
      "When is it okay to compromise on user experience?"
    ],
    lookFor: [
      "User advocacy",
      "Business understanding",
      "Creative solutions",
      "Data-driven decisions"
    ],
    difficulty: "hard",
    roles: ["designer", "ux", "ui", "product designer"]
  },
  {
    question: "How do you approach accessibility in your designs?",
    category: "technical",
    assesses: "Accessibility knowledge, inclusivity, thoroughness",
    followUps: [
      "What standards do you follow?",
      "How do you test for accessibility?",
      "How do you handle trade-offs?"
    ],
    lookFor: [
      "WCAG knowledge",
      "Proactive inclusion",
      "Testing practices",
      "Beyond minimum compliance"
    ],
    difficulty: "medium",
    roles: ["designer", "ux", "ui", "product designer"]
  }
];

// Product Manager questions
export const productManagerQuestions: InterviewQuestionData[] = [
  {
    question: "How do you prioritize features when you have limited resources?",
    category: "technical",
    assesses: "Prioritization, strategic thinking, stakeholder management",
    followUps: [
      "What frameworks do you use?",
      "How do you handle pushback on priorities?",
      "How do you communicate trade-offs?"
    ],
    lookFor: [
      "Clear framework (RICE, Impact/Effort, etc.)",
      "Data-driven decisions",
      "Stakeholder alignment",
      "Clear communication"
    ],
    difficulty: "medium",
    roles: ["product manager", "product", "pm"]
  },
  {
    question: "Tell me about a product you launched. What went well and what would you do differently?",
    category: "behavioral",
    assesses: "Execution, learning, reflection",
    followUps: [
      "What metrics defined success?",
      "How did you handle unexpected challenges?",
      "What did you learn about your users?"
    ],
    lookFor: [
      "Clear ownership",
      "Metrics-driven thinking",
      "Honest reflection",
      "Learning mindset"
    ],
    difficulty: "medium",
    roles: ["product manager", "product", "pm"]
  },
  {
    question: "How do you work with engineering teams to deliver products?",
    category: "behavioral",
    assesses: "Cross-functional collaboration, communication, respect",
    followUps: [
      "How do you handle technical pushback?",
      "How detailed do your specs get?",
      "How do you handle scope changes?"
    ],
    lookFor: [
      "Partnership mentality",
      "Technical appreciation",
      "Clear communication",
      "Flexibility"
    ],
    difficulty: "medium",
    roles: ["product manager", "product", "pm"]
  },
  {
    question: "How do you validate product ideas before investing in development?",
    category: "technical",
    assesses: "Validation methods, research skills, risk mitigation",
    followUps: [
      "What types of research do you use?",
      "How do you balance speed vs. certainty?",
      "What's the cheapest way to validate?"
    ],
    lookFor: [
      "Multiple validation methods",
      "User research focus",
      "Hypothesis-driven",
      "Resource awareness"
    ],
    difficulty: "medium",
    roles: ["product manager", "product", "pm"]
  }
];

// Get questions by role and type
export function getQuestionsByRole(role: string): InterviewQuestionData[] {
  const roleLower = role.toLowerCase();
  const allQuestions = [
    ...behavioralQuestions,
    ...technicalQuestions,
    ...leadershipQuestions,
    ...situationalQuestions,
    ...culturalQuestions,
    ...designerQuestions,
    ...productManagerQuestions,
  ];

  return allQuestions.filter((q) => {
    if (q.roles.includes("all")) return true;
    return q.roles.some((r) => roleLower.includes(r));
  });
}

// Get a balanced set of questions for an interview
export function getBalancedQuestionSet(
  role: string,
  count: number = 10
): InterviewQuestionData[] {
  const availableQuestions = getQuestionsByRole(role);
  const categories = ["behavioral", "technical", "situational", "cultural"];

  const selected: InterviewQuestionData[] = [];
  let categoryIndex = 0;

  // Rotate through categories to get balanced coverage
  while (selected.length < count && availableQuestions.length > 0) {
    const category = categories[categoryIndex % categories.length];
    const categoryQuestions = availableQuestions.filter(
      (q) => q.category === category && !selected.includes(q)
    );

    if (categoryQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
      selected.push(categoryQuestions[randomIndex]);
    }

    categoryIndex++;

    // Safety check to avoid infinite loop
    if (categoryIndex > count * 4) break;
  }

  // If we still need more, add any remaining questions
  while (selected.length < count && availableQuestions.length > selected.length) {
    const remaining = availableQuestions.filter((q) => !selected.includes(q));
    if (remaining.length === 0) break;
    const randomIndex = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[randomIndex]);
  }

  return selected;
}

// Export all questions
export const allQuestions = [
  ...behavioralQuestions,
  ...technicalQuestions,
  ...leadershipQuestions,
  ...situationalQuestions,
  ...culturalQuestions,
  ...designerQuestions,
  ...productManagerQuestions,
];
