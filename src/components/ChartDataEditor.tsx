import { useState, useEffect } from 'react';
import type { ChartType, ColumnDef, DataRow } from '../types/chart';
import { COLORS } from '../data/chartConfigs';
import { parseAccountingNumber } from '../utils/numberParsing';
import ColorPicker from './ColorPicker';

interface Props {
  chartType: ChartType;
  data: DataRow[];
  columns: ColumnDef[];
  onChange: (data: DataRow[]) => void;
  onColumnsChange: (cols: ColumnDef[]) => void;
}

const SERIES_ADDABLE: ChartType[] = ['bar', 'line', 'area', 'radar'];
const SERIES_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function ChartDataEditor({
  chartType,
  data,
  columns,
  onChange,
  onColumnsChange,
}: Props) {
  const [editingColKey, setEditingColKey] = useState<string | null>(null);
  // header-level series color picker
  const [colorPickerKey, setColorPickerKey] = useState<string | null>(null);
  // row-level slice color picker — key format: "{rowIdx}:{colKey}"
  const [cellPickerKey, setCellPickerKey] = useState<string | null>(null);

  useEffect(() => {
    if (!colorPickerKey) return;
    const close = () => setColorPickerKey(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [colorPickerKey]);

  useEffect(() => {
    if (!cellPickerKey) return;
    const close = () => setCellPickerKey(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [cellPickerKey]);

  const seriesColumns = columns.filter((c) => c.isSeries);
  const canAddSeries = SERIES_ADDABLE.includes(chartType) && seriesColumns.length < 6;

  // ── cell editing ──────────────────────────────────────────────────────────

  const handleCellChange = (
    rowIdx: number,
    key: string,
    rawValue: string,
    colType: 'text' | 'number',
  ) => {
    const updated = [...data];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [key]: colType === 'number' ? parseAccountingNumber(rawValue) : rawValue,
    };
    onChange(updated);
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    rowIdx: number,
    colKey: string,
  ) => {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\t') && !text.includes('\n')) return;

    e.preventDefault();

    const lines = text.replace(/\r/g, '').split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
    const grid = lines.map((line) => line.split('\t'));

    const pasteableCols = columns.filter((c) => c.type !== 'color');
    const startColIdx = pasteableCols.findIndex((c) => c.key === colKey);
    if (startColIdx === -1) return;

    const updated = [...data];

    grid.forEach((rowValues, r) => {
      const targetRowIdx = rowIdx + r;
      if (targetRowIdx >= updated.length) {
        const newRow: DataRow = {};
        columns.forEach((col) => {
          if (col.type === 'number') newRow[col.key] = 0;
          else if (col.type === 'color') newRow[col.key] = COLORS[updated.length % COLORS.length];
          else newRow[col.key] = '';
        });
        updated.push(newRow);
      }

      const row = { ...updated[targetRowIdx] };
      rowValues.forEach((value, c) => {
        const col = pasteableCols[startColIdx + c];
        if (!col) return;
        row[col.key] = col.type === 'number' ? parseAccountingNumber(value) : value;
      });
      updated[targetRowIdx] = row;
    });

    onChange(updated);
  };

  const handleSliceColorChange = (rowIdx: number, key: string, color: string) => {
    const updated = [...data];
    updated[rowIdx] = { ...updated[rowIdx], [key]: color };
    onChange(updated);
  };

  // ── row operations ────────────────────────────────────────────────────────

  const addRow = () => {
    const newRow: DataRow = {};
    columns.forEach((col) => {
      if (col.type === 'number') newRow[col.key] = 0;
      else if (col.type === 'color') newRow[col.key] = COLORS[data.length % COLORS.length];
      else newRow[col.key] = '';
    });
    onChange([...data, newRow]);
  };

  const removeRow = (idx: number) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  // ── column label editing ──────────────────────────────────────────────────

  const handleLabelChange = (key: string, newLabel: string) => {
    onColumnsChange(columns.map((c) => (c.key === key ? { ...c, label: newLabel } : c)));
  };

  const handleLabelBlur = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (col && !col.label.trim()) {
      onColumnsChange(columns.map((c) => (c.key === key ? { ...c, label: c.key } : c)));
    }
    setEditingColKey(null);
  };

  // ── series color operations ───────────────────────────────────────────────

  const handleSeriesColorChange = (key: string, color: string) => {
    onColumnsChange(columns.map((c) => (c.key === key ? { ...c, color } : c)));
  };

  // ── series operations ─────────────────────────────────────────────────────

  const addSeries = () => {
    const existingKeys = new Set(columns.map((c) => c.key));
    let counter = 1;
    let newKey = 'series1';
    while (existingKeys.has(newKey)) {
      counter++;
      newKey = `series${counter}`;
    }
    const letter = SERIES_LETTERS[seriesColumns.length % 26];
    const newCol: ColumnDef = {
      key: newKey,
      label: `Series ${letter}`,
      type: 'number',
      isSeries: true,
      color: COLORS[seriesColumns.length % COLORS.length],
    };
    onColumnsChange([...columns, newCol]);
    onChange(data.map((row) => ({ ...row, [newKey]: 0 })));
  };

  const removeSeries = (key: string) => {
    if (seriesColumns.length <= 1) return;
    onColumnsChange(columns.filter((c) => c.key !== key));
    onChange(
      data.map((row) =>
        Object.fromEntries(Object.entries(row).filter(([k]) => k !== key)) as DataRow,
      ),
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              {columns.map((col) => {
                const seriesIdx = seriesColumns.indexOf(col);
                // Only show series color dot on non-pie charts
                const dotColor =
                  col.isSeries && chartType !== 'pie'
                    ? (col.color ?? COLORS[seriesIdx % COLORS.length])
                    : undefined;

                return (
                  <th
                    key={col.key}
                    className="relative px-3 py-2 border-b border-gray-200 first:pl-4 text-left"
                  >
                    {editingColKey === col.key ? (
                      <input
                        type="text"
                        autoFocus
                        value={col.label}
                        onChange={(e) => handleLabelChange(col.key, e.target.value)}
                        onBlur={() => handleLabelBlur(col.key)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === 'Escape') handleLabelBlur(col.key);
                          e.stopPropagation();
                        }}
                        className="w-full min-w-15 px-1.5 py-0.5 text-xs font-semibold bg-white border border-indigo-400 rounded focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 group/hdr min-w-0">
                        {/* series color swatch (not shown for pie) */}
                        {dotColor && (
                          <div className="relative shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setColorPickerKey(
                                  colorPickerKey === col.key ? null : col.key,
                                );
                              }}
                              title="Change series color"
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-white ring-offset-1 hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none"
                              style={{ backgroundColor: dotColor }}
                            />
                            {colorPickerKey === col.key && (
                              <div
                                className="absolute top-full left-0 mt-2 z-30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ColorPicker
                                  color={dotColor}
                                  onChange={(hex) => handleSeriesColorChange(col.key, hex)}
                                  onClose={() => setColorPickerKey(null)}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* for color-type columns show a static palette icon in the header */}
                        {col.type === 'color' && (
                          <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
                            <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" stroke="none" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c.88 0 1.61-.24 2.18-.65A2 2 0 0015 20a2 2 0 002-2v-.5A2.5 2.5 0 0119.5 15H20a2 2 0 002-2 8 8 0 00-10-11z" />
                          </svg>
                        )}

                        <span
                          onClick={() => col.type !== 'color' && setEditingColKey(col.key)}
                          title={col.type !== 'color' ? 'Click to rename' : undefined}
                          className={`text-xs font-semibold text-gray-500 uppercase tracking-wide truncate select-none ${
                            col.type !== 'color' ? 'cursor-text hover:text-indigo-600' : ''
                          }`}
                        >
                          {col.label}
                        </span>

                        {col.isSeries && seriesColumns.length > 1 && (
                          <button
                            onClick={() => removeSeries(col.key)}
                            title="Remove series"
                            className="opacity-0 group-hover/hdr:opacity-100 ml-auto shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-red-500 rounded transition-all"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
              <th className="px-2 py-2 w-8 border-b border-gray-200" />
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="group hover:bg-gray-50">
                {columns.map((col) => {
                  if (col.type === 'color') {
                    const sliceColor = (row[col.key] as string) || COLORS[rowIdx % COLORS.length];
                    const pickerKey = `${rowIdx}:${col.key}`;
                    return (
                      <td key={col.key} className="px-2 py-1 border-b border-gray-100 w-12">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCellPickerKey(cellPickerKey === pickerKey ? null : pickerKey);
                            }}
                            title="Change slice color"
                            className="w-7 h-7 rounded-lg ring-1 ring-gray-200 hover:ring-2 hover:ring-indigo-300 transition-all focus:outline-none"
                            style={{ backgroundColor: sliceColor }}
                          />
                          {cellPickerKey === pickerKey && (
                            <div
                              className="absolute top-full left-0 mt-1 z-30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ColorPicker
                                color={sliceColor}
                                onChange={(hex) => handleSliceColorChange(rowIdx, col.key, hex)}
                                onClose={() => setCellPickerKey(null)}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={col.key} className="px-2 py-1 border-b border-gray-100 first:pl-3">
                      <input
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={row[col.key] ?? ''}
                        onChange={(e) =>
                          handleCellChange(rowIdx, col.key, e.target.value, col.type as 'text' | 'number')
                        }
                        onPaste={(e) => handlePaste(e, rowIdx, col.key)}
                        className="w-full px-2 py-1.5 text-sm bg-transparent border border-transparent rounded-md hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-1 border-b border-gray-100 w-8">
                  <button
                    onClick={() => removeRow(rowIdx)}
                    title="Remove row"
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-sm text-gray-400">
                  No data yet. Click "Add Row" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 shrink-0 flex items-center gap-3">
        <button
          onClick={addRow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Row
        </button>

        {canAddSeries && (
          <>
            <div className="w-px h-4 bg-gray-200" />
            <button
              onClick={addSeries}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Series
            </button>
          </>
        )}
      </div>
    </div>
  );
}
