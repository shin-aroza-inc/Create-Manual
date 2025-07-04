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
            relative rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            bg-white shadow-soft hover:shadow-lg
            ${isDragOver 
              ? 'border-2 border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100/50 scale-[1.02]' 
              : 'border-2 border-dashed border-gray-300 hover:border-primary-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
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
          
          <div className={`inline-flex p-4 rounded-full mb-6 transition-all duration-300 ${
            isDragOver ? 'bg-primary-100 shadow-inner-glow' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 transition-all duration-300 ${
              isDragOver ? 'text-primary-600 animate-bounce-gentle' : 'text-gray-500'
            }`} />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {t('upload.title')}
          </h3>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t('upload.dragDrop')}
            <br />
            <span className="text-primary-600 font-medium">{t('upload.orClick')}</span>
          </p>
          
          <div className="inline-flex flex-col items-start bg-gray-50 rounded-lg px-6 py-4 text-sm text-gray-600 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
              <p>{t('upload.supportedFormats')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
              <p>{t('upload.maxSize')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full"></div>
              <p>{t('upload.maxDuration')}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200/50 animate-scale-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg shadow-inner">
                <Film className="w-8 h-8 text-primary-700" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {selectedVideo.file.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{formatFileSize(selectedVideo.size)}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-primary-600 font-medium">準備完了</span>
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}