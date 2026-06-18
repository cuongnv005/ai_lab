'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { useTranslations } from 'next-intl';

interface CommentFormProps {
  onSubmit: (input: { content: string; parent_id?: number | null }) => Promise<void>;
  placeholder?: string;
  isSubmitting?: boolean;
}

export function CommentForm({ onSubmit, placeholder, isSubmitting: propIsSubmitting }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isSubmitting = propIsSubmitting !== undefined ? propIsSubmitting : localSubmitting;

  const t = useTranslations('PostDetail.comments');
  const inputPlaceholder = placeholder || t('placeholder');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setLocalSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={isSubmitting}
          maxLength={1000}
          className="w-full min-h-[100px] p-4 pb-8 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring resize-none transition-all"
        />
        <div className="absolute bottom-2.5 right-3 text-xs text-muted-foreground pointer-events-none">
          {content.length}/1000
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('sending')}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t('send')}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
