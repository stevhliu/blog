"use client";

import React, { useState, useRef, useEffect } from "react";

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

// Constants
const OFFSET = 8;
const HIDE_DELAY = 100;

// Timeout utility
const useTimeout = () => {
  const timeoutRef = useRef<number | undefined>(undefined);
  
  const clearTimeout = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  };
  
  const setTimeout = (callback: () => void, delay: number) => {
    clearTimeout();
    timeoutRef.current = window.setTimeout(callback, delay);
  };
  
  useEffect(() => clearTimeout, []);
  
  return { setTimeout, clearTimeout };
};

// Position calculation utilities
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
  
  // Constrain horizontal position
  if (left < OFFSET) left = OFFSET;
  if (left + contentRect.width > viewportWidth - OFFSET) {
    left = viewportWidth - contentRect.width - OFFSET;
  }
  
  // Constrain vertical position
  if (top < OFFSET) top = OFFSET;
  if (top + contentRect.height > viewportHeight - OFFSET) {
    top = viewportHeight - contentRect.height - OFFSET;
  }
  
  return { top, left };
};

// Hover Content Component
function HoverContent({ 
  content, 
  position, 
  contentClassName, 
  onMouseEnter, 
  onMouseLeave,
  contentRef
}: {
  content: React.ReactNode;
  position: Position;
  contentClassName: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  contentRef: React.RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span
      ref={contentRef}
      className={`fixed z-50 p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs block ${contentClassName}`}
      style={{ top: position.top, left: position.left }}
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
  delay = 300,
  side = "top",
  align = "center",
}: HoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const { setTimeout, clearTimeout } = useTimeout();

  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    // Calculate base position based on side
    const sidePosition = calculateSidePosition(side, triggerRect, contentRect);
    
    // Apply alignment
    const alignedPosition = calculateAlignment(side, align, triggerRect, contentRect);
    
    // Combine positions - alignment overrides side position for the relevant axis
    const isVertical = side === "top" || side === "bottom";
    const combinedPosition = {
      top: isVertical ? sidePosition.top : alignedPosition.top,
      left: isVertical ? alignedPosition.left : sidePosition.left,
    };
    
    // Constrain to viewport
    const finalPosition = constrainToViewport(combinedPosition, contentRect);
    
    setPosition(finalPosition);
  };

  const handleMouseEnter = () => {
    clearTimeout();
    setTimeout(() => {
      setIsOpen(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    clearTimeout();
    setTimeout(() => setIsOpen(false), HIDE_DELAY);
  };

  const handleContentMouseEnter = () => {
    clearTimeout();
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  return (
    <span
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isOpen && (
        <HoverContent
          content={content}
          position={position}
          contentClassName={contentClassName}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleMouseLeave}
          contentRef={contentRef}
        />
      )}
    </span>
  );
} 