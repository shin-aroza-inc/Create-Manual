const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export const API_ENDPOINTS = {
  PROCESS_VIDEO: `${SUPABASE_URL}/functions/v1/process-video`,
  GENERATE_MANUAL: `${SUPABASE_URL}/functions/v1/generate-manual`,
  EXTRACT_SCREENSHOTS: `${SUPABASE_URL}/functions/v1/extract-screenshots`,
} as const