"use client";

import { useState } from "react";

interface TableProps {
  headers: string[];
  data: string[][];
  className?: string;
  caption?: string;
  title?: string;
}

const HOVER_COLORS = [
  'bg-green-100 dark:bg-green-800/30',
  'bg-blue-100 dark:bg-blue-800/30',
  'bg-purple-100 dark:bg-purple-800/30',
  'bg-pink-100 dark:bg-pink-800/30',
  'bg-orange-100 dark:bg-orange-800/30',
  'bg-teal-100 dark:bg-teal-800/30',
  'bg-indigo-100 dark:bg-indigo-800/30',
  'bg-rose-100 dark:bg-rose-800/30',
] as const;

type HoverColor = typeof HOVER_COLORS[number];

export function Table({ headers, data, className = "", caption, title }: TableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoverColor, setHoverColor] = useState<HoverColor>(HOVER_COLORS[0]);

  const getRandomHoverColor = (): HoverColor => {
    return HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)];
  };

  const handleRowMouseEnter = (rowIndex: number) => {
    setHoveredRow(rowIndex);
    setHoverColor(getRandomHoverColor());
  };

  const handleRowMouseLeave = () => {
    setHoveredRow(null);
  };

  return (
    <div className={`w-full overflow-auto ${className}`}>
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-center">{title}</h3>
      )}
      <table className="w-full caption-bottom text-sm">
        {caption && (
          <caption className="mt-4 text-sm text-muted-foreground">
            {caption}
          </caption>
        )}
        <thead className="[&_tr]:border-b">
          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
            {headers.map((header, index) => (
              <th
                key={index}
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
                hoveredRow === rowIndex ? hoverColor : ''
              }`}
              onMouseEnter={() => handleRowMouseEnter(rowIndex)}
              onMouseLeave={handleRowMouseLeave}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 