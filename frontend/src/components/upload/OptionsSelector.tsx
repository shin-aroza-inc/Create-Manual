import React from 'react'
import { useTranslation } from 'react-i18next'
import type { ManualGenerationOptions } from '@/types/manual.types'

interface OptionsSelectorProps {
  options: ManualGenerationOptions
  onChange: (options: ManualGenerationOptions) => void
  disabled?: boolean
}

export const OptionsSelector: React.FC<OptionsSelectorProps> = ({
  options,
  onChange,
  disabled = false
}) => {
  const { t } = useTranslation()

  const handleLanguageChange = (language: 'ja' | 'en') => {
    onChange({ ...options, language })
  }

  const handleDetailLevelChange = (detailLevel: 'simple' | 'detailed') => {
    onChange({ ...options, detailLevel })
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {t('options.title')}
      </h3>
      
      <div className="space-y-6">
        {/* 言語選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('options.language')}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="ja"
                checked={options.language === 'ja'}
                onChange={() => handleLanguageChange('ja')}
                disabled={disabled}
                className="text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">日本語</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="language"
                value="en"
                checked={options.language === 'en'}
                onChange={() => handleLanguageChange('en')}
                disabled={disabled}
                className="text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">English</span>
            </label>
          </div>
        </div>

        {/* 詳細度選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('options.detailLevel')}
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="detailLevel"
                value="simple"
                checked={options.detailLevel === 'simple'}
                onChange={() => handleDetailLevelChange('simple')}
                disabled={disabled}
                className="text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t('options.detailLevels.simple')}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="detailLevel"
                value="detailed"
                checked={options.detailLevel === 'detailed'}
                onChange={() => handleDetailLevelChange('detailed')}
                disabled={disabled}
                className="text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t('options.detailLevels.detailed')}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}