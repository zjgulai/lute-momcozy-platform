import { cn } from "@/lib/utils/cn";

interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
  compact?: boolean;
}

export function Table({ headers, rows, className, compact }: TableProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-neutral-200", className)}>
      <table className="table-base">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={compact ? "py-2" : undefined}>
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
