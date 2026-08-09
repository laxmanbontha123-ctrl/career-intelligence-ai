export type RequiredSkill = {
  name: string;
  category: string;
  requiredLevel: number;
};

export const roleSkillMap: Record<string, RequiredSkill[]> = {
  "Frontend Developer": [
    { name: "HTML & CSS", category: "Frontend", requiredLevel: 4 },
    { name: "JavaScript", category: "Programming", requiredLevel: 4 },
    { name: "TypeScript", category: "Programming", requiredLevel: 3 },
    { name: "React", category: "Frontend", requiredLevel: 4 },
    { name: "Git & GitHub", category: "Tools", requiredLevel: 3 },
    { name: "REST APIs", category: "Backend", requiredLevel: 3 },
  ],

  "Backend Developer": [
    { name: "JavaScript / TypeScript", category: "Programming", requiredLevel: 4 },
    { name: "Node.js", category: "Backend", requiredLevel: 4 },
    { name: "REST APIs", category: "Backend", requiredLevel: 4 },
    { name: "SQL", category: "Database", requiredLevel: 4 },
    { name: "Authentication", category: "Security", requiredLevel: 3 },
    { name: "Git & GitHub", category: "Tools", requiredLevel: 3 },
  ],

  "Full Stack Developer": [
    { name: "HTML & CSS", category: "Frontend", requiredLevel: 4 },
    { name: "JavaScript / TypeScript", category: "Programming", requiredLevel: 4 },
    { name: "React / Next.js", category: "Frontend", requiredLevel: 4 },
    { name: "Node.js & APIs", category: "Backend", requiredLevel: 4 },
    { name: "SQL / Databases", category: "Database", requiredLevel: 3 },
    { name: "Git & Deployment", category: "Tools", requiredLevel: 3 },
  ],

  "AI / ML Engineer": [
    { name: "Python", category: "Programming", requiredLevel: 4 },
    { name: "Statistics", category: "Mathematics", requiredLevel: 4 },
    { name: "Machine Learning", category: "AI", requiredLevel: 4 },
    { name: "Data Processing", category: "Data", requiredLevel: 3 },
    { name: "Deep Learning", category: "AI", requiredLevel: 3 },
    { name: "Model Deployment", category: "MLOps", requiredLevel: 3 },
  ],

  "Data Analyst": [
    { name: "Excel", category: "Analytics", requiredLevel: 4 },
    { name: "SQL", category: "Database", requiredLevel: 4 },
    { name: "Python", category: "Programming", requiredLevel: 3 },
    { name: "Statistics", category: "Mathematics", requiredLevel: 3 },
    { name: "Power BI / Tableau", category: "Visualization", requiredLevel: 4 },
    { name: "Data Storytelling", category: "Communication", requiredLevel: 3 },
  ],

  "Data Scientist": [
    { name: "Python", category: "Programming", requiredLevel: 4 },
    { name: "SQL", category: "Database", requiredLevel: 4 },
    { name: "Statistics", category: "Mathematics", requiredLevel: 4 },
    { name: "Machine Learning", category: "AI", requiredLevel: 4 },
    { name: "Data Visualization", category: "Visualization", requiredLevel: 3 },
    { name: "Feature Engineering", category: "AI", requiredLevel: 3 },
  ],

  "Cloud / DevOps Engineer": [
    { name: "Linux", category: "Operating Systems", requiredLevel: 4 },
    { name: "Computer Networking", category: "Networking", requiredLevel: 4 },
    { name: "AWS / Azure", category: "Cloud", requiredLevel: 4 },
    { name: "Docker", category: "DevOps", requiredLevel: 3 },
    { name: "CI/CD", category: "DevOps", requiredLevel: 3 },
    { name: "Terraform", category: "Infrastructure", requiredLevel: 3 },
  ],

  "Cybersecurity Engineer": [
    { name: "Computer Networking", category: "Networking", requiredLevel: 4 },
    { name: "Linux", category: "Operating Systems", requiredLevel: 4 },
    { name: "Web Security", category: "Security", requiredLevel: 4 },
    { name: "Cryptography", category: "Security", requiredLevel: 3 },
    { name: "Security Tools", category: "Security", requiredLevel: 3 },
    { name: "Incident Response", category: "Security", requiredLevel: 3 },
  ],
};

export function getRequiredSkills(targetRole: string) {
  return roleSkillMap[targetRole] || roleSkillMap["Full Stack Developer"];
}