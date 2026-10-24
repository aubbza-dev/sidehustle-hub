// ============================================================
// refresh-micro1.js
// Pulls the live micro1 job board and writes lib/micro1-jobs-auto.json.
//
// Run:  node scripts/refresh-micro1.js
// Test with a saved API response instead of the network:
//       node scripts/refresh-micro1.js --from-file path/to/response.json
//
// Safety rules:
// - If the request is blocked (403) or returns no jobs, the script exits
//   with an error and LEAVES the existing lib/micro1-jobs-auto.json alone.
// - It never invents jobs. Only what the API returns is written.
// - Referral params are appended to every job URL.
// ============================================================

const fs = require("fs");
const path = require("path");

const API_URL =
  "https://prod-api.micro1.ai/api/v1/job/portal?page=1&limit=50&keyword=";
const JOB_BASE = "https://jobs.micro1.ai/post/";
const REFERRAL =
  "referralCode=2fe31fbf-a582-4c22-87aa-34e3e76c2c66&utm_source=referral&utm_medium=share&utm_campaign=job_referral";
const OUT_FILE = path.join(__dirname, "..", "lib", "micro1-jobs-auto.json");

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://jobs.micro1.ai",
  Referer: "https://jobs.micro1.ai/",
};

// Find the array of job objects in whatever wrapper the API uses.
function findJobArray(body) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return null;
  for (const key of ["jobs", "data", "results", "items", "docs", "rows"]) {
    const v = body[key];
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object") {
      const nested = findJobArray(v);
      if (nested) return nested;
    }
  }
  return null;
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function formatPay(job) {
  const min = pick(job, ["payMin", "pay_min", "minPay", "hourlyMin"]);
  const max = pick(job, ["payMax", "pay_max", "maxPay", "hourlyMax"]);
  const unit = pick(job, ["payUnit", "pay_unit", "payPeriod"]) || "hr";
  if (min !== undefined && max !== undefined) return `$${min}-${max}/${unit}`;
  const text = pick(job, ["pay", "payRange", "compensation", "salary"]);
  if (text !== undefined) return String(text);
  return "see job page";
}

function normalize(raw) {
  const id = pick(raw, ["id", "_id", "jobId", "job_id", "uuid"]);
  const title = pick(raw, ["title", "jobTitle", "name", "role"]);
  if (!id || !title) return null;
  return {
    id: `micro1-${String(id)}`,
    title: String(title),
    pay: formatPay(raw),
    description: String(
      pick(raw, ["description", "summary", "shortDescription"]) ||
        "open the job page for the full description and requirements."
    ).slice(0, 300),
    url: `${JOB_BASE}${encodeURIComponent(String(id))}?${REFERRAL}`,
  };
}

async function loadBody() {
  const fileIdx = process.argv.indexOf("--from-file");
  if (fileIdx !== -1) {
    const file = process.argv[fileIdx + 1];
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }
  const res = await fetch(API_URL, { headers: BROWSER_HEADERS });
  if (!res.ok) {
    throw new Error(
      `micro1 API returned HTTP ${res.status}. Blocked, so nothing was written.`
    );
  }
  return res.json();
}

async function main() {
  const body = await loadBody();
  const rawJobs = findJobArray(body);
  if (!rawJobs) {
    throw new Error(
      "could not find a job list in the API response. The response shape may have changed. Nothing was written."
    );
  }
  const jobs = rawJobs.map(normalize).filter(Boolean);
  if (jobs.length === 0) {
    throw new Error(
      "API returned no usable jobs (missing id or title). Nothing was written."
    );
  }
  const out = {
    generatedAt: new Date().toISOString(),
    source: "https://jobs.micro1.ai",
    count: jobs.length,
    jobs,
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`wrote ${jobs.length} micro1 jobs to lib/micro1-jobs-auto.json`);
}

main().catch((err) => {
  console.error(`refresh failed: ${err.message}`);
  process.exit(1);
});
