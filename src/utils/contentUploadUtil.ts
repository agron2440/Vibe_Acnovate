import { EntitiesClient } from '@contrail/extensions-sdk';

/**
 * Helper for working with VibeIQ content (file attachments) on a content
 * holder reference (e.g. `plan:<id>`, `item:<id>`, `assortment:<id>`).
 *
 * - `findValidContent` queries content for the holder, HEAD-verifies that the
 *   underlying S3 object exists, deletes any orphan rows (created but never
 *   uploaded), and returns the first valid match.
 *
 * - `uploadFile` creates a content entity, performs the multipart S3 upload,
 *   re-fetches the content with `primaryFile` populated, and rolls back the
 *   content entity if the upload fails.
 *
 * Both methods use only `EntitiesClient` from `@contrail/extensions-sdk`, so
 * they are iframe-safe.
 */
export class ContentUploadService {
  /**
   * Look up content for a content holder, validate that each candidate's
   * underlying S3 object exists, and return the first one that does. Any
   * candidates whose S3 object is missing are deleted as orphans.
   *
   * @param predicate optional filter applied before validation (e.g. by
   *   `contentType` or filename). If omitted, all content is considered.
   */
  async findValidContent(
    contentHolderReference: string,
    predicate?: (content: any) => boolean,
  ): Promise<any | null> {
    const list = await new EntitiesClient().get({
      entityName: 'content',
      criteria: { contentHolderReference, isLatestVersion: true },
      relations: ['primaryFile'],
    });
    if (!Array.isArray(list)) return null;

    const candidates = predicate ? list.filter(predicate) : list;

    for (const candidate of candidates) {
      const exists = await this.fileExistsInS3(candidate?.primaryFile?.downloadUrl);
      if (exists) return candidate;
      await this.deleteOrphan(candidate?.id);
    }
    return null;
  }

  /**
   * List all content rows attached to `contentHolderReference`, optionally
   * filtered by `predicate` (e.g. by filename prefix). Returns the entity rows
   * with `primaryFile` populated. Unlike `findValidContent`, this does not
   * HEAD-verify each S3 object — callers that need that should verify per row.
   */
  async listContent(
    contentHolderReference: string,
    predicate?: (content: any) => boolean,
  ): Promise<any[]> {
    const list = await new EntitiesClient().get({
      entityName: 'content',
      criteria: { contentHolderReference, isLatestVersion: true },
      relations: ['primaryFile'],
    });
    if (!Array.isArray(list)) return [];
    return predicate ? list.filter(predicate) : list;
  }

  /**
   * Create a content entity attached to `contentHolderReference`, upload the
   * file's bytes to S3, and return the resulting content with `primaryFile`
   * populated (so `primaryFile.downloadUrl` is ready to use). On any failure
   * during the S3 upload, the just-created content row is deleted before the
   * error is re-thrown.
   */
  async uploadFile(contentHolderReference: string, file: File): Promise<any> {
    const created: any = await new EntitiesClient().create({
      entityName: 'content',
      object: {
        contentHolderReference,
        fileName: file.name,
        contentType: file.type,
      },
    });

    const uploadPost = created?.primaryFile?.uploadPost;
    if (!uploadPost?.url || !uploadPost?.fields) {
      throw new Error('Server did not return an upload URL.');
    }

    try {
      await this.postToS3(uploadPost, file);
    } catch (err) {
      await this.deleteOrphan(created?.id);
      throw err;
    }

    return await new EntitiesClient().get({
      entityName: 'content',
      id: created.id,
      relations: ['primaryFile'],
    });
  }

  /**
   * S3 presigned POST requires a specific multipart field order:
   *   1. Content-Type (explicit), 2. policy fields, 3. file (last).
   * Mirrors `@contrail/sdk` `Files.uploadFile`.
   */
  private async postToS3(
    uploadPost: { url: string; fields: Record<string, string> },
    file: File,
  ): Promise<void> {
    const fd = new FormData();
    fd.append('Content-Type', file.type);
    for (const [k, v] of Object.entries(uploadPost.fields)) fd.append(k, v);
    fd.append('file', file, file.name);

    const resp = await fetch(uploadPost.url, { method: 'POST', body: fd });
    if (!resp.ok) {
      throw new Error(`Upload failed: HTTP ${resp.status}`);
    }
  }

  /**
   * HEAD the signed download URL to confirm the underlying S3 object exists.
   * Defaults to "exists" if the request can't be made (CORS, network) —
   * better to keep a maybe-valid record than to delete one we can't see.
   */
  private async fileExistsInS3(downloadUrl: string | null | undefined): Promise<boolean> {
    if (!downloadUrl) return false;
    try {
      const resp = await fetch(downloadUrl);
      return resp.ok;
    } catch (err) {
      console.warn('[ContentUpload] Could not verify file existence, assuming present:', err);
      return true;
    }
  }

  private async deleteOrphan(contentId: string | undefined): Promise<void> {
    if (!contentId) return;
    console.warn('[ContentUpload] Deleting orphan content:', contentId);
    try {
      await new EntitiesClient().delete({ entityName: 'content', id: contentId });
    } catch (err) {
      console.warn('[ContentUpload] Failed to delete orphan content:', err);
    }
  }
}
