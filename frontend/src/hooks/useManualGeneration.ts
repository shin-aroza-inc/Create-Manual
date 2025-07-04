import { useState, useCallback } from 'react'
import { processVideo } from '@/lib/api'
import type { ProcessingStatus, ManualGenerationOptions, Manual } from '@/types/manual.types'
import type { VideoProcessRequest } from '@/types/api.types'

export const useManualGeneration = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'uploading',
    progress: 0,
    message: ''
  })
  const [generatedManual, setGeneratedManual] = useState<Manual | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateManual = useCallback(async (
    videoUrl: string,
    options: ManualGenerationOptions
  ): Promise<boolean> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // 解析開始
      setStatus({
        stage: 'analyzing',
        progress: 25,
        message: '動画を解析中...'
      })

      const request: VideoProcessRequest = {
        videoUrl,
        language: options.language,
        detailLevel: options.detailLevel
      }

      const response = await processVideo(request)

      if (!response.success || !response.data) {
        throw new Error(response.error || '処理に失敗しました')
      }

      // スクリーンショット抽出
      setStatus({
        stage: 'extracting',
        progress: 60,
        message: 'スクリーンショットを抽出中...'
      })

      // マニュアル生成
      setStatus({
        stage: 'generating',
        progress: 80,
        message: 'マニュアルを生成中...'
      })

      // 完了
      setStatus({
        stage: 'completed',
        progress: 100,
        message: '完了しました'
      })

      const manual: Manual = {
        id: Date.now().toString(),
        title: '操作マニュアル',
        content: response.data.manualContent,
        language: options.language,
        detailLevel: options.detailLevel,
        screenshots: response.data.screenshots,
        createdAt: new Date()
      }

      setGeneratedManual(manual)
      return true

    } catch (err) {
      console.error('Manual generation error:', err)
      
      let errorMessage = '処理に失敗しました'
      
      if (err instanceof Error) {
        // API エラーの詳細メッセージを取得
        if (err.message.includes('API呼び出しに失敗しました')) {
          errorMessage = 'サーバーとの通信に失敗しました。しばらく時間をおいて再度お試しください。'
        } else if (err.message.includes('動画アップロードに失敗しました')) {
          errorMessage = '動画のアップロードに失敗しました。ファイルサイズやネットワーク接続を確認してください。'
        } else if (err.message.includes('Gemini')) {
          errorMessage = '動画の解析処理でエラーが発生しました。動画形式が対応しているか確認してください。'
        } else if (err.message.includes('Cloudinary') || err.message.includes('screenshot')) {
          errorMessage = 'スクリーンショットの生成でエラーが発生しました。処理を続行します。'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      setStatus({
        stage: 'error',
        progress: 0,
        message: errorMessage
      })
      return false
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const reset = useCallback(() => {
    setGeneratedManual(null)
    setError(null)
    setIsProcessing(false)
    setStatus({
      stage: 'uploading',
      progress: 0,
      message: ''
    })
  }, [])

  const downloadManual = useCallback(() => {
    if (!generatedManual) return

    const blob = new Blob([generatedManual.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedManual.title}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedManual])

  return {
    isProcessing,
    status,
    generatedManual,
    error,
    generateManual,
    downloadManual,
    reset
  }
}