import { useState, useCallback } from 'react'
import { uploadVideo } from '@/lib/api'
import { validateVideo } from '@/lib/validators'
import type { VideoFile, UploadProgress } from '@/types/video.types'

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ loaded: 0, total: 0, percentage: 0 })
  const [error, setError] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)

  const handleFileSelect = useCallback((file: File) => {
    setError(null)
    
    const validation = validateVideo(file)
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    const videoFile: VideoFile = {
      file,
      url: URL.createObjectURL(file),
      size: file.size,
      format: file.type
    }

    setVideoFile(videoFile)
  }, [])

  const uploadFile = useCallback(async (): Promise<string | null> => {
    if (!videoFile) return null

    setIsUploading(true)
    setError(null)

    try {
      const uploadedUrl = await uploadVideo(videoFile.file)
      return uploadedUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アップロードに失敗しました'
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [videoFile])

  const reset = useCallback(() => {
    setVideoFile(null)
    setError(null)
    setIsUploading(false)
    setUploadProgress({ loaded: 0, total: 0, percentage: 0 })
  }, [])

  const removeFile = useCallback(() => {
    if (videoFile?.url) {
      URL.revokeObjectURL(videoFile.url)
    }
    setVideoFile(null)
    setError(null)
  }, [videoFile])

  return {
    videoFile,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    reset,
    removeFile
  }
}