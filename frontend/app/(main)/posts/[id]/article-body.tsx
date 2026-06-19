'use client';

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { renderBBCode } from '@/shared/lib/bbcode';

interface ArticleBodyProps {
  content: string;
  postId?: number;
}

// BBCode parser
const parseBBCode = (content: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regexes
  const codeRegex = /\[code\]([\s\S]*?)\[\/code\]/g;

  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push(parseInlineContent(content.slice(lastIndex, match.index), `before-${match.index}`));
    }

    // Code block
    const code = match[1];
    parts.push(
      <CodeBlock key={`code-${match.index}`} code={code} />
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < content.length) {
    parts.push(parseInlineContent(content.slice(lastIndex), 'remaining'));
  }

  return parts.length > 0 ? parts : [parseInlineContent(content, 'all')];
};

const parseInlineContent = (text: string, key: string): React.ReactNode => {
  return <React.Fragment key={key}>{renderBBCode(text)}</React.Fragment>;
};

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("PostDetail.articleBody");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t('copySuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('copyError'));
    }
  }, [code, t]);

  return (
    <div className="relative my-6 rounded-xl overflow-hidden glass-card">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container-low/40 border-b border-outline-variant/20">
        <span className="text-xs text-muted-foreground">Code</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              {t('copy')}
            </>
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language="typescript"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          background: 'transparent',
          fontSize: '0.875rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export function ArticleBody({ content }: ArticleBodyProps) {
  const parsedContent = parseBBCode(content);

  return (
    <div className="article-content font-body-lg text-body-lg max-w-none mt-8 text-left">
      {parsedContent}
    </div>
  );
}
