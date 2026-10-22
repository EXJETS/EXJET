import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  light?: boolean;
  className?: string;
  onClick?: () => void;
};

export function Logo({ light = false, className, onClick }: LogoProps) {
  return (
    <Link className={className} href="/" aria-label="EXJET home" onClick={onClick}>
      <Image
        src={light ? "/brand/identity/exjet-wordmark-light.svg" : "/brand/identity/exjet-wordmark.svg"}
        alt=""
        width={340}
        height={80}
        loading="lazy"
      />
    </Link>
  );
}
