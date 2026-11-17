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
        src={light ? "/brand/exjet-wordmark-light.svg" : "/brand/exjet-wordmark.svg"}
        alt=""
        width={335}
        height={143}
        loading="lazy"
      />
    </Link>
  );
}
