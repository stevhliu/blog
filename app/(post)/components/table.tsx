"use client";

import { useState } from "react";

interface TableProps {
  headers: string[];
  data: string[][];
  className?: string;
}

const HOVER_COLORS = [
  'bg-red-50 dark:bg-red-950/20',
  'bg-orange-50 dark:bg-orange-950/20',
  'bg-yellow-50 dark:bg-yellow-950/20',
  'bg-green-50 dark:bg-green-950/20',
  'bg-blue-50 dark:bg-blue-950/20',
  'bg-indigo-50 dark:bg-indigo-950/20',
  'bg-purple-50 dark:bg-purple-950/20',
  'bg-pink-50 dark:bg-pink-950/20',
  'bg-teal-50 dark:bg-teal-950/20',
  'bg-cyan-50 dark:bg-cyan-950/20',
] as const;

type HoverColor = typeof HOVER_COLORS[number];

export function Table({ headers, data, className = "" }: TableProps) {
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
      <table className="w-full caption-bottom text-sm">
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