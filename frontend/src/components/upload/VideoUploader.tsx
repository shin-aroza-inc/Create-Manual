import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Film, X } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { formatFileSize } from '@/lib/validators'
import type { VideoFile } from '@/types/video.types'

interface VideoUploaderProps {
  onFileSelect: (file: File) => void
  selectedVideo: VideoFile | null
  error: string | null
  onClearError: () => void
  onRemoveFile?: () => void
  disabled?: boolean
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onFileSelect,
  selectedVideo,
  error,
  onClearError,
  onRemoveFile,
  disabled = false
}) => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    // 親コンポーネントの削除処理を呼び出す
    if (onRemoveFile) {
      onRemoveFile()
    }
  }

  return (
    <div className="w-full">
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={onClearError}
          className="mb-4"
        />
      )}

      {!selectedVideo ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('upload.title')}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {t('upload.dragDrop')}
            <br />
            {t('upload.orClick')}
          </p>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>{t('upload.supportedFormats')}</p>
            <p>{t('upload.maxSize')}</p>
            <p>{t('upload.maxDuration')}</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Film className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedVideo.file.name}
                </p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedVideo.size)}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}