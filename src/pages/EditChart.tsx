import { getAppContext } from "@contrail/extensions-sdk";
import { ContentUploadService } from "../utils/contentUploadUtil";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppExtensionReady } from "../hooks/useAppExtensionReady";
import type { SavedChartConfig } from "../types/chart";

const getChartConfig = async (elementId: string): Promise<SavedChartConfig | null> => {
  const jsonFile = await new ContentUploadService().findValidContent(`showcase:${getAppContext().appContext?.showcase?.id}`, (s) => s.fileName === `${elementId}.json`);
  console.log("[Edit Chart] jsonFile", jsonFile);
  if (jsonFile) {
    const response = await fetch(jsonFile.primaryFile.downloadUrl);
    console.log("[Edit Chart] response", response);
    return response.json();
  }
  return null;
};

export function EditChart() {
  const navigate = useNavigate();
  const isAppContextReady = useAppExtensionReady();
  const ctx = getAppContext();
  const selectedElements = ctx?.appContext?.selectedElements ?? [];
  const isAnyElementSelected = selectedElements.length > 0;


  const imageElement = selectedElements.find((element) => element.type === "image");
  const isImageElementSelected = Boolean(imageElement);

  const [chartConfig, setChartConfig] = useState<SavedChartConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  useEffect(() => {
    if (!isAppContextReady || !imageElement) {
      setChartConfig(null);
      return;
    }

    console.log("[Edit Chart] Fetching chart config for element ID:", imageElement.id, " for image element:", imageElement);
    setIsLoadingConfig(true);
    getChartConfig(imageElement.id)
      .then(setChartConfig)
      .finally(() => setIsLoadingConfig(false));
  }, [isAppContextReady, imageElement?.id]);

  useEffect(() => {
    if (chartConfig) {
      navigate("/generate", { state: { chartConfig } });
    }
  }, [chartConfig, navigate]);

  let message: string | null = null;
  if (isAppContextReady) {
    if (!isAnyElementSelected) {
      message = "No element selected. Please select an element.";
    } else if (!isImageElementSelected) {
      message = "Selected element is not of type image.";
    } else if (!isLoadingConfig && !chartConfig) {
      message = "Selected element is not a generated chart/no chart information found";
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-gray-900">Edit Chart</h1>
      {!isAppContextReady ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
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
          Loading...
        </div>
      ) : message ? (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      ) : isLoadingConfig ? (
        <p className="mt-3 text-sm text-gray-500">Loading chart information...</p>
      ) : (
        <p className="mt-3 text-sm text-gray-600">This is the edit chart page.</p>
      )}
    </div>
  );
}