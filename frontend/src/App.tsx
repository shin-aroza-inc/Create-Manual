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
import { usePdfGenerator } from '@/hooks/usePdfGenerator'

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

  // PDF生成関連
  const { generatePdf } = usePdfGenerator()

  // オプション設定
  const [options, setOptions] = useState<ManualGenerationOptions>({
    language: 'ja',
    detailLevel: 'simple'
  })

  // アプリケーションの状態
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload')
  const [termsAgreed, setTermsAgreed] = useState(false)

  const handleGenerateManual = async () => {
    if (!videoFile || !termsAgreed) return

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
    setTermsAgreed(false)
  }

  const handleViewPdf = async () => {
    if (!generatedManual) return

    try {
      await generatePdf(generatedManual)
    } catch (error) {
      console.error('PDF表示エラー:', error)
    }
  }

  const clearUploadError = () => {
    resetUpload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      {/* ヘッダー */}
      <header className="glass border-b border-gray-200/50 sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-400 blur-xl opacity-30 animate-pulse-soft"></div>
                <img src="/logo.svg" alt="Manual Generator" className="h-14 w-auto relative z-10 drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            {/* タイトルセクション */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('upload.mainTitle')}</h2>
              <p className="text-gray-600">{t('upload.mainDescription')}</p>
            </div>

            {/* 動画アップロード */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <VideoUploader
                onFileSelect={handleFileSelect}
                selectedVideo={videoFile}
                error={uploadError}
                onClearError={clearUploadError}
                onRemoveFile={removeFile}
                disabled={isUploading}
              />
            </div>

            {/* オプション選択 */}
            {videoFile && (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <OptionsSelector
                  options={options}
                  onChange={setOptions}
                  disabled={isUploading}
                />
              </div>
            )}

            {/* 利用規約同意 */}
            {videoFile && (
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200/50">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">利用規約</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                      <p className="whitespace-pre-line">{t('terms.content')}</p>
                    </div>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        disabled={isUploading}
                      />
                      <span className="text-sm text-gray-700">{t('terms.agreement')}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 生成ボタン */}
            {videoFile && (
              <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <Button
                  onClick={handleGenerateManual}
                  loading={isUploading}
                  disabled={isUploading || !termsAgreed}
                  size="lg"
                  className="w-full sm:w-auto shadow-soft hover:shadow-glow transition-shadow duration-300"
                >
                  {t('buttons.generateManual')}
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <ProcessingStatus 
              status={status} 
              onRetry={handleGenerateManual}
            />
            
            {status.stage === 'error' && (
              <div className="mt-8 flex justify-center space-x-4 animate-slide-up">
                <Button
                  onClick={handleGenerateManual}
                  variant="primary"
                  className="shadow-soft hover:shadow-glow transition-shadow duration-300"
                >
                  再試行
                </Button>
                <Button
                  onClick={handleNewManual}
                  variant="secondary"
                  className="shadow-soft hover:shadow-md transition-shadow duration-300"
                >
                  最初からやり直す
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'result' && generatedManual && (
          <div className="animate-fade-in">
            <ManualViewer
              manual={generatedManual}
              onDownload={downloadManual}
              onViewPdf={handleViewPdf}
              onNewManual={handleNewManual}
            />
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="glass border-t border-gray-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">
              © {new Date().getFullYear()} Manual Generator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App