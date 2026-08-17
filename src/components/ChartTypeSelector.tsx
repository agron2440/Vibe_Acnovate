import type { ChartType } from '../types/chart';
import { chartConfigs } from '../data/chartConfigs';

interface Props {
  onSelect: (type: ChartType) => void;
}

const CHART_ORDER: ChartType[] = ['bar', 'line', 'area', 'pie', 'scatter', 'radar'];

function ChartIcon({ type }: { type: ChartType }) {
  const cls = 'w-12 h-12 text-indigo-500 group-hover:text-indigo-600 transition-colors';
  switch (type) {
    case 'bar':
      return (
        <svg className={cls} viewBox="0 0 48 48" fill="currentColor">
          <rect x="4" y="26" width="10" height="18" rx="2" />
          <rect x="19" y="14" width="10" height="30" rx="2" />
          <rect x="34" y="6" width="10" height="38" rx="2" />
        </svg>
      );
    case 'line':
      return (
        <svg className={cls} viewBox="0 0 48 48" fill="none">
          <polyline
            points="4,38 14,22 26,30 44,10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="4" cy="38" r="3" fill="currentColor" />
          <circle cx="14" cy="22" r="3" fill="currentColor" />
          <circle cx="26" cy="30" r="3" fill="currentColor" />
          <circle cx="44" cy="10" r="3" fill="currentColor" />
        </svg>
      );
    case 'area':
      return (
        <svg className={cls} viewBox="0 0 48 48" fill="none">
          <path
            d="M4,38 L14,22 L26,30 L44,10 L44,44 L4,44 Z"
            fill="currentColor"
            opacity="0.2"
          />
          <polyline
            points="4,38 14,22 26,30 44,10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'pie':
      return (
        <svg className={cls} viewBox="0 0 48 48">
          <path d="M24,24 L24,4 A20,20 0 0,1 44,24 Z" fill="currentColor" />
          <path d="M24,24 L44,24 A20,20 0 0,1 12.4,41.3 Z" fill="currentColor" opacity="0.6" />
          <path d="M24,24 L12.4,41.3 A20,20 0 0,1 24,4 Z" fill="currentColor" opacity="0.35" />
        </svg>
      );
    case 'scatter':
      return (
        <svg className={cls} viewBox="0 0 48 48" fill="currentColor">
          <circle cx="9" cy="38" r="4" />
          <circle cx="22" cy="22" r="4" />
          <circle cx="36" cy="30" r="4" />
          <circle cx="15" cy="30" r="4" />
          <circle cx="41" cy="12" r="4" />
          <circle cx="30" cy="40" r="4" />
          <circle cx="8" cy="14" r="4" />
        </svg>
      );
    case 'radar':
      return (
        <svg className={cls} viewBox="0 0 48 48" fill="none">
          <polygon
            points="24,4 44,17 37,40 11,40 4,17"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.3"
          />
          <polygon
            points="24,11 36,20 31,36 17,36 12,20"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.4"
          />
          <polygon
            points="24,7 40,18 34,38 14,38 8,18"
            fill="currentColor"
            opacity="0.2"
          />
          <line x1="24" y1="4" x2="24" y2="40" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
          <line x1="4" y1="17" x2="44" y2="40" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
          <line x1="44" y1="17" x2="4" y2="40" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        </svg>
      );
  }
}

export default function ChartTypeSelector({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center justify-start h-full overflow-auto p-8 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create a Chart</h1>
          <p className="mt-2 text-gray-500">Choose the type of chart you want to create</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {CHART_ORDER.map((type) => {
            const config = chartConfigs[type];
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="group flex flex-col items-center p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <ChartIcon type={type} />
                <span className="mt-3 text-sm font-semibold text-gray-900">{config.label}</span>
                <span className="mt-1 text-xs text-gray-500 text-center leading-relaxed">
                  {config.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
