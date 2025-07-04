import { createClient } from 'jsr:@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const CLEANUP_SECRET = Deno.env.get('CLEANUP_SECRET') || 'default-secret-change-me'

// 署名検証関数
async function verifySignature(signature: string | null, timestamp: string | null, body: string): Promise<boolean> {
  if (!signature || !timestamp) {
    return false
  }

  // タイムスタンプが5分以内であることを確認
  const currentTime = Date.now()
  const requestTime = parseInt(timestamp) * 1000 // 秒からミリ秒に変換
  if (Math.abs(currentTime - requestTime) > 300000) { // 5分 = 300000ms
    console.log('Timestamp expired')
    return false
  }

  // 署名の検証
  const message = `${timestamp}.${body}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CLEANUP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const messageData = encoder.encode(message)
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData)
  const signatureArray = new Uint8Array(signatureBuffer)
  const computedSignature = btoa(String.fromCharCode(...signatureArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return computedSignature === signature
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 署名検証
    const signature = req.headers.get('X-Cleanup-Signature')
    const timestamp = req.headers.get('X-Timestamp')
    const body = await req.text()

    const isValidSignature = await verifySignature(signature, timestamp, body)
    
    if (!isValidSignature) {
      console.error('Invalid signature or timestamp')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    console.log('Starting cleanup process for videos and screenshots...')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration is missing')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // videos バケット内のファイル一覧を取得
    const { data: files, error: listError } = await supabase.storage
      .from('videos')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing files:', listError)
      throw new Error(`Failed to list files: ${listError.message}`)
    }

    console.log(`Found ${files?.length || 0} files in videos bucket`)

    // 現在時刻から15分以上古いファイルを識別
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    let filesToDelete: string[] = []

    if (files && files.length > 0) {
      for (const file of files) {
      if (file.created_at) {
        const fileCreatedAt = new Date(file.created_at)
        if (fileCreatedAt < fifteenMinutesAgo) {
          filesToDelete.push(file.name)
          console.log(`Marking for deletion: ${file.name} (created: ${file.created_at})`)
        }
      }
    }
  }

    console.log(`Files to delete: ${filesToDelete.length}`)

    if (filesToDelete.length > 0) {

    // ファイルを削除
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('videos')
      .remove(filesToDelete)

    if (deleteError) {
      console.error('Error deleting files:', deleteError)
      throw new Error(`Failed to delete files: ${deleteError.message}`)
    }

      console.log(`Successfully deleted ${filesToDelete.length} video files`)
      console.log('Deleted video files:', filesToDelete)
    } else {
      console.log('No old video files found for deletion')
    }

    // screenshots バケットのクリーンアップ
    console.log('Starting screenshots cleanup...')
    
    const { data: screenshotFiles, error: screenshotListError } = await supabase.storage
      .from('screenshots')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (screenshotListError) {
      console.error('Error listing screenshot files:', screenshotListError)
      // エラーがあってもvideo削除の結果は返す
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Deleted ${filesToDelete.length} video files. Screenshot cleanup failed.`,
          videos: {
            deleted: filesToDelete.length,
            total: files.length
          },
          screenshots: {
            error: screenshotListError.message
          }
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Found ${screenshotFiles?.length || 0} files in screenshots bucket`)

    const screenshotsToDelete: string[] = []
    
    if (screenshotFiles && screenshotFiles.length > 0) {
      for (const file of screenshotFiles) {
        if (file.created_at) {
          const fileCreatedAt = new Date(file.created_at)
          if (fileCreatedAt < fifteenMinutesAgo) {
            screenshotsToDelete.push(file.name)
            console.log(`Marking screenshot for deletion: ${file.name} (created: ${file.created_at})`)
          }
        }
      }
    }

    console.log(`Screenshots to delete: ${screenshotsToDelete.length}`)

    if (screenshotsToDelete.length > 0) {
      const { data: deleteScreenshotData, error: deleteScreenshotError } = await supabase.storage
        .from('screenshots')
        .remove(screenshotsToDelete)

      if (deleteScreenshotError) {
        console.error('Error deleting screenshot files:', deleteScreenshotError)
      } else {
        console.log(`Successfully deleted ${screenshotsToDelete.length} screenshot files`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleanup completed. Videos: ${filesToDelete.length} deleted, Screenshots: ${screenshotsToDelete.length} deleted`,
        videos: {
          deleted: filesToDelete.length,
          total: files.length,
          deletedFiles: filesToDelete
        },
        screenshots: {
          deleted: screenshotsToDelete.length,
          total: screenshotFiles?.length || 0,
          deletedFiles: screenshotsToDelete
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Cleanup error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        deleted: 0
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})