import React from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Manual } from '@/types/manual.types'

interface ManualViewerProps {
  manual: Manual
  onDownload: () => void
  onNewManual: () => void
}

export const ManualViewer: React.FC<ManualViewerProps> = ({
  manual,
  onDownload,
  onNewManual
}) => {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {manual.title}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <span>言語: {manual.language === 'ja' ? '日本語' : 'English'}</span>
                <span>
                  詳細度: {manual.detailLevel === 'simple' ? '簡潔' : '詳細'}
                </span>
                <span>
                  作成日時: {manual.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onDownload}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{t('buttons.download')}</span>
            </Button>
            <Button
              onClick={onNewManual}
              className="flex items-center space-x-2"
            >
              <span>{t('buttons.newManual')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* マニュアルコンテンツ */}
      <div className="bg-white border rounded-lg p-6">
        <MarkdownRenderer content={manual.content} />
      </div>
    </div>
  )
}