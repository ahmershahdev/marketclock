export function Flag({ code, className = "" }: { code: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static SVGs gain nothing from next/image
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={24}
      height={18}
      loading="lazy"
      decoding="async"
      className={`inline-block aspect-[4/3] shrink-0 rounded-[3px] object-cover ring-1 ring-rule-strong ${className}`}
    />
  );
}
