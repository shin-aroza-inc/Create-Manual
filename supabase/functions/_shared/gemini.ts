const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

export interface GeminiRequest {
  videoUrl: string
  language: 'ja' | 'en'
  detailLevel: 'simple' | 'detailed'
}

export interface GeminiResponse {
  manualContent: string
  screenshotTimestamps: number[]
}

export async function analyzeVideoWithGemini(request: GeminiRequest): Promise<GeminiResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  console.log('Starting video analysis with Gemini 2.5-flash...')

  try {
    // 1. 動画ファイルをGemini APIにアップロード
    const fileUri = await uploadVideoToGemini(request.videoUrl)
    console.log('Video uploaded to Gemini:', fileUri)

    // 2. アップロード完了まで待機
    await waitForFileProcessing(fileUri)
    console.log('Video processing completed')

    // 3. プロンプトを作成して解析実行
    const prompt = createPrompt(request)
    const analysisResult = await generateContent(fileUri, prompt)
    
    return parseGeminiResponse(analysisResult, request.language)
  } catch (error) {
    console.error('Gemini API error:', error)
    throw error
  }
}

async function uploadVideoToGemini(videoUrl: string): Promise<string> {
  console.log('Downloading video from:', videoUrl.substring(0, 100) + '...')
  
  // 動画ファイルをダウンロード
  const videoResponse = await fetch(videoUrl)
  console.log('Video download response status:', videoResponse.status, videoResponse.statusText)
  
  if (!videoResponse.ok) {
    const errorText = await videoResponse.text()
    console.error('Video download error:', errorText)
    throw new Error(`Failed to fetch video from URL: ${videoResponse.statusText} - ${errorText}`)
  }

  const videoBlob = await videoResponse.blob()
  console.log('Video downloaded, size:', videoBlob.size)

  // ステップ1: アップロードセッション開始（修正版）
  console.log('Starting upload session with URL:', `${GEMINI_BASE_URL}/files`)
  console.log('API Key available:', GEMINI_API_KEY ? 'YES' : 'NO')
  console.log('Video size:', videoBlob.size)
  
  const sessionResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Type': 'video/mp4',
      'X-Goog-Upload-Header-Content-Length': videoBlob.size.toString(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: {
        display_name: 'uploaded_video.mp4'
      }
    }),
  })

  console.log('Session response status:', sessionResponse.status, sessionResponse.statusText)

  if (!sessionResponse.ok) {
    const errorText = await sessionResponse.text()
    console.error('Session response error:', errorText)
    throw new Error(`Failed to start upload session: ${sessionResponse.statusText} - ${errorText}`)
  }

  // レスポンスヘッダーをログ出力
  console.log('Session response headers:')
  for (const [key, value] of sessionResponse.headers.entries()) {
    console.log(`  ${key}: ${value}`)
  }

  // レスポンスボディも確認
  const responseBody = await sessionResponse.text()
  console.log('Session response body:', responseBody)

  // 複数のヘッダー名パターンを試す（大文字小文字の違いを考慮）
  const uploadUrl = sessionResponse.headers.get('x-goog-upload-url') || 
                   sessionResponse.headers.get('X-Goog-Upload-URL') ||
                   sessionResponse.headers.get('X-GUpload-Upload-URL')
  
  console.log('Found upload URL:', uploadUrl ? '[REDACTED]' : 'null')
  
  if (!uploadUrl) {
    // レスポンスボディをJSONとして解析して、upload URLがあるかチェック
    try {
      const responseJson = JSON.parse(responseBody)
      console.log('Response JSON keys:', Object.keys(responseJson))
      if (responseJson.uploadUrl || responseJson.upload_url) {
        const urlFromBody = responseJson.uploadUrl || responseJson.upload_url
        console.log('Found upload URL in response body')
        return await uploadFileContent(urlFromBody, videoBlob)
      }
    } catch (e) {
      console.log('Response body is not valid JSON')
    }
    
    throw new Error('No upload URL received from Gemini')
  }

  return await uploadFileContent(uploadUrl, videoBlob)
}

async function uploadFileContent(uploadUrl: string, videoBlob: Blob): Promise<string> {
  console.log('Upload session started, uploading file...')

  // ステップ2: 実際のファイルをアップロード（修正版）
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': videoBlob.size.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: videoBlob,
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw new Error(`Failed to upload video: ${uploadResponse.statusText} - ${errorText}`)
  }

  const uploadResult = await uploadResponse.json()
  console.log('Upload completed:', uploadResult)
  
  return uploadResult.file.uri
}

async function waitForFileProcessing(fileUri: string): Promise<void> {
  const fileName = fileUri.split('/').pop()
  const maxAttempts = 30 // 最大5分待機
  let attempts = 0

  console.log('Waiting for file processing...')

  while (attempts < maxAttempts) {
    const statusResponse = await fetch(`${GEMINI_BASE_URL}/files/${fileName}?key=${GEMINI_API_KEY}`)
    
    if (statusResponse.ok) {
      const status = await statusResponse.json()
      console.log('File status:', status.state)
      
      if (status.state === 'ACTIVE') {
        return
      }
      if (status.state === 'FAILED') {
        throw new Error('Video processing failed')
      }
    }

    await new Promise(resolve => setTimeout(resolve, 10000)) // 10秒待機
    attempts++
  }

  throw new Error('Video processing timeout')
}

