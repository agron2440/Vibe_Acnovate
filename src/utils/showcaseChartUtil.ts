import { captureChartAsPng } from "./exportChart";
import { ContentUploadService } from "./contentUploadUtil";
import { DocumentElementFactory } from "@contrail/documents";
import type { SavedChartConfig } from "../types/chart";
import { chartConfigs } from "../data/chartConfigs";
import { EntitiesClient, getAppContext, ShowcaseApp } from "@contrail/extensions-sdk";

export interface AddChartToShowcaseParams {
  contentHolderReference: string;
  chartContainer: HTMLElement;
  chartConfig: SavedChartConfig;
}

export class ShowcaseChartContentService {
  static async addOrUpdateChartInShowcase({
    contentHolderReference,
    chartContainer,
    chartConfig,
  }: AddChartToShowcaseParams) {
    if (chartConfig.elementId) {
      return this.updateChartInShowcase({
        contentHolderReference,
        chartContainer,
        chartConfig,
      });
    } else {
      return this.addChartToShowcase({
        contentHolderReference,
        chartContainer,
        chartConfig,
      });
    }
  }

  /**
   * Renders the chart container to a PNG, uploads it as showcase content, adds
   * the resulting image as a new showcase element, and uploads the chart's
   * config as a sidecar JSON file named after the new element's id (the same
   * naming convention `EditChart` looks up when re-opening a chart for editing).
   */
  static async addChartToShowcase({
    contentHolderReference,
    chartContainer,
    chartConfig,
  }: AddChartToShowcaseParams) {
    const dataUrl = await captureChartAsPng(chartContainer);
    if (!dataUrl) return null;

    const baseName = `${chartConfigs[chartConfig.type].label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const pngBlob = await fetch(dataUrl).then((r) => r.blob());
    const pngFile = new File([pngBlob], `${baseName}.png`, {
      type: "image/png",
    });

    const svc = new ContentUploadService();
    const uploadedFile = await svc.uploadFile(contentHolderReference, pngFile);

    const fileReference = uploadedFile?.primaryFile?.ownedByReference;
    if (!fileReference) return null;

    const newElement = DocumentElementFactory.createElement("image", {
      type: "image",
      position: { x: 100, y: 100 },
      size: { width: 400, height: 300 },
      url: uploadedFile?.primaryFile?.fileUrl,
    });

    // console.log("Adding new element to showcase:", newElement);

    ShowcaseApp.addElements([newElement]);

    if (newElement?.id) {
      const updatedChartConfig: SavedChartConfig = {
        ...chartConfig,
        elementId: newElement.id,
      };
      const jsonBlob = new Blob([JSON.stringify(updatedChartConfig, null, 2)], {
        type: "application/json",
      });
      const jsonFile = new File([jsonBlob], `${newElement.id}.json`, {
        type: "application/json",
      });

      await svc.uploadFile(contentHolderReference, jsonFile);
    }

    const contentList = await svc.listContent(contentHolderReference, (s) => s.fileName === `${newElement.id}.json`);
    console.log(
      "[addChartToShowcase] Current content in showcase with filename as ${newElement.id}.json:",
      contentList,
    );

    return newElement;
  }

  static async updateChartInShowcase({
    contentHolderReference,
    chartContainer,
    chartConfig,
  }: AddChartToShowcaseParams) {
    if (!chartConfig.elementId) return null;

    const elementId = chartConfig.elementId;

    const dataUrl = await captureChartAsPng(chartContainer);
    if (!dataUrl) return null;

    const baseName = `${chartConfigs[chartConfig.type].label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const pngBlob = await fetch(dataUrl).then((r) => r.blob());
    const pngFile = new File([pngBlob], `${baseName}.png`, {
      type: "image/png",
    });

    const svc = new ContentUploadService();
    const uploadedFile = await svc.uploadFile(contentHolderReference, pngFile);

    const fileReference = uploadedFile?.primaryFile?.ownedByReference;
    if (!fileReference) return null;

    console.log(
      `[updateChartInShowcase] Updated chart for element ID ${elementId} in showcase with new image URL:`,
      uploadedFile?.primaryFile?.fileUrl,
    );

    const selectedElements = getAppContext().appContext?.selectedElements;

    const imageElement = selectedElements?.find(
      (el: any) => el.id === elementId,
    );

    ShowcaseApp.modifyElements([
      {
        id: elementId,
        changes: {
          ...imageElement,
          url: uploadedFile?.primaryFile?.fileUrl,
        },
      },
    ]);

    // Update the chart config JSON file
    const jsonBlob = new Blob([JSON.stringify(chartConfig, null, 2)], {
      type: "application/json",
    });
    const jsonFile = new File([jsonBlob], `${elementId}.json`, {
      type: "application/json",
    });
    const existingContentList = await svc.listContent(contentHolderReference, (s) => s.fileName === `${elementId}.json`);

    // Deleting the previous chart config JSON file before uploading the new one to avoid duplicates
    if (existingContentList.length > 0) {
      existingContentList.forEach(async (content) => {
        await new EntitiesClient().delete({
          entityName: 'content',
          id: content.id,
        });
      });
    }

    await svc.uploadFile(contentHolderReference, jsonFile);

    
  }
}
