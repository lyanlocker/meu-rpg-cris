import React, { useEffect, useMemo, useRef } from "react";

type Star = {
  left: number;
  top: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function createStars(amount: number, offset: number): Star[] {
  return Array.from({ length: amount }, (_, index) => ({
    left: seededRandom(index + offset) * 100,
    top: seededRandom(index * 3 + offset + 7) * 100,
    size: 0.7 + seededRandom(index * 5 + offset + 11) * 2.2,
    opacity: 0.25 + seededRandom(index * 7 + offset + 13) * 0.7,
    duration: 2.4 + seededRandom(index * 11 + offset + 17) * 5.5,
    delay: seededRandom(index * 13 + offset + 19) * -8,
  }));
}

function StarLayer({ stars, className }: { stars: Star[]; className: string }) {
  return (
    <div className={className}>
      {stars.map((star, index) => (
        <span
          key={index}
          className="space-star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SpaceBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const nearStars = useMemo(() => createStars(58, 31), []);
  const farStars = useMemo(() => createStars(92, 107), []);

  useEffect(() => {
    const element = backgroundRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const handlePointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        element.style.setProperty("--space-x", x.toFixed(3));
        element.style.setProperty("--space-y", y.toFixed(3));
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div ref={backgroundRef} className="space-background" aria-hidden="true">
      <div className="space-nebula space-nebula-one" />
      <div className="space-nebula space-nebula-two" />
      <div className="space-orbit space-orbit-one" />
      <div className="space-orbit space-orbit-two" />
      <StarLayer stars={farStars} className="space-star-layer space-star-layer-far" />
      <StarLayer stars={nearStars} className="space-star-layer space-star-layer-near" />
      <div className="space-meteor space-meteor-one" />
      <div className="space-meteor space-meteor-two" />
      <div className="space-anomaly">
        <span />
        <span />
        <span />
      </div>
      <div className="space-vignette" />
    </div>
  );
}
