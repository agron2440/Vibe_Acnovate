export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'radar';

export type BarVariant     = 'grouped' | 'stacked' | 'stacked100' | 'horizontal';
export type LineVariant    = 'smooth' | 'linear' | 'step';
export type AreaVariant    = 'overlapping' | 'stacked' | 'stacked100' | 'step';
export type PieVariant     = 'pie' | 'donut' | 'half';
export type ScatterVariant = 'points' | 'bubble';
export type RadarVariant   = 'filled' | 'outline' | 'dot';

export interface ChartVariants {
  bar:     BarVariant;
  line:    LineVariant;
  area:    AreaVariant;
  pie:     PieVariant;
  scatter: ScatterVariant;
  radar:   RadarVariant;
}

export interface AxisColors {
  xAxis: string;
  yAxis: string;
  grid: string;
}

export interface AxisLabels {
  xAxis: string;
  yAxis: string;
}

export interface DataRow {
  [key: string]: string | number;
}

export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color';
  isSeries?: boolean;
  color?: string;
}

export interface ChartConfig {
  type: ChartType;
  label: string;
  description: string;
  columns: ColumnDef[];
  seriesKeys: string[];
  categoryKey: string;
  defaultData: DataRow[];
}

export interface SavedChartConfig {
  type: ChartType;
  columns: ColumnDef[];
  variants: ChartVariants;
  data: DataRow[];
  elementId?: string;
  axisColors?: AxisColors;
  axisLabels?: AxisLabels;
}
