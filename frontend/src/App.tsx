import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { VideoUploader } from '@/components/upload/VideoUploader'
import { OptionsSelector } from '@/components/upload/OptionsSelector'
import { ProcessingStatus } from '@/components/manual/ProcessingStatus'
import { ManualViewer } from '@/components/manual/ManualViewer'
import { LanguageSelector } from '@/components/common/LanguageSelector'
import { Button } from '@/components/common/Button'

import { useVideoUpload } from '@/hooks/useVideoUpload'
import { useManualGeneration } from '@/hooks/useManualGeneration'

import type { ManualGenerationOptions } from '@/types/manual.types'

function App() {
  const { t } = useTranslation()
  
  // 動画アップロード関連
  const {
    videoFile,
    isUploading,
    error: uploadError,
    handleFileSelect,
    uploadFile,
    reset: resetUpload,
    removeFile
  } = useVideoUpload()

  // マニュアル生成関連
  const {
    status,
    generatedManual,
    generateManual,
    downloadManual,
    reset: resetProcessing
  } = useManualGeneration()

  // オプション設定
  const [options, setOptions] = useState<ManualGenerationOptions>({
    language: 'ja',
    detailLevel: 'simple'
  })

  // アプリケーションの状態
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload')

  const handleGenerateManual = async () => {
    if (!videoFile) return

    setCurrentStep('processing')
    
    try {
      // 動画をアップロード
      const videoUrl = await uploadFile()
      if (!videoUrl) return

      // マニュアル生成
      const success = await generateManual(videoUrl, options)
      
      if (success) {
        setCurrentStep('result')
      } else {
        setCurrentStep('upload')
      }
    } catch (error) {
      console.error('Manual generation failed:', error)
      setCurrentStep('upload')
    }
  }

  const handleNewManual = () => {
    resetUpload()
    resetProcessing()
    setCurrentStep('upload')
  }

  const clearUploadError = () => {
    resetUpload()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="Manual Generator" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-500">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* 動画アップロード */}
            <VideoUploader
              onFileSelect={handleFileSelect}
              selectedVideo={videoFile}
              error={uploadError}
              onClearError={clearUploadError}
              onRemoveFile={removeFile}
              disabled={isUploading}
            />

            {/* オプション選択 */}
            {videoFile && (
              <OptionsSelector
                options={options}
                onChange={setOptions}
                disabled={isUploading}
              />
            )}

            {/* 生成ボタン */}
            {videoFile && (
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateManual}
                  loading={isUploading}
                  disabled={isUploading}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {t('buttons.generateManual')}
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="max-w-2xl mx-auto">
            <ProcessingStatus 
              status={status} 
              onRetry={handleGenerateManual}
            />
            
            {status.stage === 'error' && (
              <div className="mt-6 flex justify-center space-x-4">
                <Button
                  onClick={handleGenerateManual}
                  variant="primary"
                >
                  再試行
                </Button>
                <Button
                  onClick={handleNewManual}
                  variant="secondary"
                >
                  最初からやり直す
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'result' && generatedManual && (
          <ManualViewer
            manual={generatedManual}
            onDownload={downloadManual}
            onNewManual={handleNewManual}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Manual Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App