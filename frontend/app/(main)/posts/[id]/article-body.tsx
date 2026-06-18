'use client';

import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { toast } from 'sonner';
import { SimilarPosts } from './similar-posts';
import { useTranslations } from 'next-intl';

import { renderBBCode } from '@/shared/lib/bbcode';

interface ArticleBodyProps {
  content: string;
  postId: number;
}

// BBCode parser
const parseBBCode = (content: string, postId: number): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // Regexes
  const codeRegex = /\[code\]([\s\S]*?)\[\/code\]/g;
  const similarRegex = /\[similar\]([\s\S]*?)\[\/similar\]/g;

  const parseWithSimilar = (text: string, baseKey: string) => {
    const subParts: React.ReactNode[] = [];
    let subLastIndex = 0;
    let subMatch;
    let partIdx = 0;
    
    while ((subMatch = similarRegex.exec(text)) !== null) {
      if (subMatch.index > subLastIndex) {
        subParts.push(parseInlineContent(text.slice(subLastIndex, subMatch.index), `${baseKey}-inline-${partIdx++}`));
      }
      
      const tagQuery = subMatch[1]?.trim() || undefined;
      subParts.push(
        <SimilarPosts 
          key={`${baseKey}-similar-${subMatch.index}-${postId}`} 
          postId={postId} 
          tagQuery={tagQuery} 
        />
      );
      subLastIndex = subMatch.index + subMatch[0].length;
    }
    
    if (subLastIndex < text.length) {
      subParts.push(parseInlineContent(text.slice(subLastIndex), `${baseKey}-inline-${partIdx++}`));
    }
    
    return subParts;
  };

  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    // Text before code block
    if (match.index > lastIndex) {
      parts.push(...parseWithSimilar(content.slice(lastIndex, match.index), `before-${match.index}`));
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
    parts.push(...parseWithSimilar(content.slice(lastIndex), 'remaining'));
  }

  return parts.length > 0 ? parts : parseWithSimilar(content, 'all');
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
    <div className="relative my-6 rounded-xl overflow-hidden bg-card border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b border-border">
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

export function ArticleBody({ content, postId }: ArticleBodyProps) {
  const parsedContent = parseBBCode(content, postId);

  return (
    <div className="prose prose-invert prose-slate max-w-none mt-8">
      <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4">
        {parsedContent}
      </div>
    </div>
  );
}
