import { HoverCard } from "./hover-card";
import { Sparkles } from "lucide-react";

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
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-600'
  },
  blue: {
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-600'
  },
  purple: {
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-600'
  },
  pink: {
    text: 'text-pink-700 dark:text-pink-400',
    border: 'border-pink-300 dark:border-pink-600'
  },
  orange: {
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-600'
  },
  teal: {
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-300 dark:border-teal-600'
  },
  indigo: {
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-300 dark:border-indigo-600'
  },
  rose: {
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-600'
  }
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function colorFromWord(word: string): Color {
  return COLORS[hashString(word) % COLORS.length];
}

// Hover Content Component
function HoverContent({ title, description }: { title?: ReactNode; description: ReactNode }) {
  const descriptionNode = description;

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
  const currentColor = colorFromWord(word);
  const colorClasses = COLOR_CLASSES[currentColor];

  return (
    <HoverCard
      content={<HoverContent title={title} description={description} />}
      className={`${colorClasses.text} ${className}`}
    >
      <span className="hover-word underline decoration-wavy decoration-current underline-offset-4">
        {word}
      </span>
    </HoverCard>
  );
} 