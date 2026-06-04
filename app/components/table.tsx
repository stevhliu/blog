interface TableProps {
  headers: string[];
  data: string[][];
  className?: string;
  caption?: string;
  title?: string;
}

const TABLE_CLASSES = {
  container: "w-full overflow-auto",
  table: "w-full caption-bottom text-sm border-separate border-spacing-0",
  thead: "[&_tr]:border-b",
  tbody: "[&_tr:last-child]:border-0",
  headerRow: "border-b transition-[background-color,color] duration-150 ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--color-surface)] data-[state=selected]:bg-[var(--color-surface)]",
  headerCell: "h-12 px-4 text-left align-middle font-medium text-[var(--color-subtext)] [&:has([role=checkbox])]:pr-0 transition-[background-color,color] duration-150 ease-[var(--ease-out)]",
  dataRow: "border-b transition-[background-color,color] duration-150 ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--color-surface)] data-[state=selected]:bg-[var(--color-surface)]",
  dataCell: "border border-transparent p-4 align-middle transition-[background-color,border-color,color] duration-150 ease-[var(--ease-out)] [@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--color-rule-soft)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--color-surface)] [&:has([role=checkbox])]:pr-0",
  title: "mb-4 text-lg font-semibold text-center",
  caption: "mt-4 text-sm text-[var(--color-subtext)]"
} as const;

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

function TableRow({ row }: { row: string[] }) {
  return (
    <tr className={TABLE_CLASSES.dataRow}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex} className={TABLE_CLASSES.dataCell}>
          {cell}
        </td>
      ))}
    </tr>
  );
}

function TableBody({ data }: { data: string[][] }) {
  return (
    <tbody className={TABLE_CLASSES.tbody}>
      {data.map((row, rowIndex) => (
        <TableRow
          key={rowIndex}
          row={row}
        />
      ))}
    </tbody>
  );
}

export function Table({ headers, data, className = "", caption, title }: TableProps) {
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
        <TableBody data={data} />
      </table>
    </div>
  );
} 