async function generateContent(fileUri: string, prompt: string): Promise<string> {
  console.log('Generating content with Gemini 2.5-flash...')
  
  const response = await fetch(`${GEMINI_BASE_URL}/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            fileData: {
              mimeType: 'video/mp4',
              fileUri: fileUri
            }
          },
          {
            text: prompt
          }
        ]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini content generation error: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  
  console.log('Gemini API response:', JSON.stringify(data, null, 2))
  
  // レスポンス構造をチェック
  if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
    console.error('No candidates in response:', data)
    throw new Error('Invalid response from Gemini API: No candidates found')
  }
  
  const candidate = data.candidates[0]
  if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
    console.error('Invalid candidate structure:', candidate)
    throw new Error('Invalid response from Gemini API: Invalid candidate structure')
  }
  
  const part = candidate.content.parts[0]
  if (!part.text) {
    console.error('No text in part:', part)
    throw new Error('Invalid response from Gemini API: No text content found')
  }

  return part.text
}

function createPrompt(request: GeminiRequest): string {
  const language = request.language === 'ja' ? '日本語' : '英語'
  const detailLevel = request.detailLevel === 'simple' ? '簡潔' : '詳細'

  if (request.language === 'ja') {
    return `
この動画を分析して、操作マニュアルをJSONで返してください。

要件:
- 言語: ${language}
- 詳細度: ${detailLevel}
- 各ステップにtimestampとimageTag {{n}}を含める

以下のJSON形式で出力してください:

{
  "title": "操作マニュアル",
  "overview": "動画の概要説明",
  "steps": [
    {
      "stepNumber": 1,
      "timestamp": 5,
      "action": "操作内容の説明",
      "imageTag": "{{1}}",
      "description": "${detailLevel}な説明"
    },
    {
      "stepNumber": 2,
      "timestamp": 15,
      "action": "操作内容の説明",
      "imageTag": "{{2}}",
      "description": "${detailLevel}な説明"
    }
  ],
  "timestamps": [5, 15, 25, 35]
}

注意事項:
- 重要な操作ポイントでのスクリーンショットが必要な場面のタイムスタンプを特定
- ${detailLevel}な説明を心がける
- 専門用語はそのまま使用
- 必ず有効なJSONを返す
    `
  } else {
    return `
Analyze this video and create an operation manual in JSON format.

Requirements:
- Language: ${language}
- Detail level: ${detailLevel}
- Include timestamp and imageTag {{n}} for each step

Please output in the following JSON format:

{
  "title": "Operation Manual",
  "overview": "Overview of the video",
  "steps": [
    {
      "stepNumber": 1,
      "timestamp": 5,
      "action": "Action description",
      "imageTag": "{{1}}",
      "description": "${detailLevel} explanation"
    },
    {
      "stepNumber": 2,
      "timestamp": 15,
      "action": "Action description",
      "imageTag": "{{2}}",
      "description": "${detailLevel} explanation"
    }
  ],
  "timestamps": [5, 15, 25, 35]
}

Notes:
- Identify timestamps where screenshots are needed for important operation points
- Provide ${detailLevel} explanations
- Use technical terms as they appear in the video
- Always return valid JSON
    `
  }
}

function parseGeminiResponse(text: string, language: 'ja' | 'en' = 'ja'): GeminiResponse {
  console.log('Parsing Gemini response...')
  
  try {
    let jsonText = text
    
    // ```json ブロックから JSON を抽出
    const codeBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
      console.log('Extracted JSON from code block')
    } else {
      // 通常のJSONマッチ
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      jsonText = jsonMatch[0]
    }

    console.log('JSON text to parse:', jsonText.substring(0, 500) + '...')
    const jsonData = JSON.parse(jsonText)
    
    // 言語に応じたヘッダーテキスト
    const headers = {
      ja: {
        overview: '概要',
        steps: '手順'
      },
      en: {
        overview: 'Overview',
        steps: 'Steps'
      }
    }
    
    const currentHeaders = headers[language]
    
    // マニュアルコンテンツをMarkdown形式に変換
    let manualContent = `# ${jsonData.title}\n\n`
    
    if (jsonData.overview) {
      manualContent += `## ${currentHeaders.overview}\n${jsonData.overview}\n\n`
    }
    
    manualContent += `## ${currentHeaders.steps}\n\n`
    
    if (jsonData.steps && Array.isArray(jsonData.steps)) {
      jsonData.steps.forEach((step: any, index: number) => {
        manualContent += `### ${step.stepNumber}. ${step.action}\n\n`
        manualContent += `${step.description}\n\n`
        manualContent += `![Step ${step.stepNumber}](PLACEHOLDER_IMAGE_${index})\n\n`
      })
    }

    // タイムスタンプの抽出
    let screenshotTimestamps: number[] = []
    
    if (jsonData.timestamps && Array.isArray(jsonData.timestamps)) {
      screenshotTimestamps = jsonData.timestamps.filter((t: any) => 
        typeof t === 'number' && t >= 0
      )
    } else if (jsonData.steps && Array.isArray(jsonData.steps)) {
      screenshotTimestamps = jsonData.steps
        .map((step: any) => step.timestamp)
        .filter((t: any) => typeof t === 'number' && t >= 0)
    }

    // タイムスタンプがない場合はデフォルト値を設定
    if (screenshotTimestamps.length === 0) {
      console.log('No timestamps found, using defaults')
      screenshotTimestamps = [5, 15, 30]
    }

    console.log('Screenshots timestamps:', screenshotTimestamps)

    return {
      manualContent,
      screenshotTimestamps
    }
  } catch (error) {
    console.error('Failed to parse JSON response:', error)
    
    // フォールバック: テキストとして処理
    const screenshotTimestamps = [5, 15, 30]
    
    return {
      manualContent: text,
      screenshotTimestamps
    }
  }
}