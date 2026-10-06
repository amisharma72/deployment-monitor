import "dotenv/config";
import express from "express";
import cors from "cors";
import { latestRuns } from "./github.js";

const app = express();
app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 3001);
const repositories = (process.env.REPOSITORIES || "")
  .split(",").map(x => x.trim()).filter(Boolean);
const mockMode = String(process.env.MOCK_MODE || "true").toLowerCase() === "true";

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/runs", async (_req, res) => {
  try {
    const runs = await latestRuns({
      token: process.env.GITHUB_TOKEN,
      repositories,
      mockMode
    });
    res.json({ runs, generatedAt: new Date().toISOString(), mockMode });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notify", async (req, res) => {
  if (!process.env.NOTIFY_WEBHOOK_URL) {
    return res.status(202).json({ sent: false, reason: "NOTIFY_WEBHOOK_URL not configured" });
  }
  const response = await fetch(process.env.NOTIFY_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(req.body)
  });
  res.status(response.ok ? 200 : 502).json({ sent: response.ok });
});

app.listen(port, () => console.log(`Deployment Monitor API running on :${port}`));
