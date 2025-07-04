-- 署名付きでcleanup-videos Edge Functionを呼び出す関数
CREATE OR REPLACE FUNCTION cleanup_videos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result record;
  timestamp_val text;
  body_text text;
  signature text;
  secret text;
  message text;
BEGIN
  -- シークレットキー（実際の運用では安全な方法で管理）
  secret := 'your-secure-secret-key-here';
  
  -- タイムスタンプ（Unix時間、秒単位）
  timestamp_val := EXTRACT(EPOCH FROM NOW())::INTEGER::TEXT;
  
  -- リクエストボディ
  body_text := '{}';
  
  -- 署名対象のメッセージ
  message := timestamp_val || '.' || body_text;
  
  -- HMAC-SHA256で署名を生成（Base64URL形式）
  signature := encode(
    hmac(message::bytea, secret::bytea, 'sha256'),
    'base64'
  );
  
  -- Base64をBase64URLに変換
  signature := replace(signature, '+', '-');
  signature := replace(signature, '/', '_');
  signature := replace(signature, '=', '');
  
  -- カスタムヘッダーを設定してHTTPリクエスト
  SELECT * FROM extensions.http((
    'POST',
    'https://gltvuathwtbmrdjcqkqg.supabase.co/functions/v1/cleanup-videos',
    ARRAY[
      ('Content-Type', 'application/json')::http_header,
      ('X-Cleanup-Signature', signature)::http_header,
      ('X-Timestamp', timestamp_val)::http_header
    ],
    'application/json',
    body_text
  )::http_request) INTO result;
  
  -- 結果をログ出力
  RAISE NOTICE 'Cleanup request completed with status: %', result.status;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Cleanup request failed: %', SQLERRM;
END;
$$;

-- 注意: pgcrypto拡張が必要
CREATE EXTENSION IF NOT EXISTS pgcrypto;