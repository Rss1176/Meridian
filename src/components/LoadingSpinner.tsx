"use client";

import { useEffect } from "react";

export function LoadingSpinner({
  size = 36,
  color = "#8b5cf6",
}: {
  size?: number;
  color?: string;
}) {
  useEffect(() => {
    async function register() {
      const { ring } = await import("ldrs");
      ring.register();
    }
    register();
  }, []);

  return (
    <l-ring
      size={size.toString()}
      stroke="3"
      color={color}
      speed="2"
    />
  );
}

export function LoadingDots({ color = "#8b5cf6" }: { color?: string }) {
  useEffect(() => {
    async function register() {
      const { dotPulse } = await import("ldrs");
      dotPulse.register();
    }
    register();
  }, []);

  return <l-dot-pulse size="30" color={color} speed="1.3" />;
}
