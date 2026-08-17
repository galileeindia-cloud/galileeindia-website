"use client";

import { useEffect, useState } from "react";

const PARTICLES = ["🌸", "🌼", "🌷", "💐", "✨", "🎉", "🎊", "⭐"];

type Particle = {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
};

export default function Celebration() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Randomizing on mount (client-only) avoids an SSR/client markup
    // mismatch; there's no pure alternative for one-time randomization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        emoji: PARTICLES[Math.floor(Math.random() * PARTICLES.length)],
        left: Math.random() * 100,
        duration: 3 + Math.random() * 2.5,
        delay: Math.random() * 2,
        size: 18 + Math.random() * 18,
      }))
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animation: `confetti-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
