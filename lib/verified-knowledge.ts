export type VerifiedKnowledgeItem = {
  id: string;
  title: string;
  category:
    | "CAREER"
    | "SKILL"
    | "LEARNING"
    | "RESUME"
    | "INTERVIEW"
    | "OPPORTUNITY";
  keywords: string[];
  content: string;
  source: string;
};

export const VERIFIED_KNOWLEDGE: VerifiedKnowledgeItem[] = [
  {
    id: "career-cloud-devops",
    title: "Cloud / DevOps Engineer skill framework",
    category: "CAREER",
    keywords: [
      "cloud",
      "devops",
      "engineer",
      "aws",
      "azure",
      "linux",
      "docker",
      "terraform",
      "ci/cd",
      "networking",
    ],
    content:
      "The CareerIntel Cloud / DevOps target-role framework emphasizes Linux, cloud platforms such as AWS or Azure, Docker, CI/CD, infrastructure as code with Terraform, and computer networking. Career readiness should be evaluated against the learner's current skill levels and the required levels for the target role.",
    source: "CareerIntel role skill framework",
  },
  {
    id: "skill-gap-method",
    title: "CareerIntel skill-gap analysis method",
    category: "SKILL",
    keywords: [
      "skill gap",
      "gap",
      "missing skill",
      "readiness",
      "assessment",
      "skills",
    ],
    content:
      "CareerIntel compares the learner's current skill level with the required target-role level. The difference is represented as a skill gap, and larger gaps should receive higher preparation priority.",
    source: "CareerIntel skill-gap engine",
  },
  {
    id: "learning-path",
    title: "CareerIntel preparation model",
    category: "LEARNING",
    keywords: [
      "learn",
      "practice",
      "prove",
      "roadmap",
      "learning",
      "project",
      "prepare",
      "preparation",
    ],
    content:
      "CareerIntel uses a Learn → Practice → Prove preparation model. Learners should first build conceptual understanding, then complete practical exercises, and finally demonstrate capability through measurable evidence such as projects, assessments, or interview performance.",
    source: "CareerIntel preparation framework",
  },
  {
    id: "resume-readiness",
    title: "Resume readiness guidance",
    category: "RESUME",
    keywords: [
      "resume",
      "cv",
      "ats",
      "ats score",
      "keywords",
      "job application",
    ],
    content:
      "CareerIntel uses ATS analysis to identify resume strengths, missing keywords, and improvements. Resume guidance should be aligned to the learner's target role and should prioritize concrete evidence, relevant skills, project outcomes, and role-specific terminology.",
    source: "CareerIntel resume analysis module",
  },
  {
    id: "interview-preparation",
    title: "Interview preparation guidance",
    category: "INTERVIEW",
    keywords: [
      "interview",
      "technical interview",
      "mock interview",
      "question",
      "answer",
    ],
    content:
      "CareerIntel's interview workflow generates role-focused technical questions, evaluates candidate answers for correctness, relevance, clarity, practical understanding and completeness, and provides strengths, improvements and an ideal answer.",
    source: "CareerIntel interview intelligence module",
  },
  {
    id: "opportunity-matching",
    title: "Opportunity matching guidance",
    category: "OPPORTUNITY",
    keywords: [
      "internship",
      "project",
      "opportunity",
      "job",
      "matching",
      "match score",
      "apply",
    ],
    content:
      "CareerIntel matches opportunities against the learner's current skills, target role and readiness. Recommendations should explain why an opportunity is relevant and identify missing skills that may affect readiness.",
    source: "CareerIntel opportunity intelligence module",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function retrieveVerifiedKnowledge(
  query: string,
  limit = 3
): VerifiedKnowledgeItem[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const queryTerms = new Set(
    normalizedQuery
      .split(" ")
      .filter((term) => term.length >= 3)
  );

  return VERIFIED_KNOWLEDGE
    .map((item) => {
      const searchable = normalize(
        [
          item.title,
          item.category,
          item.keywords.join(" "),
          item.content,
        ].join(" ")
      );

      let score = 0;

      if (searchable.includes(normalizedQuery)) {
        score += 5;
      }

      for (const term of queryTerms) {
        if (searchable.includes(term)) {
          score += 1;
        }
      }

      for (const keyword of item.keywords) {
        const normalizedKeyword = normalize(keyword);

        if (
          normalizedQuery.includes(normalizedKeyword)
        ) {
          score += 3;
        }
      }

      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
