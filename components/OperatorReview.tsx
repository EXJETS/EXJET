import { operatorReview, type OperatorReviewItem } from "@/data/trust";

export function OperatorReview({ items = operatorReview }: { items?: OperatorReviewItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="principles-list operator-review-list">
      {items.map((item, index) => (
        <article key={item.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </article>
      ))}
    </div>
  );
}
