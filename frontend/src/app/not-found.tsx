import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70dvh] flex-col justify-center py-24">
      <p className="mb-6 eyebrow">404</p>
      <h1 className="text-display text-[clamp(4rem,14vw,12rem)]">
        Market <em className="text-accent">closed.</em>
      </h1>
      <p className="mt-8 max-w-md text-lg text-ink-2">
        There is nothing at this address. The market code may be wrong, or the page has moved.
      </p>
      <div className="mt-10">
        <ButtonLink href="/markets">See all markets</ButtonLink>
      </div>
    </section>
  );
}
