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

  console.log('Attempting direct Cloudinary video/fetch approach...')

  for (const timestamp of timestamps) {
    try {
      // 元の方法: CloudinaryのVideo Fetch APIを使用
      const screenshotUrl = await generateCloudinaryUrl(videoUrl, timestamp)
      
      console.log(`Generating screenshot for timestamp ${timestamp}:`, screenshotUrl)
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
          // フォールバックとしてプレースホルダーを使用
          screenshots.push({
            url: `https://picsum.photos/800/600?random=${timestamp}`,
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
          screenshots.push({
            url: screenshotUrl, // Cloudinaryのオリジナルを使用
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
        // より詳細なエラー情報を取得
        const responseText = await imageResponse.text()
        console.error(`Cloudinary URL failed for timestamp ${timestamp}:`, {
          status: imageResponse.status,
          statusText: imageResponse.statusText,
          headers: Object.fromEntries(imageResponse.headers.entries()),
          responseBody: responseText.substring(0, 500) // 最初の500文字のみ
        })
        
        // フォールバックとしてプレースホルダーを使用
        screenshots.push({
          url: `https://picsum.photos/800/600?random=${timestamp}`,
          timestamp
        })
      }
    } catch (error) {
      console.error(`Failed to generate screenshot for timestamp ${timestamp}:`, error)
      // エラーの場合もフォールバックを使用
      screenshots.push({
        url: `https://picsum.photos/800/600?random=${timestamp}`,
        timestamp
      })
    }
  }

  return screenshots
}

async function generateCloudinaryUrl(videoUrl: string, timestamp: number): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_CLOUD_NAME or CLOUDINARY_API_SECRET is not configured')
  }

  console.log(`Original video URL for timestamp ${timestamp}:`, videoUrl)
  
  // エンコードされたURL
  const encodedUrl = encodeURIComponent(videoUrl)
  
  // 変換パラメータ部分
  const trans = `so_${timestamp}/f_jpg,q_auto`
  
  // 署名対象文字列
  const toSign = trans + '/' + encodedUrl
  
  // SHA-1ハッシュで署名を生成
  const encoder = new TextEncoder()
  const data = encoder.encode(toSign + CLOUDINARY_API_SECRET)
  
  // SHA-1ハッシュを計算
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = new Uint8Array(hashBuffer)
  
  // Base64URL エンコード
  const base64String = btoa(String.fromCharCode(...hashArray))
  const base64UrlString = base64String
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  
  // 最初の8文字を使用
  const sig = base64UrlString.slice(0, 8)
  
  // 署名付きURLを生成
  const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/fetch/s--${sig}--/${trans}/${encodedUrl}`
  
  console.log('Generated signed Cloudinary URL:', cloudinaryUrl)
  
  return cloudinaryUrl
}

