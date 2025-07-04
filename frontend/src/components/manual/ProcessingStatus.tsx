import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { ProgressBar } from '@/components/common/ProgressBar'
import { Loading } from '@/components/common/Loading'
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

  const getStageMessage = (stage: ProcessingStatusType['stage']) => {
    switch (stage) {
      case 'uploading':
        return t('status.uploading')
      case 'analyzing':
        return t('status.analyzing')
      case 'extracting':
        return t('status.extracting')
      case 'generating':
        return t('status.generating')
      case 'completed':
        return t('status.completed')
      case 'error':
        return status.message
      default:
        return status.message
    }
  }

  const getIcon = () => {
    switch (status.stage) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Loading size="sm" />
    }
  }

  return (
    <div className={`bg-white border rounded-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        {getIcon()}
        <h3 className="text-lg font-medium text-gray-900">
          {status.stage === 'error' ? 'エラーが発生しました' : '処理中'}
        </h3>
      </div>

      {status.stage !== 'error' && (
        <ProgressBar
          progress={status.progress}
          message={getStageMessage(status.stage)}
          className="mb-4"
        />
      )}

      {status.stage === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-red-800 font-medium text-sm mb-1">
                エラーが発生しました
              </h4>
              <p className="text-red-700 text-sm mb-3">{status.message}</p>
              <details className="text-xs text-red-600">
                <summary className="cursor-pointer hover:text-red-800">
                  技術的な詳細を表示
                </summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                  タイムスタンプ: {new Date().toLocaleString()}<br/>
                  エラー内容: {status.message}
                </div>
              </details>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                再試行
              </button>
            )}
          </div>
        </div>
      )}

      {status.stage === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-700 text-sm">
            マニュアルの生成が完了しました。
          </p>
        </div>
      )}
    </div>
  )
}