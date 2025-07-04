export const FILE_LIMITS = {
  MAX_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_DURATION: 10 * 60, // 10分（秒）
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
  SUPPORTED_MIME_TYPES: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ]
} as const