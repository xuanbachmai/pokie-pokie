'use client';
import { SymbolCell } from './SymbolCell';
import { SymbolId, WinLine } from '@/types/game';

interface Props {
  col: number;
  symbols: SymbolId[];
  spinning: boolean;
  winLines: WinLine[];
}

export function ReelStrip({ col, symbols, spinning, winLines }: Props) {
  const highlightedRows = new Set<number>();
  winLines.forEach(line => {
    line.cellPositions.forEach(([c, r]) => {
      if (c === col) highlightedRows.add(r);
    });
  });

  return (
    <div className="flex flex-col gap-1 h-full">
      {symbols.map((symId, row) => (
        <div key={row} className="flex-1">
          <SymbolCell
            symbolId={symId}
            highlighted={!spinning && highlightedRows.has(row)}
            spinning={spinning}
          />
        </div>
      ))}
    </div>
  );
}
