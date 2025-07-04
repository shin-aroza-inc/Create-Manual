import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
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
          {status.stage === 'error' ? t('processing.errorOccurred') : t('processing.inProgress')}
        </h3>
      </div>

      {status.stage !== 'error' && status.stage !== 'completed' && (
        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-md">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-700 text-sm">{getStageMessage(status.stage)}</span>
        </div>
      )}

      {status.stage === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-red-800 font-medium text-sm mb-1">
                {t('processing.errorOccurred')}
              </h4>
              <p className="text-red-700 text-sm mb-3">{status.message}</p>
              <details className="text-xs text-red-600">
                <summary className="cursor-pointer hover:text-red-800">
                  {t('processing.showDetails')}
                </summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                  {t('processing.timestamp')}: {new Date().toLocaleString()}<br/>
                  {t('processing.errorDetails')}: {status.message}
                </div>
              </details>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="ml-3 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                {t('processing.retry')}
              </button>
            )}
          </div>
        </div>
      )}

      {status.stage === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <p className="text-green-700 text-sm">
            {t('processing.completed')}
          </p>
        </div>
      )}
    </div>
  )
}