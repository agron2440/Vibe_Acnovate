import type React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartType, ChartVariants, ColumnDef, DataRow } from '../types/chart';
import { chartConfigs, COLORS } from '../data/chartConfigs';

interface Props {
  chartType: ChartType;
  data: DataRow[];
  columns: ColumnDef[];
  variants: ChartVariants;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ChartPreview({ chartType, data, columns, variants, containerRef }: Props) {
  return (
    <div className="flex flex-col h-full p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 shrink-0">
        Preview
      </p>
      <div ref={containerRef} className="flex-1 min-h-0">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            Add rows to see the chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart(chartType, data, columns, variants)}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function normalizeToPercent(data: DataRow[], seriesCols: ColumnDef[], categoryKey: string): DataRow[] {
  return data.map((row) => {
    const total = seriesCols.reduce((sum, col) => sum + (Number(row[col.key]) || 0), 0);
    const result: DataRow = { [categoryKey]: row[categoryKey] };
    seriesCols.forEach((col) => {
      result[col.key] = total > 0 ? Math.round(((Number(row[col.key]) || 0) / total) * 100) : 0;
    });
    return result;
  });
}

function renderChart(
  chartType: ChartType,
  data: DataRow[],
  columns: ColumnDef[],
  variants: ChartVariants,
) {
  const seriesCols   = columns.filter((c) => c.isSeries);
  const categoryKey  = columns.find((c) => c.type === 'text')?.key ?? chartConfigs[chartType].categoryKey;
  const margin       = { top: 10, right: 24, left: 0, bottom: 5 };

  switch (chartType) {
    // ── Bar ──────────────────────────────────────────────────────────────────
    case 'bar': {
      const v            = variants.bar;
      const isStacked    = v === 'stacked' || v === 'stacked100';
      const isHorizontal = v === 'horizontal';
      const chartData    = v === 'stacked100' ? normalizeToPercent(data, seriesCols, categoryKey) : data;

      if (isHorizontal) {
        return (
          <BarChart layout="vertical" data={chartData} margin={{ ...margin, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey={categoryKey} type="category" width={70} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {seriesCols.map((col, i) => (
              <Bar key={col.key} dataKey={col.key} name={col.label} fill={col.color ?? COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        );
      }

      return (
        <BarChart data={chartData} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v === 'stacked100' ? (val) => `${val}%` : undefined}
          />
          <Tooltip />
          <Legend />
          {seriesCols.map((col, i) => (
            <Bar
              key={col.key}
              dataKey={col.key}
              name={col.label}
              fill={col.color ?? COLORS[i % COLORS.length]}
              stackId={isStacked ? 'a' : undefined}
              radius={isStacked ? undefined : [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      );
    }

    // ── Line ─────────────────────────────────────────────────────────────────
    case 'line': {
      const v         = variants.line;
      const curveType = v === 'smooth' ? 'monotone' : v === 'linear' ? 'linear' : 'step';

      return (
        <LineChart data={data} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {seriesCols.map((col, i) => (
            <Line
              key={col.key}
              type={curveType}
              dataKey={col.key}
              name={col.label}
              stroke={col.color ?? COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      );
    }

    // ── Area ─────────────────────────────────────────────────────────────────
    case 'area': {
      const v         = variants.area;
      const isStacked = v === 'stacked' || v === 'stacked100';
      const curveType = v === 'step' ? 'step' : 'monotone';
      const chartData = v === 'stacked100' ? normalizeToPercent(data, seriesCols, categoryKey) : data;

      return (
        <AreaChart data={chartData} margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={v === 'stacked100' ? (val) => `${val}%` : undefined}
          />
          <Tooltip />
          <Legend />
          {seriesCols.map((col, i) => (
            <Area
              key={col.key}
              type={curveType}
              dataKey={col.key}
              name={col.label}
              stroke={col.color ?? COLORS[i % COLORS.length]}
              fill={col.color ?? COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
              stackId={isStacked ? 'a' : undefined}
            />
          ))}
        </AreaChart>
      );
    }

    // ── Pie ──────────────────────────────────────────────────────────────────
    case 'pie': {
      const v           = variants.pie;
      const innerRadius = v === 'donut' ? '35%' : '0%';
      const startAngle  = v === 'half' ? 180 : 0;
      const endAngle    = v === 'half' ? 0 : 360;
      const cy          = v === 'half' ? '65%' : '50%';

      return (
        <PieChart>
          <Pie
            data={(() => {
              const colorCol = columns.find((c) => c.type === 'color');
              return data.map((row, idx) => ({
                ...row,
                fill: colorCol
                  ? ((row[colorCol.key] as string) || COLORS[idx % COLORS.length])
                  : COLORS[idx % COLORS.length],
              }));
            })()}
            dataKey={seriesCols[0]?.key ?? 'value'}
            nameKey={categoryKey}
            cx="50%"
            cy={cy}
            outerRadius="60%"
            innerRadius={innerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            label
            labelLine
          />
          <Tooltip />
          <Legend />
        </PieChart>
      );
    }

    // ── Scatter ──────────────────────────────────────────────────────────────
    case 'scatter': {
      const v = variants.scatter;

      return (
        <ScatterChart margin={margin}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="x" type="number" name="X" tick={{ fontSize: 11 }} />
          <YAxis dataKey="y" type="number" name="Y" tick={{ fontSize: 11 }} />
          {v === 'bubble' && <ZAxis dataKey="size" range={[40, 500]} name="Size" />}
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name={categoryKey} data={data} fill={COLORS[0]} />
        </ScatterChart>
      );
    }

    // ── Radar ────────────────────────────────────────────────────────────────
    case 'radar': {
      const v           = variants.radar;
      const fillOpacity = v === 'outline' ? 0 : 0.2;
      const showDot     = v === 'dot';

      return (
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          {seriesCols.map((col, i) => {
            const c = col.color ?? COLORS[i % COLORS.length];
            return (
              <Radar
                key={col.key}
                name={col.label}
                dataKey={col.key}
                stroke={c}
                fill={c}
                fillOpacity={fillOpacity}
                dot={showDot ? { r: 4, fill: c } : false}
              />
            );
          })}
          <Tooltip />
          <Legend />
        </RadarChart>
      );
    }
  }
}
