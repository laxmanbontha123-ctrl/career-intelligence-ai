"use client";

import { useEffect, useState } from "react";
import OpportunityPreparationPanel, {
  OpportunityPreparationData,
} from "@/app/components/OpportunityPreparationPanel";

export default function OpportunityPreparePage() {
  const [data, setData] =
    useState<OpportunityPreparationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const opportunityId = Number(
          params.get("opportunityId")
        );

        if (
          !Number.isInteger(opportunityId) ||
          opportunityId <= 0
        ) {
          throw new Error(
            "No valid opportunity was selected."
          );
        }

        const response = await fetch(
          `/api/opportunities/prepare?opportunityId=${opportunityId}`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to build your preparation plan."
          );
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load preparation plan."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-8 text-white md:px-10 lg:px-14">
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover"
          src="/videos/opportunities-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        <div className="absolute inset-0 bg-[#020617]/80" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(56,189,248,0.10),transparent_35%),radial-gradient(circle_at_80%_60%,rgba(139,92,246,0.10),transparent_35%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/opportunities";
          }}
          className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur-xl transition hover:bg-white/10 hover:text-white"
        >
          ← Back to opportunities
        </button>

        {loading ? (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
            <div className="h-8 w-64 animate-pulse rounded-xl bg-white/10" />
            <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded-xl bg-white/5" />
            <div className="mt-8 h-96 animate-pulse rounded-3xl bg-white/5" />
          </section>
        ) : error || !data ? (
          <section className="max-w-3xl rounded-3xl border border-red-300/10 bg-red-300/[0.04] p-8 backdrop-blur-2xl">
            <p className="text-sm text-red-200">
              {error || "Unable to load preparation plan."}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/opportunities";
              }}
              className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 hover:bg-white/10"
            >
              Back to opportunities
            </button>
          </section>
        ) : (
          <OpportunityPreparationPanel data={data} />
        )}
      </div>
    </main>
  );
}

