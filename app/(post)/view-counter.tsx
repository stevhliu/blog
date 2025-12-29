"use client";

import { useEffect, useRef, useState } from "react";

export function ViewCounter({
  id,
  initialViews,
}: {
  id: string;
  initialViews: string;
}) {
  const [views, setViews] = useState(initialViews);
  const didLogViewRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (didLogViewRef.current) return;

    didLogViewRef.current = true;
    const url = "/api/view?incr=1&id=" + encodeURIComponent(id);
    fetch(url)
      .then(res => res.json())
      .then(obj => {
        if (obj.viewsFormatted) {
          setViews(obj.viewsFormatted);
        }
      })
      .catch(console.error);
  }, [id]);

  return <span>{views} views</span>;
}

