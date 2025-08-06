"use client";

import { useState } from "react";

interface TableProps {
  headers: string[];
  data: string[][];
  className?: string;
  caption?: string;
  title?: string;
}

// Color system
const COLORS = ['green', 'blue', 'purple', 'pink', 'orange', 'teal', 'indigo', 'rose'] as const;
type Color = typeof COLORS[number];

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

// Constants
const TABLE_CLASSES = {
  container: "w-full overflow-auto",
  table: "w-full caption-bottom text-sm",
  thead: "[&_tr]:border-b",
  tbody: "[&_tr:last-child]:border-0",
  headerRow: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  headerCell: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
  dataRow: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  dataCell: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  title: "mb-4 text-lg font-semibold text-center",
  caption: "mt-4 text-sm text-muted-foreground"
} as const;

// Table Header Component
function TableHeader({ headers }: { headers: string[] }) {
  return (
    <thead className={TABLE_CLASSES.thead}>
      <tr className={TABLE_CLASSES.headerRow}>
        {headers.map((header, index) => (
          <th key={index} className={TABLE_CLASSES.headerCell}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// Table Row Component
function TableRow({ 
  row, 
  rowIndex, 
  isHovered, 
  hoverColor, 
  onMouseEnter, 
  onMouseLeave 
}: {
  row: string[];
  rowIndex: number;
  isHovered: boolean;
  hoverColor: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <tr 
      className={`${TABLE_CLASSES.dataRow} ${isHovered ? hoverColor : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className={TABLE_CLASSES.dataCell}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

// Table Body Component
function TableBody({ 
  data, 
  hoveredRow, 
  hoverColor, 
  onRowMouseEnter, 
  onRowMouseLeave 
}: {
  data: string[][];
  hoveredRow: number | null;
  hoverColor: string;
  onRowMouseEnter: (rowIndex: number) => void;
  onRowMouseLeave: () => void;
}) {
  return (
    <tbody className={TABLE_CLASSES.tbody}>
      {data.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          isHovered={hoveredRow === rowIndex}
          hoverColor={hoverColor}
          onMouseEnter={() => onRowMouseEnter(rowIndex)}
          onMouseLeave={onRowMouseLeave}
        />
      ))}
    </tbody>
  );
}

export function Table({ headers, data, className = "", caption, title }: TableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoverColor, setHoverColor] = useState<HoverColor>(HOVER_COLORS[0]);

  const getRandomHoverColor = (): HoverColor => 
    HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)];

  const handleRowMouseEnter = (rowIndex: number) => {
    setHoveredRow(rowIndex);
    setHoverColor(getRandomHoverColor());
  };

  const handleRowMouseLeave = () => setHoveredRow(null);

  return (
    <div className={`${TABLE_CLASSES.container} ${className}`}>
      {title && (
        <h3 className={TABLE_CLASSES.title}>{title}</h3>
      )}
      <table className={TABLE_CLASSES.table}>
        {caption && (
          <caption className={TABLE_CLASSES.caption}>
            {caption}
          </caption>
        )}
        <TableHeader headers={headers} />
        <TableBody
          data={data}
          hoveredRow={hoveredRow}
          hoverColor={hoverColor}
          onRowMouseEnter={handleRowMouseEnter}
          onRowMouseLeave={handleRowMouseLeave}
        />
      </table>
    </div>
  );
} 