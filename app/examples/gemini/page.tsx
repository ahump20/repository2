"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const GeminiDemo = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!input.trim()) return;
    setLoading(true);
    setOutput(null);
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    setLoading(false);
    if (!res.ok) {
      const err = await res.text();
      setOutput(`Error: ${err}`);
      return;
    }
    const data = await res.json();
    setOutput(data.text);
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a prompt"
        />
        <button onClick={submit} disabled={loading}>
          {loading ? "Loading..." : "Ask Gemini"}
        </button>
        {output && <div className={styles.output}>{output}</div>}
      </div>
    </main>
  );
};

export default GeminiDemo;
