export interface Manual {
  id: string
  title: string
  content: string
  language: 'ja' | 'en'
  detailLevel: 'simple' | 'detailed'
  screenshots: Screenshot[]
  createdAt: Date
}

export interface Screenshot {
  id: string
  url: string
  timestamp: number
  description: string
  stepNumber: number
}

export interface ManualGenerationOptions {
  language: 'ja' | 'en'
  detailLevel: 'simple' | 'detailed'
}

export interface ProcessingStatus {
  stage: 'uploading' | 'analyzing' | 'extracting' | 'generating' | 'completed' | 'error'
  progress: number
  message: string
}