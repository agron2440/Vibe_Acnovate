import html2canvas from 'html2canvas';

/**
 * Captures `container` (including HTML legend) as a high-DPI PNG data-URL
 * with a fully transparent background.
 */
export async function captureChartAsPng(container: HTMLElement): Promise<string | null> {
  const canvas = await html2canvas(container, {
    backgroundColor: null,          // transparent — no white fill
    scale: window.devicePixelRatio || 1,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL('image/png');
}
