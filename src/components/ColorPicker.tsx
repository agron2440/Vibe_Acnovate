import { useState } from 'react';

const PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#64748b', '#1e293b', '#000000',
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0'))
      .join('')
  );
}

interface Props {
  color: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ color, onChange, onClose }: Props) {
  const [hex, setHex] = useState(color.toLowerCase());
  const [rgb, setRgb] = useState<{ r: number; g: number; b: number }>(
    () => hexToRgb(color) ?? { r: 99, g: 102, b: 241 },
  );

  const isValidHex = /^#[0-9a-f]{6}$/i.test(hex);
  const previewColor = isValidHex ? hex : color;

  const applyHex = (raw: string) => {
    setHex(raw);
    const parsed = hexToRgb(raw);
    if (parsed) {
      setRgb(parsed);
      onChange(raw.toLowerCase());
    }
  };

  const applyRgb = (ch: 'r' | 'g' | 'b', raw: string) => {
    const val = Math.max(0, Math.min(255, parseInt(raw) || 0));
    const next = { ...rgb, [ch]: val };
    setRgb(next);
    const nextHex = rgbToHex(next.r, next.g, next.b);
    setHex(nextHex);
    onChange(nextHex);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-56">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Series color
      </p>

      {/* Swatches */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {PALETTE.map((swatch) => (
          <button
            key={swatch}
            onClick={() => { applyHex(swatch); onClose(); }}
            title={swatch}
            className={`w-7 h-7 rounded-md transition-transform hover:scale-110 focus:outline-none ${
              previewColor.toLowerCase() === swatch
                ? 'ring-2 ring-offset-1 ring-gray-500'
                : ''
            }`}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>

      <div className="border-t border-gray-100 pt-2.5 space-y-2">
        {/* Preview + Hex */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg border border-gray-200 shrink-0"
            style={{ backgroundColor: previewColor }}
          />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
              Hex
            </label>
            <input
              type="text"
              value={hex}
              onChange={(e) => applyHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onClose();
                e.stopPropagation();
              }}
              maxLength={7}
              placeholder="#000000"
              spellCheck={false}
              className={`block w-full px-1.5 py-1 text-xs font-mono border rounded focus:outline-none ${
                isValidHex
                  ? 'border-gray-200 focus:border-indigo-400'
                  : 'border-red-300 focus:border-red-400'
              }`}
            />
          </div>
        </div>

        {/* RGB inputs */}
        <div className="grid grid-cols-3 gap-1.5">
          {(['r', 'g', 'b'] as const).map((ch) => (
            <div key={ch}>
              <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                {ch}
              </label>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb[ch]}
                onChange={(e) => applyRgb(ch, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onClose();
                  e.stopPropagation();
                }}
                className="block w-full px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-3 w-full py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
