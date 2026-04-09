export interface DocumentItem {
  id: string;
  title: string;
  modifiedAt: string;
}

export interface UploadResult {
  success: boolean;
  documentId?: string;
  message?: string;
}
