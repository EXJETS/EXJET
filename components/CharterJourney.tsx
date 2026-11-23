import Link from "next/link";
import { BrokerNotice } from "./BrokerNotice";
import styles from "./CharterJourney.module.css";

const journeys = [
  { id: "private", href: "/charter/", title: "Private jets" },
  { id: "empty", href: "/empty-legs/", title: "Empty legs" },
] as const;

type Journey = (typeof journeys)[number]["id"];
type JourneyLink = { href: string; label: string };
type JourneyProps = {
  active: Journey;
  eyebrow: string;
  title: string;
  description: string;
  panelId: string;
  panelTitle: string;
  panelDescription?: string;
  advisorTitle: string;
  advisorCopy: string;
  links: JourneyLink[];
  children: React.ReactNode;
};

export function CharterJourney({
  active, eyebrow, title, description, panelId, panelTitle, panelDescription,
  advisorTitle, advisorCopy, links, children,
}: JourneyProps) {
  return (
    <section className={styles.journey} aria-labelledby={`${panelId}-heading`}>
      <div className={styles.shell}>
        <nav className={styles.journeys} aria-label="Choose a charter service">
          {journeys.map(journey => (
            <Link href={journey.href} key={journey.id} aria-current={journey.id === active ? "page" : undefined}>
              {journey.title}
            </Link>
          ))}
        </nav>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id={`${panelId}-heading`}>{title}</h1>
          <p className={styles.description}>{description}</p>
        </header>
        <div className={styles.workspace}>
          <section className={styles.panel} id={panelId} aria-labelledby={`${panelId}-title`}>
            <div className={styles.panelIntro}>
              <h2 id={`${panelId}-title`}>{panelTitle}</h2>
              {panelDescription ? <p>{panelDescription}</p> : null}
            </div>
            <BrokerNotice prominent />
            <div className={styles.flow}>{children}</div>
          </section>
          <aside className={styles.advisor} aria-labelledby={`${panelId}-advisor`}>
            <p className={styles.eyebrow}>The EXJET flight desk</p>
            <h2 id={`${panelId}-advisor`}>{advisorTitle}</h2>
            <p>{advisorCopy}</p>
            <ul>
              {links.map(({ href, label }) => (
                <li key={href}>
                  {href.startsWith("/") ? <Link href={href}>{label}<span aria-hidden="true">↗</span></Link> :
                    <a href={href}>{label}<span aria-hidden="true">↗</span></a>}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
