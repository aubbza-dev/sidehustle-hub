import Link from "next/link";
import { notFound } from "next/navigation";
import { platforms } from "../../../lib/platforms";
import { jobsByPlatform } from "../../../lib/jobs";
import autoMicro1 from "../../../lib/micro1-jobs-auto.json";

export function generateStaticParams() {
  return platforms.map((p) => ({ slug: p.id }));
}

export function generateMetadata({ params }) {
  const platform = platforms.find((p) => p.id === params.slug);
  return {
    title: platform ? `${platform.name} jobs | sidehustle hub` : "sidehustle hub",
  };
}

export default function PlatformPage({ params }) {
  const platform = platforms.find((p) => p.id === params.slug);
  if (!platform) notFound();

  // micro1 jobs come from the auto file (refreshed by scripts/refresh-micro1.js).
  // If it is empty, fall back to the manual entries in lib/jobs.js.
  const autoJobs =
    platform.id === "micro1" && Array.isArray(autoMicro1.jobs)
      ? autoMicro1.jobs
      : [];
  const jobs =
    autoJobs.length > 0 ? autoJobs : jobsByPlatform[platform.id] || [];

  return (
    <main>
      <section className="section">
        <Link className="back" href="/#platforms">
          &larr; all platforms
        </Link>
        <p className="eyebrow">{platform.category}</p>
        <h1>{platform.name}</h1>
        <p className="lead">{platform.description}</p>
        <p className="payout">
          <span>est. payout</span> {platform.payout}
        </p>
        <p className="fine">
          listings are posted by the platform and change often. check the pay
          and requirements on the job page before you apply.
        </p>
      </section>

      <section className="section">
        <h2>open jobs</h2>
        {jobs.length === 0 ? (
          <div className="empty">
            <h3>jobs coming soon</h3>
            <p className="desc">
              no individual listings for {platform.name} yet. check back soon,
              or use the sign up button on the homepage to join the platform.
            </p>
          </div>
        ) : (
          <ul className="jobs">
            {jobs.map((job) => (
              <li key={job.id} className="card job">
                <h3>{job.title}</h3>
                <p className="payout">
                  <span>est. pay</span> {job.pay}
                </p>
                <p className="desc">{job.description}</p>
                {/* Goes through /api/click, which counts the click then redirects to the job */}
                <a
                  className="btn"
                  href={`/api/click?id=${platform.id}&job=${encodeURIComponent(job.id)}`}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  apply
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        <p>
          disclosure: some links on this site are referral links. if you sign
          up through them we may get a bonus, at no extra cost to you.
        </p>
      </footer>
    </main>
  );
}
