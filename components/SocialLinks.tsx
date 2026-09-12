import { siteConfig } from "@/data/site";

type SocialLinksProps = { compact?: boolean; light?: boolean };

const socials = [
  { name: "Instagram", href: siteConfig.social.instagram, icon: "instagram" },
  { name: "Facebook", href: siteConfig.social.facebook, icon: "facebook" },
  { name: "LinkedIn", href: siteConfig.social.linkedin, icon: "linkedin" },
  { name: "Yelp", href: siteConfig.social.yelp, icon: "yelp" },
] as const;

function SocialIcon({ name }: { name: (typeof socials)[number]["icon"] }) {
  if (name === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r=".8" className="social-icon-fill" /></svg>;
  if (name === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.6 1.7-1.6H18V3.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V10H8v3h3v8h3.5Z" /></svg>;
  if (name === "linkedin") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="3" height="11" /><circle cx="5.5" cy="5.5" r="1.7" /><path d="M10 9h3v1.5c.8-1.2 2-1.9 3.7-1.9 3 0 4.3 1.9 4.3 5.4v6h-3v-5.5c0-2-.6-3.1-2.2-3.1-1.8 0-2.8 1.2-2.8 3.6v5h-3V9Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.7 3.2c-3.9-.8-7.8 1.8-8.6 5.8-.6 3 .7 6 3.1 7.6l-1.1 3 3.5-1.5c.4.1.8.2 1.2.3 4 .8 7.9-1.8 8.7-5.8.8-4-1.8-8.6-6.8-9.4Zm.4 3.1-.7 5.8c-.1.7-.3 1-.9 1-.5 0-.8-.4-.8-1l-.7-5.8h3.1Zm-1.5 9.9c-.8 0-1.4-.6-1.4-1.4s.6-1.4 1.4-1.4 1.4.6 1.4 1.4-.6 1.4-1.4 1.4Z" /></svg>;
}

export function SocialLinks({ compact = false, light = false }: SocialLinksProps) {
  return <div className={`social-links${compact ? " social-links--compact" : ""}${light ? " social-links--light" : ""}`} aria-label="EXJET social profiles">
    {socials.map((social) => <a href={social.href} target="_blank" rel="noreferrer" aria-label={`${social.name}, opens in a new tab`} key={social.name}><SocialIcon name={social.icon} />{compact ? null : <span>{social.name}</span>}</a>)}
  </div>;
}
