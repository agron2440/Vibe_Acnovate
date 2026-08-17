import { getAppContext, VibeIQAppType } from '@contrail/extensions-sdk';
import { getExtensionActions } from '@contrail/extensions-sdk/lib/actions/actions';
import type { DocumentElement } from '@contrail/documents';

export interface ShowcaseDocumentElement extends DocumentElement {
    [key: string]: any;
}
export interface ShowcaseDocumentElementChanges {
    id: string;
    changes: ShowcaseDocumentElement;
}

export const ShowcaseCommand = {
  ADD_ELEMENTS: 'showcase:add_elements',
  DELETE_ELEMENTS: 'showcase:delete_elements',
  MODIFY_ELEMENTS: 'showcase:modify_elements',
  GET_ELEMENTS: 'showcase:get_elements',
  RECOLOR_IMAGES: 'showcase:recolor_images',
  ADD_CONTENT_TO_ENTITY_FROM_ELEMENTS: 'showcase:add_content_to_entity_from_elements',
  ADD_FRAMES_FROM_TEMPLATE: 'showcase:add_frames_from_template',
};

export class ShowcaseApp {
  static getCurrentShowcase() {
    ShowcaseApp.validateShowcaseContext();
    return getAppContext().appContext?.showcase;
  }

  static addElements(elements: Array<ShowcaseDocumentElement>) {
    ShowcaseApp.validateShowcaseContext();
    if (elements?.length) {
      getExtensionActions().sendMessageToHost({
        command: ShowcaseCommand.ADD_ELEMENTS,
        data: elements,
      });
    }
  }

  static async addFramesFromTemplate(frames: any[]) {
    ShowcaseApp.validateShowcaseContext();
    if (frames?.length) {
      const results = await getExtensionActions().sendMessageToHost({
        command: ShowcaseCommand.ADD_FRAMES_FROM_TEMPLATE,
        data: frames,
      });
      return ShowcaseApp.validateAndReturnResults(results);
    }
    return [];
  }

  static deleteElements(elements: Array<ShowcaseDocumentElement>) {
    ShowcaseApp.validateShowcaseContext();
    const elementsWithIds = elements.filter((el) => !!el.id);
    if (elementsWithIds?.length) {
      getExtensionActions().sendMessageToHost({
        command: ShowcaseCommand.DELETE_ELEMENTS,
        data: elementsWithIds,
      });
    }
  }

  static async modifyElements(changeObjects: Array<ShowcaseDocumentElementChanges>) {
    ShowcaseApp.validateShowcaseContext();
    console.log("[modifyElements] changeObjects:", changeObjects);
    if (changeObjects?.length) {
      const results = await getExtensionActions().sendMessageToHost({
        command: ShowcaseCommand.MODIFY_ELEMENTS,
        data: changeObjects,
      });
      console.log("[modifyElements] results:", results);
      return ShowcaseApp.validateAndReturnResults(results);
    }
  }

  static async getElements(criteria: any) {
    ShowcaseApp.validateShowcaseContext();
    const results = await getExtensionActions().sendMessageToHost({
      command: ShowcaseCommand.GET_ELEMENTS,
      data: criteria,
    });
    return ShowcaseApp.validateAndReturnResults(results);
  }

  static async createNewContentAndAssignToEntity(
    assignmentOptions: any,
    entity: any,
    elements: any[],
  ) {
    ShowcaseApp.validateShowcaseContext();
    const results = await getExtensionActions().sendMessageToHost({
      command: ShowcaseCommand.ADD_CONTENT_TO_ENTITY_FROM_ELEMENTS,
      data: { assignmentOptions, entity, elements },
    });
    return ShowcaseApp.validateAndReturnResults(results);
  }

  static async recolorImages(
    imageElements: any[],
    hexCode: string,
    hexMap: Record<string, string> = {},
  ) {
    ShowcaseApp.validateShowcaseContext();
    const results = await getExtensionActions().sendMessageToHost({
      command: ShowcaseCommand.RECOLOR_IMAGES,
      data: { imageElements, hexCode, hexMap },
    });
    return ShowcaseApp.validateAndReturnResults(results);
  }

  private static validateShowcaseContext() {
    const context = getAppContext();
    if (
      context.appContext?.vibeIQApp !== VibeIQAppType.SHOWCASE ||
      !context.appContext?.showcase
    ) {
      throw new Error('App extension has not been initialized with Showcase context.');
    }
  }

  private static validateAndReturnResults(results: any) {
    if (!results.success) {
      throw new Error(results.error ?? 'App operation failed.');
    }
    return results.data;
  }
}
