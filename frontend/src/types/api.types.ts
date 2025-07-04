export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface VideoProcessRequest {
  videoUrl: string
  language: 'ja' | 'en'
  detailLevel: 'simple' | 'detailed'
}

export interface VideoProcessResponse {
  manualContent: string
  screenshots: Screenshot[]
}

export interface Screenshot {
  id: string
  url: string
  timestamp: number
  description: string
  stepNumber: number
}