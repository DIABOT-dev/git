// src/components/ai/GatewayProbe.tsx
"use client";
import React, { useState } from "react";
import { callGateway } from "@/lib/ai/gatewayClient";

export default function GatewayProbe({ userId }: { userId: string }) {
  const [msg, setMsg] = useState("Gợi ý bữa trưa cho người tiền đái tháo đường?");
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const r = await callGateway({
        userId,
        message: msg,
        idempotencyKey: crypto.randomUUID(),
      });
      setResp(r);
    } catch (e: any) {
      setResp({ error: e?.message || "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded border p-3 bg-white space-y-2">
      <div className="font-medium">Gateway quick test</div>
      <textarea className="w-full border rounded p-2" rows={3}
        value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button onClick={run} disabled={loading}
        className="px-4 py-2 rounded bg-black text-white">
        {loading ? "Đang gọi..." : "Gọi Gateway"}
      </button>
      {resp && (
        <pre className="text-xs bg-gray-50 border rounded p-2 overflow-auto">
          {JSON.stringify(resp, null, 2)}
        </pre>
      )}
    </div>
  );
}
