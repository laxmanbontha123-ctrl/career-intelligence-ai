"use client";

import { BrainCircuit, GraduationCap } from "lucide-react";

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#050816",
        color: "white",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <GraduationCap size={42} />
        <h1>CareerIntel Dashboard</h1>
        <p style={{ color: "#8d97ad" }}>
          Authentication successful.
        </p>
        <BrainCircuit size={28} />
      </div>
    </main>
  );
}