export type UploadResult =
  | { ok: true; key: string; url: string }
  | { ok: false; error: "invalid_type" | "file_too_large" };

export interface StorageRepository {
  uploadImage(file: File, prefix: string): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  publicUrl(key: string | null | undefined): string | undefined;
}
