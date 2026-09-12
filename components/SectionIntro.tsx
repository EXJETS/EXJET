type SectionIntroProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  inverse?: boolean;
  align?: "left" | "split";
};

export function SectionIntro({ eyebrow, title, copy, inverse = false, align = "split" }: SectionIntroProps) {
  return (
    <header className={`section-intro section-intro--${align}${inverse ? " section-intro--inverse" : ""}`}>
      <div>
        <p className="eyebrow"><span />{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {copy ? <p className="section-intro__copy">{copy}</p> : null}
    </header>
  );
}
