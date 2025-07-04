import { FILE_LIMITS } from '@/constants/FILE_LIMITS'
import { MESSAGES } from '@/constants/MESSAGES'
import type { VideoValidationResult } from '@/types/video.types'

export const validateVideo = (file: File): VideoValidationResult => {
  const errors: string[] = []

  // ファイルサイズチェック
  if (file.size > FILE_LIMITS.MAX_SIZE) {
    errors.push(MESSAGES.ERRORS.FILE_TOO_LARGE)
  }

  // ファイル形式チェック
  if (!FILE_LIMITS.SUPPORTED_MIME_TYPES.includes(file.type as any)) {
    errors.push(MESSAGES.ERRORS.INVALID_FORMAT)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}