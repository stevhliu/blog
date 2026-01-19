"use client";

import { HoverCard } from "./hover-card";
import { Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

import type { ReactNode } from "react";

interface HoverWordProps {
  word: string;
  title?: ReactNode;
  description: ReactNode;
  className?: string;
}

// Color system
const COLORS = ['green', 'blue', 'purple', 'pink', 'orange', 'teal', 'indigo', 'rose'] as const;
type Color = typeof COLORS[number];

const COLOR_CLASSES: Record<Color, { text: string; border: string }> = {
  green: {
    text: 'text-green-600 dark:text-green-400',
    border: 'border-green-300 dark:border-green-600'
  },
  blue: {
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-600'
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-600'
  },
  pink: {
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-300 dark:border-pink-600'
  },
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-600'
  },
  teal: {
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-600'
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-600'
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-600'
  }
};

// Cursor SVG utilities
const createCursorSvg = (strokeColor: string) => 
  `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pointer-icon lucide-pointer"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
`)}`;

const CURSOR_SVGS = {
  light: createCursorSvg('#000000'),
  dark: createCursorSvg('#ffffff')
};

// Dark mode hook
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};

// Hover Content Component
function HoverContent({ title, description }: { title?: ReactNode; description: ReactNode }) {
  const descriptionNode =
    typeof description === "string" ? (
      <span dangerouslySetInnerHTML={{ __html: description }} />
    ) : (
      description
    );

  return (
    <span className="flex items-start gap-2">
      <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>
        {title ? (
          <>
            <strong>{title}</strong>{" "}
          </>
        ) : null}
        {descriptionNode}
      </span>
    </span>
  );
}

export function HoverWord({ word, title, description, className = "" }: HoverWordProps) {
  const [currentColor, setCurrentColor] = useState<Color>('blue');
  const isDarkMode = useDarkMode();

  const getRandomColor = (): Color => 
    COLORS[Math.floor(Math.random() * COLORS.length)];

  useEffect(() => {
    setCurrentColor(getRandomColor());
  }, []);

  const colorClasses = COLOR_CLASSES[currentColor];
  const cursorSvg = isDarkMode ? CURSOR_SVGS.dark : CURSOR_SVGS.light;

  return (
    <HoverCard
      content={<HoverContent title={title} description={description} />}
      className={`${colorClasses.text} ${className}`}
    >
      <span 
        className="underline decoration-wavy decoration-current underline-offset-4"
        style={{ cursor: `url("${cursorSvg}") 0 0, pointer` }}
      >
        {word}
      </span>
    </HoverCard>
  );
} 