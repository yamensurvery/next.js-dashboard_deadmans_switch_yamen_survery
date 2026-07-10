"use client";

import { useState } from "react";
import { evaluateAllSwitches } from "@/app/actions/evaluateAllSwitches";

export default function EvaluateTestPage() {
  const [results, setResults] = useState<
    { id: string; changed: boolean; status: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  async function handleRun() {
    setLoading(true);
    try {
      const res = await evaluateAllSwitches();
      setResults(res);
    } catch (err) {
      setResults([{ id: "error", changed: false, status: (err as Error).message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <h1>Evaluate All Switches (manual test)</h1>
      <button onClick={handleRun} disabled={loading}>
        {loading ? "Running..." : "Run Evaluation"}
      </button>
      {results && (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(results, null, 2)}</pre>
      )}
    </div>
  );
}