import type { AxisColors, AxisLabels, ChartConfig, ChartType, ChartVariants } from '../types/chart';

export const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export const defaultAxisColors: AxisColors = {
  xAxis: '#666666',
  yAxis: '#666666',
  grid: '#f0f0f0',
};

export const defaultAxisLabels: AxisLabels = {
  xAxis: 'X-Axis',
  yAxis: 'Y-Axis',
};

export const chartConfigs: Record<ChartType, ChartConfig> = {
  bar: {
    type: 'bar',
    label: 'Bar Chart',
    description: 'Compare values across categories',
    columns: [
      { key: 'name', label: 'Category', type: 'text' },
      { key: 'value', label: 'Series A', type: 'number', isSeries: true, color: COLORS[0] },
      { key: 'value2', label: 'Series B', type: 'number', isSeries: true, color: COLORS[1] },
    ],
    seriesKeys: ['value', 'value2'],
    categoryKey: 'name',
    defaultData: [
      { name: 'January', value: 400, value2: 240 },
      { name: 'February', value: 300, value2: 139 },
      { name: 'March', value: 600, value2: 380 },
      { name: 'April', value: 800, value2: 430 },
      { name: 'May', value: 500, value2: 210 },
      { name: 'June', value: 900, value2: 680 },
    ],
  },
  line: {
    type: 'line',
    label: 'Line Chart',
    description: 'Show trends over time',
    columns: [
      { key: 'name', label: 'Category', type: 'text' },
      { key: 'value', label: 'Series A', type: 'number', isSeries: true, color: COLORS[0] },
      { key: 'value2', label: 'Series B', type: 'number', isSeries: true, color: COLORS[1] },
    ],
    seriesKeys: ['value', 'value2'],
    categoryKey: 'name',
    defaultData: [
      { name: 'Jan', value: 400, value2: 240 },
      { name: 'Feb', value: 300, value2: 139 },
      { name: 'Mar', value: 600, value2: 380 },
      { name: 'Apr', value: 800, value2: 430 },
      { name: 'May', value: 500, value2: 210 },
      { name: 'Jun', value: 900, value2: 680 },
    ],
  },
  area: {
    type: 'area',
    label: 'Area Chart',
    description: 'Visualize volume over time',
    columns: [
      { key: 'name', label: 'Category', type: 'text' },
      { key: 'value', label: 'Series A', type: 'number', isSeries: true, color: COLORS[0] },
      { key: 'value2', label: 'Series B', type: 'number', isSeries: true, color: COLORS[1] },
    ],
    seriesKeys: ['value', 'value2'],
    categoryKey: 'name',
    defaultData: [
      { name: 'Jan', value: 400, value2: 240 },
      { name: 'Feb', value: 300, value2: 139 },
      { name: 'Mar', value: 600, value2: 380 },
      { name: 'Apr', value: 800, value2: 430 },
      { name: 'May', value: 500, value2: 210 },
      { name: 'Jun', value: 900, value2: 680 },
    ],
  },
  pie: {
    type: 'pie',
    label: 'Pie Chart',
    description: 'Show proportions of a whole',
    columns: [
      { key: 'name', label: 'Slice', type: 'text' },
      { key: 'value', label: 'Value', type: 'number', isSeries: true, color: COLORS[0] },
      { key: 'sliceColor', label: 'Color', type: 'color' },
    ],
    seriesKeys: ['value'],
    categoryKey: 'name',
    defaultData: [
      { name: 'Category A', value: 400, sliceColor: COLORS[0] },
      { name: 'Category B', value: 300, sliceColor: COLORS[1] },
      { name: 'Category C', value: 200, sliceColor: COLORS[2] },
      { name: 'Category D', value: 278, sliceColor: COLORS[3] },
      { name: 'Category E', value: 189, sliceColor: COLORS[4] },
    ],
  },
  scatter: {
    type: 'scatter',
    label: 'Scatter Chart',
    description: 'Show relationships between variables',
    columns: [
      { key: 'x', label: 'X Value', type: 'number' },
      { key: 'y', label: 'Y Value', type: 'number' },
      { key: 'size', label: 'Size', type: 'number' },
      { key: 'name', label: 'Label', type: 'text' },
    ],
    seriesKeys: [],
    categoryKey: 'name',
    defaultData: [
      { x: 100, y: 200, size: 300, name: 'A' },
      { x: 120, y: 100, size: 150, name: 'B' },
      { x: 170, y: 300, size: 500, name: 'C' },
      { x: 140, y: 250, size: 200, name: 'D' },
      { x: 150, y: 400, size: 350, name: 'E' },
      { x: 110, y: 280, size: 250, name: 'F' },
      { x: 130, y: 150, size: 100, name: 'G' },
      { x: 160, y: 350, size: 400, name: 'H' },
    ],
  },
  radar: {
    type: 'radar',
    label: 'Radar Chart',
    description: 'Compare multiple variables at once',
    columns: [
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'value', label: 'Score', type: 'number', isSeries: true, color: COLORS[0] },
    ],
    seriesKeys: ['value'],
    categoryKey: 'subject',
    defaultData: [
      { subject: 'Math', value: 120 },
      { subject: 'English', value: 98 },
      { subject: 'Science', value: 86 },
      { subject: 'History', value: 99 },
      { subject: 'Art', value: 85 },
      { subject: 'PE', value: 65 },
    ],
  },
};

export const variantOptions: Record<ChartType, Array<{ value: string; label: string }>> = {
  bar:     [
    { value: 'grouped',    label: 'Grouped' },
    { value: 'stacked',    label: 'Stacked' },
    { value: 'stacked100', label: '100% Stacked' },
    { value: 'horizontal', label: 'Horizontal' },
  ],
  line:    [
    { value: 'smooth', label: 'Smooth' },
    { value: 'linear', label: 'Linear' },
    { value: 'step',   label: 'Step' },
  ],
  area:    [
    { value: 'overlapping', label: 'Overlapping' },
    { value: 'stacked',     label: 'Stacked' },
    { value: 'stacked100',  label: '100% Stacked' },
    { value: 'step',        label: 'Step' },
  ],
  pie:     [
    { value: 'pie',   label: 'Pie' },
    { value: 'donut', label: 'Donut' },
    { value: 'half',  label: 'Half Circle' },
  ],
  scatter: [
    { value: 'points', label: 'Points' },
    { value: 'bubble', label: 'Bubble' },
  ],
  radar:   [
    { value: 'filled',  label: 'Filled' },
    { value: 'outline', label: 'Outline' },
    { value: 'dot',     label: 'With Dots' },
  ],
};

export const defaultVariants: ChartVariants = {
  bar:     'grouped',
  line:    'smooth',
  area:    'overlapping',
  pie:     'pie',
  scatter: 'points',
  radar:   'filled',
};
