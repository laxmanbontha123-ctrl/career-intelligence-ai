"use client";

type PreparationSkill = {
  name: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  ready: boolean;
};

type PreparationStage = {
  key: "LEARN" | "PRACTICE" | "PROVE";
  title: string;
  description: string;
};

type PreparationStep = {
  priority: number;
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  stages: PreparationStage[];
};

export type OpportunityPreparationData = {
  success: boolean;
  opportunity: {
    id: number;
    title: string;
    company: string;
    type: string;
  };
  targetRole: string | null;
  readinessScore: number;
  matched: PreparationSkill[];
  gaps: PreparationSkill[];
  preparationSteps: PreparationStep[];
  totalGaps: number;
};

type Props = {
  data: OpportunityPreparationData;
  loading?: boolean;
  onClose?: () => void;
};

export default function OpportunityPreparationPanel({
  data,
  loading = false,
  onClose,
}: Props) {
  return (
    <section className="mb-8 rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.05] p-6 shadow-2xl backdrop-blur-2xl">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-200/70">
            Prepare for this opportunity
          </div>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {data.opportunity.title}
          </h2>

          <p className="mt-1 text-sm text-white/50">
            {data.opportunity.company}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-5 py-4 text-center">
            <p className="text-xs text-white/50">
              Current readiness
            </p>

            <p className="mt-1 text-3xl font-bold text-cyan-200">
              {data.readinessScore}%
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-5">
          <p className="text-sm font-medium text-emerald-200">
            Skills you already have
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {data.matched.length > 0 ? (
              data.matched.map((skill) => (
                <span
                  key={skill.name}
                  className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs text-emerald-200"
                >
                  ✓ {skill.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/40">
                No fully matched skills yet.
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-5">
          <p className="text-sm font-medium text-amber-200">
            Priority skill gaps
          </p>

          <div className="mt-3 space-y-2">
            {data.gaps.length > 0 ? (
              data.gaps.slice(0, 4).map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2"
                >
                  <span className="text-sm text-white/80">
                    {skill.name}
                  </span>

                  <span className="text-xs text-amber-200/80">
                    Gap {skill.gap}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-emerald-200">
                You already meet the listed requirements.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Your preparation path
          </h3>

          <p className="mt-1 text-sm text-white/50">
            Learn → Practice → Prove
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/50">
            Building your preparation plan...
          </div>
        ) : data.preparationSteps.length === 0 ? (
          <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.04] p-5 text-sm text-emerald-200">
            You're already aligned with the listed skill
            requirements for this opportunity.
          </div>
        ) : (
          <div className="space-y-4">
            {data.preparationSteps.map((step) => (
              <div
                key={step.skill}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-cyan-200/60">
                      Priority {step.priority}
                    </p>

                    <h4 className="mt-1 text-lg font-medium text-white">
                      {step.skill}
                    </h4>

                    <p className="mt-1 text-xs text-white/40">
                      Current {step.currentLevel} · Target{" "}
                      {step.targetLevel}
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-200">
                    Gap {step.gap}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {step.stages.map((stage, index) => (
                    <div
                      key={stage.key}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/10 text-xs font-semibold text-cyan-200">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-cyan-200">
                          {stage.key}
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          {stage.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-white/45">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
