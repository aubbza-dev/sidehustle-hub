import { platforms } from "../lib/platforms";
import PlatformCard from "../components/PlatformCard";

const steps = [
  {
    title: "pick a platform",
    text: "browse the cards and pick the ones that match your skills and schedule.",
  },
  {
    title: "hit sign up",
    text: "the button takes you to the platform through our referral link.",
  },
  {
    title: "finish their onboarding",
    text: "create your profile, pass any skills check, and read the rules.",
  },
  {
    title: "earn at your pace",
    text: "take the tasks or studies you qualify for and get paid by the platform.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">sidehustle hub</p>
        <h1>
          legit ways to make <span className="grad">extra income</span> online
        </h1>
        <p className="lead">
          a curated list of platforms that pay you for AI training work, paid
          research and surveys. no fake get-rich-quick stuff. just the places
          real people use to earn on the side.
        </p>
        <a className="btn btn-big" href="#platforms">
          see the platforms
        </a>
        <p className="fine">
          payouts vary a lot and depend on your skills, location and availability.
        </p>
      </section>

      <section id="platforms" className="section">
        <h2>platforms</h2>
        <p className="sub">tap sign up to join through our referral link.</p>
        <div className="grid">
          {platforms.map((p) => (
            <PlatformCard key={p.id} platform={p} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>how it works</h2>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="num">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="footer">
        <p>
          disclosure: some links on this page are referral links. if you sign
          up through them we may get a bonus, at no extra cost to you. we only
          list platforms we think are worth your time.
        </p>
        <p>&copy; {new Date().getFullYear()} sidehustle hub</p>
      </footer>
    </main>
  );
}
