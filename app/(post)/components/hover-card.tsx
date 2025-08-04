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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calculate position based on side and align
    switch (side) {
      case "top":
        top = triggerRect.top - contentRect.height - 8;
        break;
      case "bottom":
        top = triggerRect.bottom + 8;
        break;
      case "left":
        left = triggerRect.left - contentRect.width - 8;
        break;
      case "right":
        left = triggerRect.right + 8;
        break;
    }

    // Handle alignment
    switch (align) {
      case "start":
        if (side === "top" || side === "bottom") {
          left = triggerRect.left;
        } else {
          top = triggerRect.top;
        }
        break;
      case "center":
        if (side === "top" || side === "bottom") {
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        }
        break;
      case "end":
        if (side === "top" || side === "bottom") {
          left = triggerRect.right - contentRect.width;
        } else {
          top = triggerRect.bottom - contentRect.height;
        }
        break;
    }

    // Ensure content stays within viewport
    if (left < 8) left = 8;
    if (left + contentRect.width > viewportWidth - 8) {
      left = viewportWidth - contentRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + contentRect.height > viewportHeight - 8) {
      top = viewportHeight - contentRect.height - 8;
    }

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      ref={triggerRef}
      className={`inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isOpen && (
        <span
          ref={contentRef}
          className={`fixed z-50 p-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs block ${contentClassName}`}
          style={{
            top: position.top,
            left: position.left,
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </span>
      )}
    </span>
  );
} 