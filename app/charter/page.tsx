import { BrokerNotice } from "@/components/BrokerNotice";
import { QuoteForm } from "@/components/QuoteForm";
import { buildMetadata } from "@/data/seo";
import { siteConfig } from "@/data/site";
import styles from "./booking.module.css";

export const metadata = buildMetadata("/charter");

export default function CharterPage() {
  return (
    <section className={styles.page} aria-labelledby="charter-heading">
      <div className={styles.shell}>
        <header className={styles.intro}>
          <h1 id="charter-heading">Plan a flight</h1>
          <p>Search your route. Compare cabin estimates.</p>
        </header>
        <div className={styles.panel} id="charter-request">
          <QuoteForm />
        </div>
        <div className={styles.support}>
          <a href={`mailto:${siteConfig.email.charter}`}>Contact the charter desk</a>
          <BrokerNotice prominent />
        </div>
      </div>
    </section>
  );
}
