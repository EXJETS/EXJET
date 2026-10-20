import { siteConfig } from "@/data/site";
import { InstagramLogoIcon, FacebookLogoIcon, LinkedinLogoIcon } from "@phosphor-icons/react/dist/ssr";

type SocialLinksProps = { compact?: boolean; light?: boolean };
const socials = [
  { name: "Instagram", href: siteConfig.social.instagram, Icon: InstagramLogoIcon },
  { name: "Facebook", href: siteConfig.social.facebook, Icon: FacebookLogoIcon },
  { name: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedinLogoIcon },
  { name: "Yelp", href: siteConfig.social.yelp, Icon: null },
];
export function SocialLinks({ compact = false, light = false }: SocialLinksProps) {
  return <div className={`social-links${compact ? " social-links--compact" : ""}${light ? " social-links--light" : ""}`} aria-label="EXJET social profiles">
    {socials.map(({name, href, Icon}) => <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name}, opens in a new tab`} key={name}>
      {Icon ? <Icon size={20} weight="regular" aria-hidden="true" /> : null}
      {!compact || !Icon ? <span>{name}</span> : null}
    </a>)}
  </div>;
}
