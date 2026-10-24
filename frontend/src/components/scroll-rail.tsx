"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

const MIN_THUMB = 56;

function metrics(track: number) {
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  const size = Math.max(track * (root.clientHeight / root.scrollHeight), MIN_THUMB);
  return { max, size, travel: Math.max(track - size, 1) };
}

export function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ y: number; top: number } | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const node = rail.current;
    if (!enabled || !node) return;
    root.dataset.scrollRail = "";

    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;

    const render = () => {
      frame = 0;
      const { max, size, travel } = metrics(node.clientHeight);
      const progress = max > 0 ? root.scrollTop / max : 0;
      node.dataset.hidden = String(max <= 0);
      thumb.current?.style.setProperty("height", `${size}px`);
      thumb.current?.style.setProperty("transform", `translate3d(0, ${progress * travel}px, 0)`);
      if (label.current)
        label.current.textContent = String(Math.round(progress * 100)).padStart(2, "0");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onScroll = () => {
      schedule();
      node.dataset.active = "true";
      clearTimeout(idle);
      idle = setTimeout(() => delete node.dataset.active, 900);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    render();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      resize.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      delete root.dataset.scrollRail;
    };
  }, [enabled]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, top: document.documentElement.scrollTop };
    rail.current?.setAttribute("data-dragging", "true");
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !rail.current) return;
    const { max, travel } = metrics(rail.current.clientHeight);
    const top = drag.current.top + ((event.clientY - drag.current.y) / travel) * max;
    window.scrollTo({ top, behavior: "instant" });
  }

  function endDrag() {
    drag.current = null;
    rail.current?.removeAttribute("data-dragging");
  }

  function jump(event: PointerEvent<HTMLDivElement>) {
    if (!rail.current) return;
    const rect = rail.current.getBoundingClientRect();
    const { max, size, travel } = metrics(rect.height);
    const progress = Math.min(Math.max((event.clientY - rect.top - size / 2) / travel, 0), 1);
    window.scrollTo({ top: progress * max, behavior: "smooth" });
  }

  if (!enabled) return null;

  return (
    <div
      ref={rail}
      aria-hidden="true"
      onPointerDown={jump}
      className="group/rail fixed top-3 right-0 bottom-3 z-[90] w-4 cursor-pointer data-[hidden=true]:hidden"
    >
      <div className="absolute inset-y-0 right-[7px] w-px bg-rule transition-colors duration-500 group-hover/rail:bg-rule-strong" />
      <div
        ref={thumb}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="absolute top-0 right-[5px] w-[5px] cursor-grab touch-none rounded-full bg-ink-3 transition-[width,right,background-color,box-shadow] duration-300 ease-out-expo will-change-transform group-hover/rail:right-1 group-hover/rail:w-2 group-data-[active=true]/rail:bg-ink group-data-[dragging=true]/rail:right-1 group-data-[dragging=true]/rail:w-2 group-data-[dragging=true]/rail:cursor-grabbing group-data-[dragging=true]/rail:bg-signal group-data-[dragging=true]/rail:shadow-[0_0_18px_var(--glow)]"
      >
        <span className="pointer-events-none absolute top-1/2 right-4 flex translate-x-1 -translate-y-1/2 items-center gap-1 rounded-full border border-rule bg-surface/90 px-2 py-1 font-mono text-[10px] text-ink tabular opacity-0 shadow-[0_8px_24px_-12px_rgb(0_0_0/0.4)] backdrop-blur-md transition-[opacity,transform] duration-300 ease-out-expo group-hover/rail:translate-x-0 group-hover/rail:opacity-100 group-data-[active=true]/rail:translate-x-0 group-data-[active=true]/rail:opacity-100">
          <span ref={label}>00</span>
          <span className="text-ink-3">%</span>
        </span>
      </div>
    </div>
  );
}
