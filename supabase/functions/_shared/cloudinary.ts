import { createClient } from 'jsr:@supabase/supabase-js'
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts'

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

export interface CloudinaryScreenshot {
  url: string
  timestamp: number
  supabaseUrl?: string
}

export async function extractScreenshots(
  videoUrl: string,
  timestamps: number[]
): Promise<CloudinaryScreenshot[]> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured')
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration is missing')
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const screenshots: CloudinaryScreenshot[] = []

  console.log('Generating screenshots with Cloudinary API...')

  for (const timestamp of timestamps) {
    try {
      // publicバケットのURLは署名なしでアクセス可能
      // URLをそのままエンコード
      const encodedUrl = encodeURIComponent(videoUrl)
      
      // Cloudinaryの変換URLを生成（署名なし）
      const screenshotUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/fetch/so_${timestamp}/f_jpg,q_auto/${encodedUrl}`
      
      console.log(`Generating screenshot for timestamp ${timestamp}`)
      const imageResponse = await fetch(screenshotUrl)
      console.log(`Cloudinary response status for timestamp ${timestamp}:`, imageResponse.status)
      
      if (imageResponse.ok) {
        // Cloudinaryから画像を取得してSupabaseに保存
        const imageBlob = await imageResponse.arrayBuffer()
        const fileName = `screenshot_${Date.now()}_${timestamp}.jpg`
        
        console.log(`Uploading screenshot to Supabase: ${fileName}`)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(fileName, imageBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          })

        if (uploadError) {
          console.error(`Failed to upload screenshot to Supabase for timestamp ${timestamp}:`, uploadError)
          // エラー画像を使用
          screenshots.push({
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zOTAuNSAyODBIMzk5LjVWMjk5SDM5MC41VjI4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGV4dCB4PSI0MDAiIHk9IjMzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjczODAiPuODnuODi+ODpeOCouODq+OBruOCueOCr+ODquODvOODs+OCt+ODp+ODg+ODiOOBruaKmOWHuuOCqOODqeODvCAtIE1hbnVhbCBHZW5lcmF0b3I8L3RleHQ+Cjwvc3ZnPg==',
            timestamp
          })
          continue
        }

        console.log(`Screenshot uploaded successfully: ${uploadData.path}`)
        
        // Supabaseから署名付きURLを生成（1時間有効）
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(uploadData.path, 3600)

        if (signedUrlError) {
          console.error(`Failed to create signed URL for timestamp ${timestamp}:`, signedUrlError)
          // CloudinaryのURLを使用
          screenshots.push({
            url: screenshotUrl,
            timestamp
          })
        } else {
          console.log(`Created signed URL for screenshot: ${signedUrlData.signedUrl}`)
          screenshots.push({
            url: signedUrlData.signedUrl, // Supabaseの署名付きURLを使用
            timestamp,
            supabaseUrl: signedUrlData.signedUrl
          })
        }
      } else {
        // エラーレスポンスの詳細を確認
        const responseText = await imageResponse.text()
        console.error(`Cloudinary URL failed for timestamp ${timestamp}:`, {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
          headers: Object.fromEntries(imageResponse.headers.entries()),
          responseBody: responseText.substring(0, 500)
        })
        
        // URLが長すぎる場合は、別の方法を試す
        console.log('Trying alternative approach with shorter URL...')
        
        // エラー画像を使用
        screenshots.push({
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zOTAuNSAyODBIMzk5LjVWMjk5SDM5MC41VjI4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGV4dCB4PSI0MDAiIHk9IjMzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjczODAiPuODnuODi+ODpeOCouODq+OBruOCueOCr+ODquODvOODs+OCt+ODp+ODg+ODiOOBruaKmOWHuuOCqOODqeODvCAtIE1hbnVhbCBHZW5lcmF0b3I8L3RleHQ+Cjwvc3ZnPg==',
          timestamp
        })
      }
    } catch (error) {
      console.error(`Failed to generate screenshot for timestamp ${timestamp}:`, error)
      // エラーの場合もエラー画像を使用
      screenshots.push({
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zOTAuNSAyODBIMzk5LjVWMjk5SDM5MC41VjI4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGV4dCB4PSI0MDAiIHk9IjMzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2QjczODAiPuODnuODi+ODpeOCouODq+OBruOCueOCr+ODquODvOODs+OCt+ODp+ODg+ODiOOBruaKmOWHuuOCqOODqeODvCAtIE1hbnVhbCBHZW5lcmF0b3I8L3RleHQ+Cjwvc3ZnPg==',
        timestamp
      })
    }
  }

  return screenshots
}


