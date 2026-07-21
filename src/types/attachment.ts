
export type AcceptedFileExt = 'pdf' | 'docx' | 'png' | 'jpg'
export type UploadStatus = 'uploading' | 'success' | 'error'
export interface UploadItem {
  id: string
  file: File
  status: UploadStatus
  progress: number
  error?: string
}
