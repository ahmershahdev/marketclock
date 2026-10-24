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

// The emblem's wordmark is black, so it sits on a light plate in both themes.
export function Emblem({ className = "" }: { className?: string }) {
  return (
    <span className={`block rounded-3xl bg-[#f4f5f1] p-3 ring-1 ring-rule ${className}`}>
      <Image
        src="/brand/emblem.webp"
        alt="MarketClock"
        width={1254}
        height={1254}
        sizes="(min-width: 768px) 224px, 192px"
        className="h-auto w-full object-contain"
      />
    </span>
  );
}
