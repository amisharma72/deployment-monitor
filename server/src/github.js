const sample = [
  { repo:"acme/web", workflow:"Deploy", status:"completed", conclusion:"success", branch:"main", actor:"alex", runNumber:214, updatedAt:new Date(Date.now()-4*60*1000).toISOString() },
  { repo:"acme/api", workflow:"Deploy", status:"in_progress", conclusion:null, branch:"main", actor:"sam", runNumber:98, updatedAt:new Date(Date.now()-90*1000).toISOString() },
  { repo:"acme/content", workflow:"Release", status:"completed", conclusion:"failure", branch:"release", actor:"jordan", runNumber:331, updatedAt:new Date(Date.now()-18*60*1000).toISOString() }
];

export async function latestRuns({ token, repositories, mockMode }) {
  if (mockMode) return sample;

  const result = [];
  for (const repo of repositories) {
    const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=1`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });
    if (!response.ok) {
      result.push({ repo, error: `GitHub API returned ${response.status}` });
      continue;
    }
    const data = await response.json();
    const run = data.workflow_runs?.[0];
    if (!run) {
      result.push({ repo, error: "No workflow runs found" });
      continue;
    }
    result.push({
      repo,
      workflow: run.name,
      status: run.status,
      conclusion: run.conclusion,
      branch: run.head_branch,
      actor: run.actor?.login ?? "unknown",
      runNumber: run.run_number,
      updatedAt: run.updated_at,
      htmlUrl: run.html_url
    });
  }
  return result;
}
