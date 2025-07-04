export const MESSAGES = {
  ERRORS: {
    FILE_TOO_LARGE: 'ファイルサイズが500MBを超えています',
    INVALID_FORMAT: 'サポートされていないファイル形式です',
    UPLOAD_FAILED: 'アップロードに失敗しました',
    PROCESSING_FAILED: '処理に失敗しました',
    NETWORK_ERROR: 'ネットワークエラーが発生しました',
    TIMEOUT: 'タイムアウトしました'
  },
  SUCCESS: {
    UPLOAD_COMPLETE: 'アップロードが完了しました',
    PROCESSING_COMPLETE: 'マニュアル生成が完了しました'
  },
  PROCESSING: {
    UPLOADING: '動画をアップロード中...',
    ANALYZING: '動画を解析中...',
    EXTRACTING: 'スクリーンショットを抽出中...',
    GENERATING: 'マニュアルを生成中...'
  }
} as const