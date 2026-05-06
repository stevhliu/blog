"use client";

import { useEffect, useRef } from "react";

export function ViewCounter({ id }: { id: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (fired.current) return;
    fired.current = true;

    fetch(`/api/view?id=${encodeURIComponent(id)}`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [id]);

  return null;
}
