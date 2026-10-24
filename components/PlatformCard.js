export default function PlatformCard({ platform }) {
  const initials = platform.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card">
      <div className="card-top">
        {/* LOGO PLACEHOLDER: replace this div with
            <img src="/logos/mercor.png" alt="Mercor logo" /> once you have logos
            (put image files in the /public folder). */}
        <div className="logo" aria-hidden="true">
          {initials}
        </div>
        <span className="tag">{platform.category}</span>
      </div>

      <h3>{platform.name}</h3>
      <p className="desc">{platform.description}</p>

      <p className="payout">
        <span>est. payout</span> {platform.payout}
      </p>

      {/* Goes through /api/click, which counts the click then redirects to the referral link */}
      <a
        className="btn"
        href={`/api/click?id=${platform.id}`}
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        {platform.hasReferral ? "sign up" : "apply direct"}
      </a>

      <a className="jobs-link" href={`/platform/${platform.id}`}>
        view jobs &rarr;
      </a>
    </article>
  );
}
