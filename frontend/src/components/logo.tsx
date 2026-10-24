import Image from "next/image";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/mark.webp"
      alt=""
      width={96}
      height={96}
      priority
      className={`object-contain ${className}`}
    />
  );
}

export function Emblem({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/brand/emblem.webp"
      alt="MarketClock"
      width={960}
      height={720}
      className={`h-auto object-contain ${className}`}
    />
  );
}
