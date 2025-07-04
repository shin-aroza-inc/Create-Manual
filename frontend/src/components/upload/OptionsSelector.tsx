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
    <div className="bg-white rounded-xl shadow-soft p-8 border border-gray-200/50">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {t('options.title')}
      </h3>
      
      <div className="space-y-8">
        {/* 言語選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t('options.language')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${options.language === 'ja' 
                ? 'border-primary-500 bg-primary-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input
                type="radio"
                name="language"
                value="ja"
                checked={options.language === 'ja'}
                onChange={() => handleLanguageChange('ja')}
                disabled={disabled}
                className="sr-only"
              />
              <span className={`font-medium ${options.language === 'ja' ? 'text-primary-700' : 'text-gray-700'}`}>
                🇯🇵 日本語
              </span>
              {options.language === 'ja' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full animate-scale-up"></div>
              )}
            </label>
            <label className={`
              relative flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${options.language === 'en' 
                ? 'border-primary-500 bg-primary-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input
                type="radio"
                name="language"
                value="en"
                checked={options.language === 'en'}
                onChange={() => handleLanguageChange('en')}
                disabled={disabled}
                className="sr-only"
              />
              <span className={`font-medium ${options.language === 'en' ? 'text-primary-700' : 'text-gray-700'}`}>
                🇺🇸 English
              </span>
              {options.language === 'en' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full animate-scale-up"></div>
              )}
            </label>
          </div>
        </div>

        {/* 詳細度選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            {t('options.detailLevel')}
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`
              relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${options.detailLevel === 'simple' 
                ? 'border-primary-500 bg-primary-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input
                type="radio"
                name="detailLevel"
                value="simple"
                checked={options.detailLevel === 'simple'}
                onChange={() => handleDetailLevelChange('simple')}
                disabled={disabled}
                className="sr-only"
              />
              <span className={`text-2xl mb-2 ${options.detailLevel === 'simple' ? 'animate-bounce-gentle' : ''}`}>📄</span>
              <span className={`font-medium ${options.detailLevel === 'simple' ? 'text-primary-700' : 'text-gray-700'}`}>
                {t('options.detailLevels.simple')}
              </span>
              {options.detailLevel === 'simple' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full animate-scale-up"></div>
              )}
            </label>
            <label className={`
              relative flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
              ${options.detailLevel === 'detailed' 
                ? 'border-primary-500 bg-primary-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}>
              <input
                type="radio"
                name="detailLevel"
                value="detailed"
                checked={options.detailLevel === 'detailed'}
                onChange={() => handleDetailLevelChange('detailed')}
                disabled={disabled}
                className="sr-only"
              />
              <span className={`text-2xl mb-2 ${options.detailLevel === 'detailed' ? 'animate-bounce-gentle' : ''}`}>📚</span>
              <span className={`font-medium ${options.detailLevel === 'detailed' ? 'text-primary-700' : 'text-gray-700'}`}>
                {t('options.detailLevels.detailed')}
              </span>
              {options.detailLevel === 'detailed' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-primary-500 rounded-full animate-scale-up"></div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}