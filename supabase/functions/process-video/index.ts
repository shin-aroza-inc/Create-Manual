import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { handleCors, createResponse } from '../_shared/cors.ts'
import { analyzeVideoWithGemini } from '../_shared/gemini.ts'
import { extractScreenshots, uploadScreenshotToSupabase } from '../_shared/cloudinary.ts'
import type { VideoProcessRequest, VideoProcessResponse, Screenshot } from '../_shared/types.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // CORS処理
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // リクエストボディの解析
    console.log('Parsing request body...')
    const requestData: VideoProcessRequest = await req.json()
    console.log('Request data parsed:', {
      hasVideoUrl: !!requestData.videoUrl,
      language: requestData.language,
      detailLevel: requestData.detailLevel
    })
    
    if (!requestData.videoUrl || !requestData.language || !requestData.detailLevel) {
      console.error('Missing required parameters')
      return createResponse(null, 'Missing required parameters', 400)
    }

    // Gemini APIで動画を解析
    console.log('Analyzing video with Gemini API...')
    const geminiResult = await analyzeVideoWithGemini({
      videoUrl: requestData.videoUrl,
      language: requestData.language,
      detailLevel: requestData.detailLevel
    })

    // Cloudinary APIを使用してスクリーンショットを生成
    console.log('Generating screenshots with Cloudinary API...')
    const cloudinaryScreenshots = await extractScreenshots(
      requestData.videoUrl,
      geminiResult.screenshotTimestamps
    )
    
    const screenshots: Screenshot[] = cloudinaryScreenshots.map((screenshot, index) => ({
      id: `screenshot_${index}`,
      url: screenshot.url,
      timestamp: screenshot.timestamp,
      description: `Step ${index + 1} screenshot at ${screenshot.timestamp}s`
    }))

    // スクリーンショットのURLをマニュアルに埋め込む
    let enhancedManual = geminiResult.manualContent
    console.log('Original manual content preview:', enhancedManual.substring(0, 500))
    
    screenshots.forEach((screenshot, index) => {
      // プレースホルダーを実際の画像URLに置き換え
      const placeholder = `PLACEHOLDER_IMAGE_${index}`
      console.log(`Replacing ${placeholder} with ${screenshot.url}`)
      enhancedManual = enhancedManual.replace(placeholder, screenshot.url)
    })
    
    console.log('Enhanced manual content preview:', enhancedManual.substring(0, 500))

    const response: VideoProcessResponse = {
      manualContent: enhancedManual,
      screenshots
    }

    console.log('Video processing completed successfully')
    return createResponse(response)

  } catch (error) {
    console.error('Error processing video:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return createResponse(null, errorMessage, 500)
  }
})