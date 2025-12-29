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
  table: "w-full caption-bottom text-sm border-separate border-spacing-0",
  thead: "[&_tr]:border-b",
  tbody: "[&_tr:last-child]:border-0",
  headerRow: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  headerCell: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 transition-colors",
  dataRow: "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  dataCell: "p-4 align-middle [&:has([role=checkbox])]:pr-0 transition-colors cursor-pointer",
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

// Table Cell Component
function TableCell({ 
  cell, 
  cellIndex, 
  rowIndex, 
  isHovered, 
  hoverColor, 
  onMouseEnter, 
  onMouseLeave 
}: {
  cell: string;
  cellIndex: number;
  rowIndex: number;
  isHovered: boolean;
  hoverColor: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  // Extract the color from the hoverColor class for the border
  const getBorderColor = (hoverColor: string) => {
    if (hoverColor.includes('green')) return 'border-green-500';
    if (hoverColor.includes('blue')) return 'border-blue-500';
    if (hoverColor.includes('purple')) return 'border-purple-500';
    if (hoverColor.includes('pink')) return 'border-pink-500';
    if (hoverColor.includes('orange')) return 'border-orange-500';
    if (hoverColor.includes('teal')) return 'border-teal-500';
    if (hoverColor.includes('indigo')) return 'border-indigo-500';
    if (hoverColor.includes('rose')) return 'border-rose-500';
    return 'border-gray-500';
  };

  return (
    <td 
      key={cellIndex} 
      className={`${TABLE_CLASSES.dataCell} ${isHovered ? hoverColor : ''} ${isHovered ? `border ${getBorderColor(hoverColor)}` : 'border border-transparent'} relative`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {cell}
    </td>
  );
}

// Table Row Component
function TableRow({ 
  row, 
  rowIndex, 
  hoveredCell, 
  hoverColor, 
  onCellMouseEnter, 
  onCellMouseLeave 
}: {
  row: string[];
  rowIndex: number;
  hoveredCell: { row: number; cell: number } | null;
  hoverColor: string;
  onCellMouseEnter: (rowIndex: number, cellIndex: number) => void;
  onCellMouseLeave: () => void;
}) {
  return (
    <tr className={TABLE_CLASSES.dataRow}>
      {row.map((cell, cellIndex) => (
        <TableCell
          key={cellIndex}
          cell={cell}
          cellIndex={cellIndex}
          rowIndex={rowIndex}
          isHovered={hoveredCell?.row === rowIndex && hoveredCell?.cell === cellIndex}
          hoverColor={hoverColor}
          onMouseEnter={() => onCellMouseEnter(rowIndex, cellIndex)}
          onMouseLeave={onCellMouseLeave}
        />
      ))}
    </tr>
  );
}

// Table Body Component
function TableBody({ 
  data, 
  hoveredCell, 
  hoverColor, 
  onCellMouseEnter, 
  onCellMouseLeave 
}: {
  data: string[][];
  hoveredCell: { row: number; cell: number } | null;
  hoverColor: string;
  onCellMouseEnter: (rowIndex: number, cellIndex: number) => void;
  onCellMouseLeave: () => void;
}) {
  return (
    <tbody className={TABLE_CLASSES.tbody}>
      {data.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          hoveredCell={hoveredCell}
          hoverColor={hoverColor}
          onCellMouseEnter={onCellMouseEnter}
          onCellMouseLeave={onCellMouseLeave}
        />
      ))}
    </tbody>
  );
}

export function Table({ headers, data, className = "", caption, title }: TableProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; cell: number } | null>(null);
  const [hoverColor, setHoverColor] = useState<HoverColor>(HOVER_COLORS[0]);

  const getRandomHoverColor = (): HoverColor => 
    HOVER_COLORS[Math.floor(Math.random() * HOVER_COLORS.length)];

  const handleCellMouseEnter = (rowIndex: number, cellIndex: number) => {
    setHoveredCell({ row: rowIndex, cell: cellIndex });
    setHoverColor(getRandomHoverColor());
  };

  const handleCellMouseLeave = () => setHoveredCell(null);

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
          hoveredCell={hoveredCell}
          hoverColor={hoverColor}
          onCellMouseEnter={handleCellMouseEnter}
          onCellMouseLeave={handleCellMouseLeave}
        />
      </table>
    </div>
  );
} 