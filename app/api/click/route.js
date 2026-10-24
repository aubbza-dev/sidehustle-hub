import { NextResponse } from "next/server";
import { platforms } from "../../../lib/platforms";
import { jobsByPlatform } from "../../../lib/jobs";
import autoMicro1 from "../../../lib/micro1-jobs-auto.json";

// Runs on every request (never cached), so each click is counted.
export const dynamic = "force-dynamic";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const id = requestUrl.searchParams.get("id");
  const platform = platforms.find((p) => p.id === id);

  // Unknown platform: send them back to the homepage.
  if (!platform) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Job apply button: /api/click?id=<platform>&job=<job id>. Counts the click
  // under the platform, then sends the visitor to that job's URL.
  const jobId = requestUrl.searchParams.get("job");
  const pool = [
    ...(jobsByPlatform[platform.id] || []),
    ...(platform.id === "micro1" && Array.isArray(autoMicro1.jobs)
      ? autoMicro1.jobs
      : []),
  ];
  const job = jobId ? pool.find((j) => j.id === jobId) : null;

  await countClick(platform.id);

  return NextResponse.redirect(job ? job.url : platform.link, 302);
}

// Count the click in Supabase. If Supabase is not set up yet (or it is
// down), we still redirect the user, so the site never breaks.
async function countClick(slug) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_click`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_slug: slug }),
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) {
      console.error("click tracking failed with status", res.status);
    }
  } catch (err) {
    console.error("click tracking error", err.message);
  }
}
