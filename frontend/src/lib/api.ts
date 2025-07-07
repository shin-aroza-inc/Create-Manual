import { supabase } from './supabase'
import { API_ENDPOINTS } from '@/constants/API_ENDPOINTS'
import type { ApiResponse, VideoProcessRequest, VideoProcessResponse } from '@/types/api.types'

export const uploadVideo = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}_${file.name}`
  
  // パブリックバケットにアップロード（Cloudinary連携のため）
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file)

  if (error) {
    throw new Error(`動画アップロードに失敗しました: ${error.message}`)
  }

  // パブリックバケットのURLを取得
  const { data: publicUrl } = supabase.storage
    .from('videos')
    .getPublicUrl(data.path)

  return publicUrl.publicUrl
}

export const processVideo = async (
  request: VideoProcessRequest
): Promise<ApiResponse<VideoProcessResponse>> => {
  await supabase.auth.getSession()
  
  const response = await fetch(API_ENDPOINTS.PROCESS_VIDEO, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let errorMessage = `API呼び出しに失敗しました: ${response.statusText}`
    
    try {
      const errorData = await response.json()
      if (errorData.error) {
        errorMessage = errorData.error
      }
    } catch {
      // JSON パースに失敗した場合はデフォルトメッセージを使用
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

export const deleteVideo = async (fileName: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('videos')
    .remove([fileName])

  if (error) {
    console.error('動画削除エラー:', error)
  }
}