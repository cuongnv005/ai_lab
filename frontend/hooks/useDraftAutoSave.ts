import { useEffect, useRef, useState, useCallback } from 'react';
import { postRepository } from '@/features/posts/services/http-post.repository';
import { useTranslations } from 'next-intl';

interface DraftData {
  title: string;
  category_id: number | null;
  content: string;
  tags: string[];
}

interface UseDraftAutoSaveProps {
  formData: DraftData;
  isDirty: boolean;
  onRestoreDraft: (draft: DraftData) => void;
  postId?: number;
}

export function useDraftAutoSave({ formData, isDirty, onRestoreDraft, postId }: UseDraftAutoSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null);
  const prevCategoryIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const saveDraft = useCallback(async () => {
    if (!formData.category_id || !isDirty || !formData.title) return;
    
    setIsSaving(true);
    setHasError(false);
    try {
      await postRepository.autoSaveDraft({
        category_id: formData.category_id,
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        post_id: postId,
      });
      const now = new Date();
      setLastSaved(now);
    } catch {
      setHasError(true);
    } finally {
      setIsSaving(false);
    }
  }, [formData, isDirty, postId]);

  // Handle category change -> fetch existing draft
  useEffect(() => {
    if (formData.category_id && formData.category_id !== prevCategoryIdRef.current) {
      prevCategoryIdRef.current = formData.category_id;
      
      const fetchDraft = async () => {
        try {
          const res = await postRepository.getDraft(formData.category_id!, postId);
          if (res.data) {
            setPendingDraft({
              title: res.data.title || '',
              category_id: res.data.category_id,
              content: res.data.content || '',
              tags: res.data.tags || [],
            });
          }
        } catch {
          // Ignore 404 or errors when fetching draft
        }
      };
      
      fetchDraft();
    }
  }, [formData.category_id, postId]);

  const confirmRestore = useCallback(() => {
    if (pendingDraft) {
      onRestoreDraft(pendingDraft);
      setPendingDraft(null);
    }
  }, [pendingDraft, onRestoreDraft]);

  const cancelRestore = useCallback(async () => {
    if (formData.category_id) {
      try {
        await postRepository.deleteDraft(formData.category_id, postId);
      } catch {
        // Ignore error
      }
    }
    setPendingDraft(null);
  }, [formData.category_id, postId]);

  // Handle 30s auto-save interval
  useEffect(() => {
    timerRef.current = setInterval(() => {
      saveDraft();
    }, 30000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [saveDraft]);

  return { isSaving, lastSaved, hasError, pendingDraft, confirmRestore, cancelRestore };
}

