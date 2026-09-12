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
        src={light ? "/brand/exjet-guide-mark-light.svg" : "/brand/exjet-guide-mark.svg"}
        alt="EXJET"
        width={124}
        height={70}
        priority
      />
    </Link>
  );
}
