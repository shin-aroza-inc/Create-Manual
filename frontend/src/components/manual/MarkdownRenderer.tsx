import React from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">{children}</h3>
          ),
          p: ({ children }) => {
            // 全ての段落をdivに変更して構造的な問題を回避
            return (
              <div className="text-gray-700 mb-3 leading-relaxed paragraph-content">{children}</div>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">{children}</li>
          ),
          img: ({ src, alt }) => {
            // 空文字列やnull/undefinedの場合は画像を表示しない
            if (!src || src.trim() === '') {
              return alt ? (
                <div className="my-6 text-center">
                  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 italic">{alt}</p>
                  </div>
                </div>
              ) : null
            }
            
            return (
              <div className="my-6 text-center">
                <img
                  src={src}
                  alt={alt || ''}
                  className="max-w-full h-auto rounded-xl shadow-soft border border-gray-200/50 mx-auto animate-fade-in"
                  loading="lazy"
                  onError={(e) => {
                    // 画像読み込みエラー時のフォールバック
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    // 代替テキストを表示
                    const parent = target.parentElement;
                    if (parent && alt) {
                      const fallback = document.createElement('div');
                      fallback.className = 'bg-gray-100 p-4 rounded-xl border border-gray-200';
                      fallback.innerHTML = `<p class="text-sm text-gray-500 italic">[画像を読み込めませんでした: ${alt}]</p>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
                {alt && (
                  <div className="text-sm text-gray-500 mt-2 italic">{alt}</div>
                )}
              </div>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600 my-4">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}