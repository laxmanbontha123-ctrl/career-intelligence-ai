import { prisma } from "../../lib/prisma";

type OpportunitySeed = {
  title: string;
  company: string;
  type: string;
  description: string;
  location: string;
  workMode: string;
  applicationUrl: string;
  skills: [string, number][];
};

const opportunities: OpportunitySeed[] = [
  {
    title: "Cloud / DevOps Engineering Intern",
    company: "CloudNova Labs",
    type: "INTERNSHIP",
    description:
      "Work on cloud infrastructure, Linux systems, Docker containers and CI/CD automation while supporting production engineering workflows.",
    location: "Hyderabad, Telangana",
    workMode: "HYBRID",
    applicationUrl: "https://example.com/cloud-devops-intern",
    skills: [
      ["Linux", 3],
      ["AWS / Azure", 3],
      ["Docker", 3],
      ["CI/CD", 3],
      ["Computer Networking", 2],
    ],
  },
  {
    title: "Junior DevOps Project Fellowship",
    company: "InfraForge",
    type: "PROJECT",
    description:
      "Build and automate cloud infrastructure using Linux, Terraform, Docker and CI/CD practices.",
    location: "Remote",
    workMode: "REMOTE",
    applicationUrl: "https://example.com/devops-fellowship",
    skills: [
      ["Linux", 3],
      ["Terraform", 3],
      ["Docker", 3],
      ["CI/CD", 3],
      ["AWS / Azure", 3],
    ],
  },
  {
    title: "Cloud Support Engineering Intern",
    company: "StackOrbit",
    type: "INTERNSHIP",
    description:
      "Assist cloud engineering teams with networking, Linux troubleshooting, monitoring and deployment operations.",
    location: "Bengaluru, Karnataka",
    workMode: "HYBRID",
    applicationUrl: "https://example.com/cloud-support-intern",
    skills: [
      ["Linux", 3],
      ["AWS / Azure", 3],
      ["Computer Networking", 3],
      ["Docker", 2],
    ],
  },
  {
    title: "Platform Engineering Student Project",
    company: "OpenScale",
    type: "PROJECT",
    description:
      "Create a production-style platform with containerization, infrastructure as code, automated deployments and cloud services.",
    location: "Remote",
    workMode: "REMOTE",
    applicationUrl: "https://example.com/platform-project",
    skills: [
      ["Docker", 3],
      ["Terraform", 3],
      ["CI/CD", 3],
      ["AWS / Azure", 3],
    ],
  },
  {
    title: "Cloud Infrastructure Trainee",
    company: "NexaCloud",
    type: "INTERNSHIP",
    description:
      "Learn and implement cloud infrastructure fundamentals including networking, Linux, IAM, compute and storage.",
    location: "Pune, Maharashtra",
    workMode: "ONSITE",
    applicationUrl: "https://example.com/cloud-trainee",
    skills: [
      ["AWS / Azure", 2],
      ["Linux", 2],
      ["Computer Networking", 2],
    ],
  },
];

async function main() {
  for (const opportunity of opportunities) {
    const existing = await prisma.opportunity.findFirst({
      where: {
        title: opportunity.title,
        company: opportunity.company,
      },
    });

    const record = existing
      ? await prisma.opportunity.update({
          where: { id: existing.id },
          data: {
            description: opportunity.description,
            location: opportunity.location,
            workMode: opportunity.workMode,
            applicationUrl: opportunity.applicationUrl,
            active: true,
          },
        })
      : await prisma.opportunity.create({
          data: {
            title: opportunity.title,
            company: opportunity.company,
            type: opportunity.type,
            description: opportunity.description,
            location: opportunity.location,
            workMode: opportunity.workMode,
            applicationUrl: opportunity.applicationUrl,
          },
        });

    await prisma.opportunitySkill.deleteMany({
      where: {
        opportunityId: record.id,
      },
    });

    await prisma.opportunitySkill.createMany({
      data: opportunity.skills.map(
        ([skillName, requiredLevel]) => ({
          opportunityId: record.id,
          skillName,
          requiredLevel,
        })
      ),
    });

    console.log(
      `Seeded: ${record.company} — ${record.title}`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
