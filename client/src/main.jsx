import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function badge(run) {
  if (run.error) return "error";
  if (run.status === "in_progress") return "running";
  return run.conclusion || run.status;
}

function App() {
  const [data, setData] = useState({runs:[]});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("http://localhost:3001/api/runs");
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  return <main className="shell">
    <header>
      <div><p className="eyebrow">ENGINEERING OPERATIONS</p><h1>Deployment Monitor</h1>
      <p className="sub">One view across deployment workflows.</p></div>
      <button onClick={load}>{loading ? "Refreshing…" : "Refresh"}</button>
    </header>
    <section className="grid">
      {data.runs?.map(run => <article className="card" key={run.repo}>
        <div className="top"><strong>{run.repo}</strong><span className={`badge ${badge(run)}`}>{badge(run)}</span></div>
        {run.error ? <p>{run.error}</p> : <>
          <h2>{run.workflow}</h2>
          <dl>
            <div><dt>Branch</dt><dd>{run.branch}</dd></div>
            <div><dt>Actor</dt><dd>{run.actor}</dd></div>
            <div><dt>Run</dt><dd>#{run.runNumber}</dd></div>
            <div><dt>Updated</dt><dd>{new Date(run.updatedAt).toLocaleString()}</dd></div>
          </dl>
        </>}
      </article>)}
    </section>
    <footer>{data.mockMode ? "Demo data" : "Live GitHub data"}</footer>
  </main>
}

createRoot(document.getElementById("root")).render(<App />);
