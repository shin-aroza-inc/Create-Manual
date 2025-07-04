import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle, Upload, FileVideo, Sparkles, Clock } from 'lucide-react'
import type { ProcessingStatus as ProcessingStatusType } from '@/types/manual.types'

interface ProcessingStatusProps {
  status: ProcessingStatusType
  onRetry?: () => void
  className?: string
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  onRetry,
  className = ''
}) => {
  const { t } = useTranslation()
  const [elapsedTime, setElapsedTime] = useState(0)
  const [dots, setDots] = useState('.')

  useEffect(() => {
    // 経過時間カウンター
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // ドットアニメーション
    const dotTimer = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.')
    }, 500)

    return () => clearInterval(dotTimer)
  }, [])

  const getStageMessage = (stage: ProcessingStatusType['stage']) => {
    switch (stage) {
      case 'uploading':
        return t('status.uploading')
      case 'analyzing':
        return t('status.analyzing')
      case 'completed':
        return t('status.completed')
      case 'error':
        return status.message
      default:
        return status.message
    }
  }

  const getStageIcon = () => {
    switch (status.stage) {
      case 'uploading':
        return <Upload className="w-8 h-8 text-primary-600 animate-bounce" />
      case 'analyzing':
        return <FileVideo className="w-8 h-8 text-primary-600 animate-pulse" />
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />
      default:
        return <Upload className="w-8 h-8 text-primary-600 animate-spin" />
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`bg-white rounded-xl shadow-soft p-8 border border-gray-200/50 ${className}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full mb-4 animate-pulse-soft">
          {getStageIcon()}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {status.stage === 'error' ? t('processing.errorOccurred') : t('processing.inProgress')}
        </h3>
        <p className="text-gray-600">
          {status.stage !== 'error' && t('processing.waitMessage')}
        </p>
      </div>

      {status.stage !== 'error' && status.stage !== 'completed' && (
        <>
          {/* 現在の処理状況 */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {getStageMessage(status.stage)}{dots}
              </h3>
            </div>
            
            {/* 経過時間表示 */}
            <div className="flex items-center justify-center space-x-2 text-gray-600 mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{formatTime(elapsedTime)}</span>
            </div>

            {/* 処理説明 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                {status.stage === 'uploading' && 'ファイルをセキュアなストレージにアップロード中...'}
                {status.stage === 'analyzing' && 'AIが動画の内容を詳細に分析し、マニュアルを生成しています...'}
              </p>
            </div>
          </div>

          {/* ステップインジケーター */}
          <div className="grid grid-cols-2 gap-4">
            {(['uploading', 'analyzing'] as const).map((stage, index) => {
              const currentIndex = ['uploading', 'analyzing'].indexOf(status.stage)
              const isPast = index < currentIndex
              const isCurrent = stage === status.stage
              const isFuture = index > currentIndex

              return (
                <div 
                  key={stage} 
                  className={`
                    text-center p-4 rounded-xl transition-all duration-300 border
                    ${isCurrent ? 'bg-primary-100 border-primary-300 shadow-md scale-105' : ''}
                    ${isPast ? 'bg-green-50 border-green-300' : ''}
                    ${isFuture ? 'bg-gray-50 border-gray-200' : ''}
                  `}
                >
                  <div className="mb-2">
                    {isPast ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                    ) : isCurrent ? (
                      <div className="w-6 h-6 mx-auto">
                        {getStageIcon()}
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full mx-auto"></div>
                    )}
                  </div>
                  <div className={`
                    text-xs font-medium
                    ${isCurrent ? 'text-primary-700' : ''}
                    ${isPast ? 'text-green-700' : ''}
                    ${isFuture ? 'text-gray-400' : ''}
                  `}>
                    {t(`status.stages.${stage}`)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI処理のヒント */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-1">AI処理について</h4>
                <p className="text-xs text-blue-700">
                  高品質なマニュアル作成のため、動画の内容を詳細に分析しています。
                  動画の長さや複雑さによって処理時間が変動します。
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {status.stage === 'error' && (
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-6 animate-slide-up">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold text-lg mb-2">
                {t('processing.errorOccurred')}
              </h4>
              <p className="text-red-700 mb-4">{status.message}</p>
              <details className="text-sm text-red-600">
                <summary className="cursor-pointer hover:text-red-800 font-medium">
                  {t('processing.showDetails')}
                </summary>
                <div className="mt-3 p-3 bg-red-100/50 rounded-lg text-xs font-mono">
                  {t('processing.timestamp')}: {new Date().toLocaleString()}<br/>
                  {t('processing.errorDetails')}: {status.message}
                </div>
              </details>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-4 px-4 py-2 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg button-press"
              >
                {t('processing.retry')}
              </button>
            )}
          </div>
        </div>
      )}

      {status.stage === 'completed' && (
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-xl p-6 animate-scale-up">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-700 font-medium text-lg">
              {t('processing.completed')}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}