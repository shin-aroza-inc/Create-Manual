import React from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, FileOutput } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { MarkdownRenderer } from './MarkdownRenderer'
import type { Manual } from '@/types/manual.types'

interface ManualViewerProps {
  manual: Manual
  onDownload: () => void
  onViewPdf: () => void
  onNewManual: () => void
}

export const ManualViewer: React.FC<ManualViewerProps> = ({
  manual,
  onDownload,
  onViewPdf,
  onNewManual
}) => {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-soft p-8 mb-8 border border-gray-200/50">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg shadow-inner">
              <FileText className="w-8 h-8 text-primary-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('manual.title')}
              </h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  <span className="font-medium">{t('manual.language')}:</span>
                  <span>{t(`manual.languages.${manual.language}`, manual.language === 'ja' ? 'Japanese' : 'English')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  <span className="font-medium">{t('manual.detailLevel')}:</span>
                  <span>{t(`manual.detailLevels.${manual.detailLevel}`, manual.detailLevel === 'simple' ? 'Simple' : 'Detailed')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  <span className="font-medium">{t('manual.createdAt')}:</span>
                  <span>{manual.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={onDownload}
              className="flex items-center space-x-2 shadow-soft hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>{t('buttons.download')}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={onViewPdf}
              className="flex items-center space-x-2 shadow-soft hover:shadow-md"
            >
              <FileOutput className="w-4 h-4" />
              <span>{t('buttons.viewPdf')}</span>
            </Button>
            <Button
              onClick={onNewManual}
              className="flex items-center space-x-2 shadow-soft hover:shadow-glow"
            >
              <span>{t('buttons.newManual')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* マニュアルコンテンツ */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200/50 overflow-hidden">
        <div className="p-8">
          <MarkdownRenderer content={manual.content} />
        </div>
      </div>
    </div>
  )
}