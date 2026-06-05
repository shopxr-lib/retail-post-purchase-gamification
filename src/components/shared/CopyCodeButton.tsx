"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy full code"}
      className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition ${
        copied ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      }`}
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}
