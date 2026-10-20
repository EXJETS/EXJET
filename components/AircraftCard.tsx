import Image from "next/image";
import Link from "next/link";
import { Aircraft } from "@/data/aircraft";

export function AircraftCard({ item, index }: { item: Aircraft; index: number }) {
  const href = `/aircraft/${item.slug}`;

  return (
    <article className="aircraft-card">
      <Link href={href} className={`aircraft-card__media${item.cardFit === "contain" ? " aircraft-card__media--contain" : ""}`}>
        {item.image ? (
          <picture>
            {item.portraitImage ? <source media="(max-width: 820px)" srcSet={item.portraitImage} /> : null}
            <Image src={item.image} alt={`${item.name} ${item.scenes.find(scene => scene.image === item.image)?.label.toLowerCase() ?? "aircraft"}`} fill sizes="(max-width: 820px) 100vw, 50vw" style={{objectFit: item.cardFit ?? "cover"}} />
          </picture>
        ) : (
          <div className="aircraft-card__placeholder">
            <span>Verified imagery coming soon</span>
            <strong>{item.name}</strong>
          </div>
        )}
        {item.status === "coming-soon" ? <span className="aircraft-card__status">Coming soon to management</span> : null}
      </Link>
      <div className="aircraft-card__content">
        <div>
          <span>0{index + 1}</span>
          <p>{item.maker} · {item.category}</p>
        </div>
        <h2>{item.name}</h2>
        <p>{item.summary}</p>
        <Link href={href}>Explore aircraft <span>→</span></Link>
      </div>
    </article>
  );
}
