"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Opacity once revealed. Defaults to 1; pass a low value for background texture that should never draw full attention. */
  revealedOpacity?: number;
  /** How far (px) the element rises into place. 0 means fade only, no motion. */
  translateYPx?: number;
  /** Stagger delay in ms, ignored under prefers-reduced-motion. */
  delayMs?: number;
}

/**
 * Fades (and optionally rises) an element in once it scrolls into view, once,
 * via IntersectionObserver. Deliberately quiet — this is not the page's
 * signature motion (that's the hero's document markup), just a secondary
 * reveal. Renders the settled end state instantly under prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  className = "",
  revealedOpacity = 1,
  translateYPx = 12,
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return; // effectiveRevealed below jumps straight to the settled end state
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  const effectiveRevealed = reducedMotion || revealed;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${className}`}
      style={{
        opacity: effectiveRevealed ? revealedOpacity : 0,
        transform: effectiveRevealed ? "translateY(0)" : `translateY(${translateYPx}px)`,
        transitionDelay: reducedMotion ? "0ms" : `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
