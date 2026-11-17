import Link from "next/link";
import type { AircraftCategory } from "@/data/aircraftCategories";

export function AircraftCategoryCard({ item, index }: { item: AircraftCategory; index: number }) {
  return (
    <article className="aircraft-category-card" id={item.slug}>
      <div className="aircraft-category-card__heading">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p>Aircraft category</p>
        <h2>{item.name}</h2>
        <p>{item.summary}</p>
      </div>
      <div className="aircraft-category-card__profile">
        <div><span>Passengers</span><strong>{item.passengers}</strong></div>
        <div><span>Range profile</span><strong>{item.range}</strong></div>
        <div><span>Cabin</span><strong>{item.cabin}</strong></div>
        <div><span>Well suited to</span><strong>{item.idealFor}</strong></div>
      </div>
      <div className="aircraft-category-card__models">
        <p>Frequently requested examples</p>
        <ol>
          {item.models.map((model, modelIndex) => (
            <li key={model.name}>
              <span>{String(modelIndex + 1).padStart(2, "0")}</span>
              {model.href ? <Link href={model.href}>{model.name}<span aria-hidden="true">↗</span></Link> : <strong>{model.name}</strong>}
            </li>
          ))}
        </ol>
      </div>
      <Link className="aircraft-category-card__cta" href={`/contact?category=${item.slug}`}>
        Request this category <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
