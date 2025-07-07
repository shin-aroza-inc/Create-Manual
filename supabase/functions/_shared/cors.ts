export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cleanup-signature, x-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

export function createResponse<T>(
  data: T | null,
  error: string | null = null,
  status = 200
): Response {
  const response = {
    success: !error,
    data: error ? undefined : data,
    error,
  }

  return new Response(JSON.stringify(response), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    },
    status,
  })
}