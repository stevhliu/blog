"use client";

import { HoverCard } from "./hover-card";
import { Sparkle } from "lucide-react";
import { useState, useEffect } from "react";

interface HoverWordProps {
  word: string;
  title: string;
  description: string;
  className?: string;
}

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

export function HoverWord({ word, title, description, className = "" }: HoverWordProps) {
  const [currentColor, setCurrentColor] = useState<Color>('blue');

  const getRandomColor = (): Color => 
    COLORS[Math.floor(Math.random() * COLORS.length)];

  useEffect(() => {
    setCurrentColor(getRandomColor());
  }, []);

  const colorClasses = COLOR_CLASSES[currentColor];

  return (
    <HoverCard
      content={
        <span className="flex items-start gap-2">
          <Sparkle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>{title}</strong> {description}
          </span>
        </span>
      }
      className={`${colorClasses.text} cursor-help ${className}`}
    >
      <span className="underline decoration-wavy decoration-current underline-offset-2">
        {word}
      </span>
    </HoverCard>
  );
} 