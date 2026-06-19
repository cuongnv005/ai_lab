'use client';

import React, { useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 mb-6">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={inputPlaceholder}
          disabled={isSubmitting}
          maxLength={1000}
          className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none min-h-[100px] text-on-surface focus:outline-none placeholder:text-on-surface-variant/50"
        />
      </div>
      <div className="flex justify-between items-center dark:border-[#2d2d30]/50">
        <span className="text-[11px] text-on-surface-variant">
          {content.length}/1000
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="bg-primary text-white dark:bg-primary-container dark:text-on-primary-container px-3 py-1 rounded-md font-bold text-[11px] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>{t('sending')}</span>
              </>
            ) : (
              <span>{t('send')}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
