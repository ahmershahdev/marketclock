"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

export function Tilt({
  children,
  className = "",
  max = 8,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node || event.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateZ(0)`;
    node.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    node.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
  }

  function leave() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`relative transition-transform duration-500 ease-out-expo will-change-transform [transform-style:preserve-3d] before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(400px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),var(--glow),transparent_60%)] before:opacity-0 before:transition-opacity hover:before:opacity-100 ${className}`}
    >
      {children}
    </div>
  );
}
