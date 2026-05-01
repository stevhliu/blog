"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";

interface HoverCardProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

type Position = { top: number; left: number };
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const OFFSET = 8;
const HIDE_DELAY = 100;
const DEFAULT_OPEN_DELAY = 200;
const INSTANT_REOPEN_WINDOW = 700;

let instantHoverUntil = 0;

function keepTooltipsWarm() {
  instantHoverUntil = Date.now() + INSTANT_REOPEN_WINDOW;
}

function shouldOpenInstantly() {
  return Date.now() < instantHoverUntil;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

const useTimeout = () => {
  const timeoutRef = useRef<number | undefined>(undefined);

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const setTimeout = useCallback((callback: () => void, delay: number) => {
    clearTimeout();
    timeoutRef.current = window.setTimeout(callback, delay);
  }, [clearTimeout]);

  useEffect(() => clearTimeout, [clearTimeout]);

  return { setTimeout, clearTimeout };
};

const calculateSidePosition = (side: Side, triggerRect: DOMRect, contentRect: DOMRect): Position => {
  const basePosition = { top: 0, left: 0 };

  switch (side) {
    case "top":
      basePosition.top = triggerRect.top - contentRect.height - OFFSET;
      break;
    case "bottom":
      basePosition.top = triggerRect.bottom + OFFSET;
      break;
    case "left":
      basePosition.left = triggerRect.left - contentRect.width - OFFSET;
      break;
    case "right":
      basePosition.left = triggerRect.right + OFFSET;
      break;
  }

  return basePosition;
};

const calculateAlignment = (side: Side, align: Align, triggerRect: DOMRect, contentRect: DOMRect): Position => {
  const position = { top: 0, left: 0 };
  const isVertical = side === "top" || side === "bottom";

  switch (align) {
    case "start":
      if (isVertical) {
        position.left = triggerRect.left;
      } else {
        position.top = triggerRect.top;
      }
      break;
    case "center":
      if (isVertical) {
        position.left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
      } else {
        position.top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
      }
      break;
    case "end":
      if (isVertical) {
        position.left = triggerRect.right - contentRect.width;
      } else {
        position.top = triggerRect.bottom - contentRect.height;
      }
      break;
  }

  return position;
};

const constrainToViewport = (position: Position, contentRect: DOMRect): Position => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let { top, left } = position;

  if (left < OFFSET) left = OFFSET;
  if (left + contentRect.width > viewportWidth - OFFSET) {
    left = viewportWidth - contentRect.width - OFFSET;
  }

  if (top < OFFSET) top = OFFSET;
  if (top + contentRect.height > viewportHeight - OFFSET) {
    top = viewportHeight - contentRect.height - OFFSET;
  }

  return { top, left };
};

function transformOriginForSide(side: Side): string {
  switch (side) {
    case "top":    return "50% 100%";
    case "bottom": return "50% 0%";
    case "left":   return "100% 50%";
    case "right":  return "0% 50%";
  }
}

function HoverContent({
  id,
  content,
  position,
  contentClassName,
  onMouseEnter,
  onMouseLeave,
  contentRef,
  side,
  isOpen,
  isInstant,
  prefersReducedMotion,
}: {
  id: string;
  content: React.ReactNode;
  position: Position;
  contentClassName: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  contentRef: React.RefObject<HTMLSpanElement | null>;
  side: Side;
  isOpen: boolean;
  isInstant: boolean;
  prefersReducedMotion: boolean;
}) {
  return (
    <span
      id={id}
      ref={contentRef}
      role="tooltip"
      inert={!isOpen ? true : undefined}
      className={`fixed z-50 block max-w-xs rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800 ${contentClassName}`}
      style={{
        top: position.top,
        left: position.left,
        transformOrigin: transformOriginForSide(side),
        transition: prefersReducedMotion || isInstant
          ? "opacity 0ms, transform 0ms"
          : "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)",
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? "scale(1)" : "scale(0.95)",
        pointerEvents: isOpen ? "auto" : "none",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </span>
  );
}

export function HoverCard({
  children,
  content,
  className = "",
  contentClassName = "",
  delay = DEFAULT_OPEN_DELAY,
  side = "top",
  align = "center",
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInstant, setIsInstant] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const contentId = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const { setTimeout, clearTimeout } = useTimeout();
  const prefersReducedMotion = usePrefersReducedMotion();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    const sidePosition = calculateSidePosition(side, triggerRect, contentRect);
    const alignedPosition = calculateAlignment(side, align, triggerRect, contentRect);

    const isVertical = side === "top" || side === "bottom";
    const combinedPosition = {
      top: isVertical ? sidePosition.top : alignedPosition.top,
      left: isVertical ? alignedPosition.left : sidePosition.left,
    };

    const finalPosition = constrainToViewport(combinedPosition, contentRect);
    setPosition(finalPosition);
  }, [side, align]);

  const openTooltip = useCallback((source: "pointer" | "keyboard") => {
    const instant = prefersReducedMotion || source === "keyboard" || shouldOpenInstantly();
    clearTimeout();
    setIsInstant(instant);
    setIsMounted(true);
    setTimeout(() => {
      keepTooltipsWarm();
      setIsOpen(true);
      updatePosition();
    }, instant ? 0 : delay);
  }, [clearTimeout, delay, prefersReducedMotion, setTimeout, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    openTooltip("pointer");
  }, [openTooltip]);

  const handleMouseLeave = useCallback(() => {
    clearTimeout();
    keepTooltipsWarm();
    setTimeout(() => setIsOpen(false), HIDE_DELAY);
  }, [clearTimeout, setTimeout]);

  const handleFocus = useCallback(() => {
    openTooltip("keyboard");
  }, [openTooltip]);

  const handleContentMouseEnter = useCallback(() => {
    clearTimeout();
  }, [clearTimeout]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== "Escape") return;
    clearTimeout();
    setIsOpen(false);
  }, [clearTimeout]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  return (
    <span
      ref={triggerRef}
      tabIndex={0}
      aria-describedby={isOpen ? contentId : undefined}
      className={`inline-block rounded-sm transition-[opacity,transform] duration-150 ease-out active:opacity-90 motion-reduce:transition-none motion-reduce:active:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isMounted ? (
        <HoverContent
          id={contentId}
          content={content}
          position={position}
          contentClassName={contentClassName}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleMouseLeave}
          contentRef={contentRef}
          side={side}
          isOpen={isOpen}
          isInstant={isInstant}
          prefersReducedMotion={prefersReducedMotion}
        />
      ) : null}
    </span>
  );
}
