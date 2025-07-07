import { useCallback } from 'react'
import html2pdf from 'html2pdf.js'
import type { Manual } from '@/types/manual.types'

interface UsePdfGeneratorReturn {
  generatePdf: (manual: Manual) => Promise<void>
}

export const usePdfGenerator = (): UsePdfGeneratorReturn => {
  const generatePdf = useCallback(async (manual: Manual) => {
    try {
      console.log('PDF生成開始 - 実際のマニュアルコンテンツ版')

      // 実際のマニュアルコンテンツが表示されているDOM要素を取得
      const manualContentElement = document.querySelector('.prose.prose-sm.max-w-none')
      
      if (!manualContentElement) {
        console.error('マニュアルコンテンツ要素が見つかりません')
        throw new Error('マニュアルコンテンツが見つかりません')
      }

      console.log('マニュアルコンテンツ要素:', manualContentElement)

      // PDFのヘッダー情報を作成
      const header = `
        <div style="margin: 0 0 20px 0; padding: 10px; border-bottom: 2px solid #3B82F6; background: white; width: 100%; box-sizing: border-box;">
          <h1 style="color: #1F2937; margin: 0 0 10px 0; font-size: 24px; font-weight: bold;">操作マニュアル</h1>
          <div style="color: #6B7280; font-size: 14px;">
            <span style="margin-right: 20px;">言語: ${manual.language === 'ja' ? '日本語' : 'English'}</span>
            <span style="margin-right: 20px;">詳細度: ${manual.detailLevel === 'simple' ? '簡潔' : '詳細'}</span>
            <span>作成日時: ${manual.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
      `

      // 実際のマニュアルコンテンツのHTMLを取得
      const manualHtml = manualContentElement.innerHTML

      // Tailwind CSSクラスをインラインスタイルに変換する関数（画像を含める）
      const convertTailwindToInlineStyles = (html: string) => {
        return html
          // 見出し1
          .replace(/class="text-2xl font-bold text-gray-900 mb-4"/g, 'style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px; margin-top: 20px;"')
          // 見出し2  
          .replace(/class="text-xl font-semibold text-gray-900 mb-3 mt-6"/g, 'style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 12px; margin-top: 24px;"')
          // 見出し3
          .replace(/class="text-lg font-medium text-gray-900 mb-2 mt-4"/g, 'style="font-size: 18px; font-weight: 500; color: #111827; margin-bottom: 8px; margin-top: 16px;"')
          // 段落コンテンツ
          .replace(/class="text-gray-700 mb-3 leading-relaxed paragraph-content"/g, 'style="color: #374151; margin-bottom: 12px; line-height: 1.625;"')
          // 画像コンテナ（画像を保持）
          .replace(/class="my-6 text-center"/g, 'style="margin: 24px 0; text-align: center;"')
          // 画像
          .replace(/class="max-w-full h-auto rounded-xl shadow-soft border border-gray-200\/50 mx-auto animate-fade-in"/g, 'style="max-width: 600px; width: 100%; height: auto; border-radius: 12px; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); border: 1px solid rgba(229, 231, 235, 0.5); margin: 0 auto; display: block;"')
          // 画像キャプション
          .replace(/class="text-sm text-gray-500 mt-2 italic"/g, 'style="font-size: 14px; color: #6B7280; margin-top: 8px; font-style: italic;"')
          // その他のクラス属性を削除
          .replace(/class="[^"]*"/g, '')
      }

      // HTMLコンテンツを作成（インラインスタイル変換済み）
      let styledManualHtml = convertTailwindToInlineStyles(manualHtml)
      
      // 画像のCORS問題を回避するため、画像をdata URLに変換
      console.log('画像をdata URLに変換中...')
      const imgElements = manualContentElement.querySelectorAll('img')
      for (const img of imgElements) {
        try {
          // 同じオリジンの画像の場合、data URLに変換
          if (img.src && img.complete && img.naturalWidth > 0) {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
              styledManualHtml = styledManualHtml.replace(img.src, dataUrl)
              console.log('画像をdata URLに変換完了:', img.src)
            }
          }
        } catch (error) {
          console.log('画像変換エラー（CORS制限の可能性）:', img.src, error)
          // CORSエラーの場合はそのまま使用
        }
      }
      
      const pdfContent = `
        <div style="font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #374151; width: 100%; margin: 0; padding: 0; background: white; box-sizing: border-box;">
          ${header}
          <div style="font-size: 14px; color: #374151; padding: 0; margin: 0;">
            ${styledManualHtml}
          </div>
        </div>
      `

      console.log('PDF用HTMLコンテンツ作成完了')

      // 一時的なDIV要素を作成（画面外に配置）
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = pdfContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '794px' // A4幅をピクセルで指定（210mm = 794px at 96dpi）
      tempDiv.style.height = 'auto'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.color = 'black'
      tempDiv.style.padding = '0px'
      tempDiv.style.margin = '0px'
      tempDiv.style.boxSizing = 'border-box'
      document.body.appendChild(tempDiv)

      console.log('一時的なDIV要素作成:', tempDiv)
      console.log('DOMに追加後のサイズ:', {
        width: tempDiv.offsetWidth,
        height: tempDiv.offsetHeight,
        scrollHeight: tempDiv.scrollHeight
      })

      try {
        // html2canvasの詳細設定でキャプチャ問題を解決
        const options = {
          margin: 10,
          filename: `test-manual-${Date.now()}.pdf`,
          html2canvas: { 
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: false,
            allowTaint: true,
            foreignObjectRendering: false,
            logging: true,
            width: tempDiv.offsetWidth,
            height: tempDiv.offsetHeight,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
          }
        }

        console.log('PDF生成オプション:', options)

        // 少し待ってからPDF生成（DOM要素が確実に描画されるまで）
        console.log('描画待機中...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // html2canvasで直接canvasを生成してjsPDFに渡す
        console.log('html2canvas開始...')
        const html2canvas = (await import('html2canvas')).default
        // 画像読み込み完了を待つ
        console.log('画像読み込み待機中...')
        const images = tempDiv.querySelectorAll('img')
        const imagePromises = Array.from(images).map((img) => {
          return new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              console.log('画像読み込み済み:', img.src)
              resolve()
            } else {
              img.onload = () => {
                console.log('画像読み込み完了:', img.src)
                resolve()
              }
              img.onerror = () => {
                console.log('画像読み込みエラー:', img.src)
                resolve() // エラーでも続行
              }
            }
          })
        })
        await Promise.all(imagePromises)
        console.log('全画像読み込み完了')

        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: false,
          logging: true,
          width: tempDiv.offsetWidth,
          height: tempDiv.offsetHeight,
          imageTimeout: 30000,
          removeContainer: false
        })
        console.log('html2canvas成功:', canvas)
        console.log('canvasサイズ:', { width: canvas.width, height: canvas.height })
        
        // jsPDFを直接使ってPDFを作成
        console.log('jsPDF開始...')
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })
        
        // canvasの画像データを取得
        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        console.log('画像データ取得完了')
        
        // A4サイズに合わせて画像をスケール（余白完全削除）
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const canvasAspectRatio = canvas.height / canvas.width
        
        // 画像の位置とサイズを調整（完全にフィット）
        const margin = 0
        let imgWidth = pdfWidth
        let imgHeight = imgWidth * canvasAspectRatio
        
        // 高さがページを超える場合でも、幅を優先してフルに使用
        if (imgHeight > pdfHeight) {
          // ページ高さに合わせる
          imgHeight = pdfHeight
          imgWidth = imgHeight / canvasAspectRatio
          
          // 中央配置のためのX座標調整
          const xOffset = (pdfWidth - imgWidth) / 2
          pdf.addImage(imgData, 'JPEG', xOffset, margin, imgWidth, imgHeight)
        } else {
          // 幅を最大限に使用
          pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
        }
        
        console.log('PDF画像サイズ:', { width: imgWidth, height: imgHeight })
        console.log('PDFページサイズ:', { width: pdfWidth, height: pdfHeight })
        console.log('Canvas元サイズ:', { width: canvas.width, height: canvas.height })
        
        // PDFをBlobとして出力
        const pdfBlob = pdf.output('blob')
        
        console.log('PDF生成完了')
        console.log('PDFブロブサイズ:', pdfBlob.size)
        
        if (pdfBlob.size < 1000) {
          console.error('PDFサイズが異常に小さいです:', pdfBlob.size)
          // より詳細なデバッグのため、html2canvasを直接テスト
          console.log('html2canvasの直接テスト開始...')
          try {
            const html2canvas = (await import('html2canvas')).default
            const canvas = await html2canvas(tempDiv, {
              backgroundColor: 'white',
              logging: true,
              scale: 1
            })
            console.log('html2canvas直接テスト成功:', canvas)
            console.log('canvasサイズ:', { width: canvas.width, height: canvas.height })
          } catch (canvasError) {
            console.error('html2canvas直接テストエラー:', canvasError)
          }
          throw new Error(`PDFサイズが異常に小さいです: ${pdfBlob.size}バイト`)
        }
        
        // BlobのURLを作成
        const pdfUrl = URL.createObjectURL(pdfBlob)
        console.log('PDFのURL:', pdfUrl)
        
        // 新しいタブでPDFを開く
        window.open(pdfUrl, '_blank')
        
        // メモリリークを防ぐため、少し後にURLを解放
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl)
        }, 5000)
        
      } finally {
        // 一時的なDIV要素を削除
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv)
          console.log('一時的なDIV要素削除完了')
        }
      }
    } catch (error) {
      console.error('PDF生成エラー:', error)
      throw new Error('PDFの生成に失敗しました')
    }
  }, [])

  return { generatePdf }
}