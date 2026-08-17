import ChartTypeSelector from "../components/ChartTypeSelector";
import ChartDataEditor from "../components/ChartDataEditor";
import ChartPreview from "../components/ChartPreview";
import type {
  ChartType,
  ChartVariants,
  ColumnDef,
  DataRow,
  SavedChartConfig,
} from "../types/chart";
import {
  chartConfigs,
  defaultVariants,
  variantOptions,
} from "../data/chartConfigs";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppExtension, getAppContext } from "@contrail/extensions-sdk";
import { ShowcaseChartContentService } from "../utils/showcaseChartUtil";

type Step = "select" | "edit";

export default function GeneratePage() {
  const location = useLocation();
  const existingChartConfig = location.state?.chartConfig as
    | SavedChartConfig
    | undefined;

  const [step, setStep] = useState<Step>(
    existingChartConfig ? "edit" : "select",
  );
  const [selectedType, setSelectedType] = useState<ChartType | null>(
    existingChartConfig?.type ?? null,
  );
  const [chartData, setChartData] = useState<DataRow[]>(
    existingChartConfig?.data ?? [],
  );
  const [chartColumns, setChartColumns] = useState<ColumnDef[]>(
    existingChartConfig?.columns ?? [],
  );
  const [variants, setVariants] = useState<ChartVariants>(
    existingChartConfig
      ? { ...defaultVariants, ...existingChartConfig.variants }
      : defaultVariants,
  );
  const [isExporting, setIsExporting] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const ctx = getAppContext();
  const showcaseId = ctx?.appContext?.showcase?.id;
  const contentHolderReference = `showcase:${showcaseId}`;

  const handleAddOrUpdate = async () => {
    if (!chartContainerRef.current || !showcaseId || !selectedType) return;
    setIsExporting(true);
    try {
      await ShowcaseChartContentService.addOrUpdateChartInShowcase({
        contentHolderReference,
        chartContainer: chartContainerRef.current,
        chartConfig: {
          type: selectedType,
          columns: chartColumns,
          variants,
          data: chartData,
          elementId: existingChartConfig?.elementId,
        },
      });
    } finally {
      setIsExporting(false);
      AppExtension.close();
    }
  };

  const handleSelectType = (type: ChartType) => {
    setSelectedType(type);
    setChartData(chartConfigs[type].defaultData);
    setChartColumns([...chartConfigs[type].columns]);
    setVariants(defaultVariants);
    setStep("edit");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedType(null);
  };

  const handleVariantChange = (value: string) => {
    if (!selectedType) return;
    setVariants(
      (prev) => ({ ...prev, [selectedType]: value }) as ChartVariants,
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white">
      {step === "select" && <ChartTypeSelector onSelect={handleSelectType} />}

      {step === "edit" && selectedType && (
        <>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
            {!existingChartConfig && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            )}
            {!existingChartConfig && (<div className="w-px h-5 bg-gray-200" />)}
            <h1 className="text-sm font-semibold text-gray-900">
              {chartConfigs[selectedType].label}
            </h1>

            <button
              onClick={handleAddOrUpdate}
              disabled={isExporting || !showcaseId}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isExporting ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364-2.121 2.121M8.757 15.243l-2.121 2.121m0-12.728 2.121 2.121m6.486 6.486 2.121 2.121"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              )}
              {existingChartConfig ? "Update" : "Add"}
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-5/12 border-r border-gray-200 overflow-hidden flex flex-col">
              <div className="px-4 pt-4 pb-2 shrink-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Chart Data
                </p>
              </div>

              <div className="px-4 pb-3 shrink-0 border-b border-gray-100">
                <div className="flex gap-1 flex-wrap">
                  {variantOptions[selectedType].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleVariantChange(opt.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                        variants[selectedType] === opt.value
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <ChartDataEditor
                chartType={selectedType}
                data={chartData}
                columns={chartColumns}
                onChange={setChartData}
                onColumnsChange={setChartColumns}
              />
            </div>

            <div className="w-7/12 overflow-hidden">
              <ChartPreview
                chartType={selectedType}
                data={chartData}
                columns={chartColumns}
                variants={variants}
                containerRef={chartContainerRef}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
