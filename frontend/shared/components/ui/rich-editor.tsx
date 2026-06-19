'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import { ArticleBody } from '@/app/(main)/posts/[id]/article-body';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

interface SCEditorInstance {
  val: (value?: string) => string;
  insert: (start: string, end?: string) => void;
  bind: (event: string, handler: () => void) => void;
  fromBBCode: (bbcode: string, asFragment?: boolean) => string;
}

declare global {
  interface Window {
    sceditor?: {
      create: (el: HTMLTextAreaElement, config: Record<string, unknown>) => void;
      instance: (el: HTMLTextAreaElement) => SCEditorInstance;
      formats?: Record<string, { getHtml: (val: string) => string }>;
    };
  }
}

export const RichEditor = ({ value, onChange, error }: RichEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<SCEditorInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('Post.editor');
  const [isPreview, setIsPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [loaded, setLoaded] = useState({ sceditor: false, bbcode: false });
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const lastPushedValueRef = useRef(value);

  // Inject theme CSS manually since Head doesn't work in client components reliably
  useEffect(() => {
    const linkId = 'sceditor-theme-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/sceditor@3/minified/themes/default.min.css';
      document.head.appendChild(link);
    }
  }, []);

  // Kiểm tra xem script đã load từ lần trước chưa (khi navigate back/forward)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.sceditor) {
      console.log('[SCEditor] Detected already loaded');
      const bbcodeLoaded = !!window.sceditor?.formats?.bbcode;
      // Tránh setState đồng bộ bằng cách bọc vào setTimeout/microtask
      setTimeout(() => {
        setLoaded(prev => {
          if (prev.sceditor !== true || prev.bbcode !== bbcodeLoaded) {
            return { sceditor: true, bbcode: bbcodeLoaded };
          }
          return prev;
        });
      }, 0);
    }
  }, []);

  // Lưu giá trị mới nhất để set vào editor khi nó ready
  const pendingValueRef = useRef(value);
  
  useEffect(() => {
    pendingValueRef.current = value;
  }, [value]);

  const checkAndInit = React.useCallback(() => {
    if (!textareaRef.current) {
      console.log('[SCEditor] textareaRef chưa sẵn sàng');
      return false;
    }
    if (!window.sceditor) {
      console.log('[SCEditor] window.sceditor chưa load');
      return false;
    }
    if (editorRef.current) {
      console.log('[SCEditor] Editor đã tồn tại');
      return true;
    }

    try {
      if (!window.sceditor.formats || !window.sceditor.formats.bbcode) {
        console.log('[SCEditor] BBCode format chưa sẵn sàng');
        return false;
      }

      console.log('[SCEditor] Bắt đầu khởi tạo editor...');
      
      // Override emoticon command to use native Unicode emojis
      if (window.sceditor) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sc = window.sceditor as any;
        if (!sc._emoticonRegistered) {
          sc._emoticonRegistered = true;
          
          const emojis = [
            '🙂', '😊', '😀', '😄', '😆', '😉', '😍', '😘', '😜', '😂', 
            '😭', '😮', '😡', '👍', '👎', '❤️', '🎉', '🤔', '👏', '🔥', 
            '✨', '🚀', '💡', '💯', '🙏', '👀', '🌟', '💻', '🛠️', '✅'
          ];

          sc.command.set('emoticon', {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            exec: function (this: any, caller: any) {
              // eslint-disable-next-line @typescript-eslint/no-this-alias
              const editor = this;
              const content = document.createElement('div');
              content.style.display = 'grid';
              content.style.gridTemplateColumns = 'repeat(5, 1fr)';
              content.style.gap = '8px';
              content.style.padding = '8px';
              content.style.fontSize = '20px';

              emojis.forEach(emoji => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = emoji;
                btn.style.border = 'none';
                btn.style.background = 'none';
                btn.style.cursor = 'pointer';
                btn.style.padding = '4px';
                btn.style.borderRadius = '4px';
                btn.addEventListener('mouseover', () => {
                  btn.style.background = 'rgba(0,0,0,0.1)';
                });
                btn.addEventListener('mouseout', () => {
                  btn.style.background = 'none';
                });
                btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  editor.insert(emoji);
                  editor.closeDropDown(true);
                });
                content.appendChild(btn);
              });

              editor.createDropDown(caller, 'emoticon-picker', content);
            },
            tooltip: 'Chèn Emoji'
          });
        }
      }

      window.sceditor.create(textareaRef.current, {
        format: 'bbcode',
        style: 'https://cdn.jsdelivr.net/npm/sceditor@3/minified/themes/content/default.min.css',
        toolbar: 'bold,italic,underline,strike,subscript,superscript|left,center,right,justify|font,size,color,removeformat|bulletlist,orderedlist|table|code,quote|image,youtube,link,unlink|emoticon,horizontalrule|maximize,source',
        width: '100%',
        height: '400px',
        resizeWidth: false,
        emoticonsEnabled: false,
      });

      editorRef.current = window.sceditor.instance(textareaRef.current);

      if (editorRef.current) {
        console.log('[SCEditor] Khởi tạo thành công!');
        setIsReady(true);
        // Set giá trị mới nhất vào editor
        const latestValue = pendingValueRef.current;
        console.log('[SCEditor] Giá trị cần set:', latestValue?.substring(0, 50));
        if (latestValue) {
          editorRef.current.val(latestValue);
          lastPushedValueRef.current = latestValue;
        }

        const injectStyles = () => {
          try {
            const iframe = containerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
            if (iframe && iframe.contentDocument) {
              const doc = iframe.contentDocument;
              const isDark = document.documentElement.classList.contains('dark');
              
              // Handle paste sanitation to strip inline styles
              const body = doc.body;
              if (body && !body.getAttribute('data-paste-bound')) {
                body.setAttribute('data-paste-bound', 'true');
                doc.addEventListener('paste', (e: ClipboardEvent) => {
                  e.preventDefault();
                  e.stopPropagation(); // Stop event propagation in capture phase
                  const text = e.clipboardData?.getData('text/plain') || '';
                  const html = e.clipboardData?.getData('text/html');

                  if (html) {
                    // Sanitize pasted HTML: strip color, font-family, font-size inline styles
                    let cleanHtml = html;
                    cleanHtml = cleanHtml.replace(/color:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/font-family:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/font-size:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/line-height:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/font-weight:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/font-style:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/text-decoration:\s*[^;"]+[;]?/gi, '');
                    cleanHtml = cleanHtml.replace(/style="\s*;?\s*"/gi, '');

                    doc.execCommand('insertHTML', false, cleanHtml);
                  } else {
                    doc.execCommand('insertText', false, text);
                  }
                  
                  // Trigger change detection for SCEditor
                  if (editorRef.current) {
                    onChange(editorRef.current.val());
                  }
                }, true); // Use capture phase to intercept before SCEditor handles it
              }

              // Update custom styles inside iframe to match requested typography
              let style = doc.getElementById('sceditor-custom-img-style') as HTMLStyleElement | null;
              if (!style) {
                style = doc.createElement('style');
                style.id = 'sceditor-custom-img-style';
                doc.head.appendChild(style);
              }
              
              style.textContent = `
                body {
                  font-family: Geist, ui-sans-serif, system-ui, sans-serif !important;
                  font-size: 16px !important;
                  color: #1f2937 !important;
                  background-color: #ffffff !important;
                  padding: 1rem !important;
                }
                img {
                  max-width: min(900px, 100%) !important;
                  max-height: 500px !important;
                  object-fit: contain !important;
                  border-radius: 6px !important;
                  border: 1px solid rgba(0, 0, 0, 0.1) !important;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
                  display: inline-block !important;
                  margin: 8px auto !important;
                  height: auto !important;
                }
              `;
              console.log('[SCEditor] Injected custom font, size, color and image style overrides');
            }
          } catch (cssErr) {
            console.error('[SCEditor] Error injecting CSS:', cssErr);
          }
        };

        setTimeout(injectStyles, 100);
        setTimeout(injectStyles, 500);

        editorRef.current.bind('valuechange keyup blur', () => {
          if (editorRef.current) {
            const val = editorRef.current.val() || '';
            lastPushedValueRef.current = val;
            onChange(val);
          }
        });
        return true;
      } else {
        setInitError('Failed to create editor instance');
        return false;
      }
    } catch (err: unknown) {
      console.error('[SCEditor] Init error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setInitError(errorMessage);
      return false;
    }
  }, [onChange]);

  useEffect(() => {
    console.log('[SCEditor] Script load status:', loaded);
    if (loaded.sceditor && loaded.bbcode) {
      // Thử khởi tạo với retry
      let attempts = 0;
      const maxAttempts = 20; // 2 giây
      
      const tryInit = () => {
        const success = checkAndInit();
        if (!success && attempts < maxAttempts) {
          attempts++;
          console.log(`[SCEditor] Retry attempt ${attempts}`);
          setTimeout(tryInit, 100);
        }
      };
      
      const timeout = setTimeout(tryInit, 100);
      return () => clearTimeout(timeout);
    }
  }, [loaded, checkAndInit]);

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      const currentVal = editorRef.current.val();
      if (value !== lastPushedValueRef.current) {
        lastPushedValueRef.current = value;
        if (currentVal !== value) {
          editorRef.current.val(value);
        }
      }
    }
  }, [value, isPreview]);

  const insertSimilarBBCode = () => {
    if (editorRef.current) {
      editorRef.current.insert('[similar][/similar]');
    }
  };

  const togglePreview = () => {
    if (!isPreview) {
      if (editorRef.current) {
        setPreviewContent(editorRef.current.val());
        setIsPreview(true);
      }
    } else {
      setIsPreview(false);
    }
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/sceditor@3/minified/sceditor.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[SCEditor] Core script loaded');
          setLoaded(prev => ({ ...prev, sceditor: true }));
        }}
      />
      
      {loaded.sceditor && (
        <Script
          src="https://cdn.jsdelivr.net/npm/sceditor@3/minified/formats/bbcode.min.js"
          strategy="afterInteractive"
          onLoad={() => {
            console.log('[SCEditor] BBCode format loaded');
            setLoaded(prev => ({ ...prev, bbcode: true }));
          }}
        />
      )}
      
      <div ref={containerRef} className={`w-full flex flex-col space-y-2 ${error ? 'ring-1 ring-destructive rounded-md' : ''}`}>
        {initError && (
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
            Editor error: {initError}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            type="button"
            onClick={insertSimilarBBCode}
            className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 disabled:opacity-50"
            disabled={isPreview || !isReady}
          >
            {t('insertSimilar')}
          </button>
          
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleImageUpload'))}
              className="px-2 py-1 text-xs bg-muted text-foreground rounded hover:bg-muted/80 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              {t('uploadImage')}
            </button>
            <button
              type="button"
              onClick={togglePreview}
              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {isPreview ? t('edit') : t('preview')}
            </button>
          </div>
        </div>

        <div className={isPreview ? 'hidden' : 'block'}>
          <textarea 
            ref={textareaRef} 
            defaultValue={value}
            className="w-full"
            style={{ display: 'block', minHeight: '400px' }}
          />
        </div>

        {isPreview && (
          <div className="w-full min-h-[400px] p-6 border rounded-md bg-background shadow-inner">
            <ArticleBody content={previewContent} postId={0} />
          </div>
        )}
      </div>
    </>
  );
};
