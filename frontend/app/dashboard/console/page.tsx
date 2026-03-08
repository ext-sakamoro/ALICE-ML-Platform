"use client";

import { useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

type Tab = "infer" | "quantize" | "deploy" | "stats";

export default function ConsolePage() {
  const [tab, setTab] = useState<Tab>("infer");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // infer tab
  const [inferPayload, setInferPayload] = useState(
    JSON.stringify(
      { model_id: "alice-ternary-v1", inputs: [[0.1, -0.5, 0.9, 0.3]], precision: "1.58bit" },
      null,
      2
    )
  );

  // quantize tab
  const [quantizePayload, setQuantizePayload] = useState(
    JSON.stringify(
      { model_id: "gpt2-small", source_precision: "fp32", target_precision: "1.58bit", calibration_samples: 512 },
      null,
      2
    )
  );

  // deploy tab
  const [deployPayload, setDeployPayload] = useState(
    JSON.stringify(
      { model_id: "alice-ternary-v1", replicas: 2, accelerator: "cpu", memory_mb: 512 },
      null,
      2
    )
  );

  async function post(path: string, body: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function get(path: string) {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const tabs: Tab[] = ["infer", "quantize", "deploy", "stats"];

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-6 font-mono">
      <h1 className="text-2xl font-bold mb-6 text-green-300">
        ALICE-ML-Platform / Console
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResult(""); }}
            className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-green-700 text-white"
                : "bg-gray-800 text-green-400 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* infer */}
      {tab === "infer" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/ml/infer — run 1.58-bit ternary inference (addition-only, no multiplications)
          </p>
          <textarea
            className="w-full h-44 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={inferPayload}
            onChange={(e) => setInferPayload(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => post("/api/v1/ml/infer", inferPayload)}
              disabled={loading}
              className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
            >
              {loading ? "Inferring..." : "Run Inference"}
            </button>
            <button
              onClick={() => post("/api/v1/ml/benchmark", inferPayload)}
              disabled={loading}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-green-300 text-sm font-semibold"
            >
              {loading ? "Benchmarking..." : "Benchmark"}
            </button>
            <button
              onClick={() => get("/api/v1/ml/models")}
              disabled={loading}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-green-300 text-sm font-semibold"
            >
              List Models
            </button>
          </div>
        </div>
      )}

      {/* quantize */}
      {tab === "quantize" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/ml/quantize — quantize fp32 model to 1.58-bit / 4-bit / 8-bit
          </p>
          <textarea
            className="w-full h-44 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={quantizePayload}
            onChange={(e) => setQuantizePayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/ml/quantize", quantizePayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Quantizing..." : "Quantize"}
          </button>
        </div>
      )}

      {/* deploy */}
      {tab === "deploy" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            POST /api/v1/ml/deploy — deploy a quantized model to a serving endpoint
          </p>
          <textarea
            className="w-full h-44 bg-gray-800 border border-gray-700 rounded p-3 text-green-400 text-sm resize-y focus:outline-none focus:border-green-500"
            value={deployPayload}
            onChange={(e) => setDeployPayload(e.target.value)}
          />
          <button
            onClick={() => post("/api/v1/ml/deploy", deployPayload)}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Deploying..." : "Deploy Model"}
          </button>
        </div>
      )}

      {/* stats */}
      {tab === "stats" && (
        <div className="space-y-4">
          <p className="text-green-500 text-sm">
            GET /api/v1/ml/stats — inference throughput, energy use, and model deployment metrics
          </p>
          <button
            onClick={() => get("/api/v1/ml/stats")}
            disabled={loading}
            className="px-5 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-white text-sm font-semibold"
          >
            {loading ? "Loading..." : "Fetch Stats"}
          </button>
        </div>
      )}

      {/* result */}
      {result && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-widest">Response</p>
          <pre className="bg-gray-800 border border-gray-700 rounded p-4 text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
