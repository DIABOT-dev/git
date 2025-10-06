"use client";

import { useState } from "react";
import ChatOverlay from "./ChatOverlay";

export default function AIFab() {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Assistant"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          background: "rgb(var(--brand-primary))",
          color: "white",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 50
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      <ChatOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
