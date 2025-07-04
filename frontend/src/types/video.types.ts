export interface VideoFile {
  file: File
  url: string
  size: number
  duration?: number
  format: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface VideoValidationResult {
  isValid: boolean
  errors: string[]
}