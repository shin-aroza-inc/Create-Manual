const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')

export interface CloudinaryScreenshot {
  url: string
  timestamp: number
}

export async function extractScreenshots(
  videoUrl: string,
  timestamps: number[]
): Promise<CloudinaryScreenshot[]> {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured')
  }

  const screenshots: CloudinaryScreenshot[] = []

  for (const timestamp of timestamps) {
    try {
      const screenshotUrl = generateCloudinaryUrl(videoUrl, timestamp)
      
      // CloudinaryのURLが実際に機能するかテスト
      console.log(`Testing Cloudinary URL for timestamp ${timestamp}:`, screenshotUrl)
      const testResponse = await fetch(screenshotUrl, { method: 'HEAD' })
      console.log(`Cloudinary response status for timestamp ${timestamp}:`, testResponse.status)
      
      if (testResponse.ok) {
        screenshots.push({
          url: screenshotUrl,
          timestamp
        })
      } else {
        console.error(`Cloudinary URL failed for timestamp ${timestamp}:`, testResponse.status, testResponse.statusText)
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

function generateCloudinaryUrl(videoUrl: string, timestamp: number): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured')
  }

  // Cloudinary transformation URL を生成
  // video/fetch を使用してリモート動画からフレームを抽出
  const cloudinaryUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/fetch/so_${timestamp}/f_jpg,q_auto/${encodeURIComponent(videoUrl)}`
  
  console.log('Generated Cloudinary URL:', cloudinaryUrl)
  return cloudinaryUrl
}

export async function uploadScreenshotToSupabase(
  screenshotUrl: string,
  fileName: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<string> {
  try {
    console.log('Fetching screenshot from Cloudinary:', screenshotUrl)
    
    // Cloudinaryから画像を取得
    const imageResponse = await fetch(screenshotUrl)
    console.log('Cloudinary response status:', imageResponse.status, imageResponse.statusText)
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      console.error('Cloudinary error response:', errorText)
      throw new Error(`Failed to fetch screenshot from Cloudinary: ${imageResponse.status} ${imageResponse.statusText}`)
    }

    const imageBlob = await imageResponse.blob()

    // Supabase Storageにアップロード
    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/screenshots/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': imageBlob.type,
      },
      body: imageBlob,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload screenshot to Supabase')
    }

    // 署名付きURLを生成
    const signedUrlResponse = await fetch(`${supabaseUrl}/storage/v1/object/sign/screenshots/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: 3600 }), // 1時間有効
    })

    if (!signedUrlResponse.ok) {
      throw new Error('Failed to generate signed URL')
    }

    const signedUrlData = await signedUrlResponse.json()
    return `${supabaseUrl}${signedUrlData.signedURL}`
  } catch (error) {
    console.error('Error uploading screenshot to Supabase:', error)
    // エラーの場合はCloudinaryのURLをそのまま返す
    return screenshotUrl
  }
}