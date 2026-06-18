import React, { useState } from 'react';
import { useForm, Controller, type UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { Input } from '@bks/ds-system-sdk/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@bks/ds-system-sdk/components/ui/select';
import { Field, FieldLabel, FieldContent, FieldError } from '@bks/ds-system-sdk/components/ui/field';
import { TagsInput } from '@/shared/components/ui/tags-input';
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner';
import { usePostSchemas, type CreatePostInput } from '../schemas/post.schema';
import { useDraftAutoSave } from '@/hooks/useDraftAutoSave';
import type { Category } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bks/ds-system-sdk/components/ui/alert-dialog';

// Dynamically import RichEditor to avoid SSR issues with sceditor (uses window)
const RichEditor = dynamic(() => import('@/shared/components/ui/rich-editor').then(mod => mod.RichEditor), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-md" />
});

interface PostFormProps {
  categories: Category[];
  defaultValues?: Partial<CreatePostInput>;
  mode: 'create' | 'edit';
  isSubmitting: boolean;
  onSubmit: (data: CreatePostInput, setError: UseFormSetError<CreatePostInput>) => Promise<void>;
  onCancel?: () => void;
  postId?: number;
}

export const PostForm = ({ categories, defaultValues, mode, isSubmitting, onSubmit, onCancel, postId }: PostFormProps) => {
  const t = useTranslations('Post.fields');
  const actionT = useTranslations('action');
  const draftT = useTranslations('Post.draft');
  const { schema } = usePostSchemas();
  
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      category_id: defaultValues?.category_id || undefined,
      content: defaultValues?.content || '',
      tags: defaultValues?.tags || [],
    },
  });

  const { handleSubmit, setError, control, register, formState: { errors, isDirty, dirtyFields }, reset, watch } = form;

  // Reset form khi defaultValues thay đổi (khi post và categories đã load xong)
  const isInitializedRef = React.useRef(false);

  React.useEffect(() => {
    isInitializedRef.current = false;
  }, [postId]);

  React.useEffect(() => {
    if (defaultValues && !isInitializedRef.current) {
      reset({
        title: defaultValues.title || '',
        category_id: defaultValues.category_id,
        content: defaultValues.content || '',
        tags: defaultValues.tags || [],
      });
      isInitializedRef.current = true;
    }
  }, [defaultValues, reset]);

  const currentValues = watch();

  const { isSaving, lastSaved, hasError, pendingDraft, confirmRestore, cancelRestore } = useDraftAutoSave({
    formData: {
      title: currentValues.title || '',
      category_id: currentValues.category_id || null,
      content: currentValues.content || '',
      tags: currentValues.tags || [],
    },
    isDirty: isDirty && (!!dirtyFields.title || !!dirtyFields.content || !!dirtyFields.tags || !!dirtyFields.category_id),
    onRestoreDraft: (draft) => {
      // Lazy init state so we don't trigger form validations immediately
      reset({
        ...currentValues,
        title: draft.title,
        category_id: draft.category_id || currentValues.category_id,
        content: draft.content,
        tags: draft.tags,
      });
    },
    postId,
  });

  const onValid = (data: CreatePostInput) => onSubmit(data, setError);

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-6">
      <Field className="gap-1">
        <FieldLabel htmlFor="title" required>{t('title')}</FieldLabel>
        <FieldContent>
          <Input 
            id="title" 
            {...register('title')} 
            aria-invalid={!!errors.title} 
            placeholder={t('titlePlaceholder')} 
          />
        </FieldContent>
        {errors.title && <FieldError>{errors.title.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <FieldLabel htmlFor="category_id" required>{t('category')}</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="category_id"
            render={({ field }) => (
              <Select
                value={field.value?.toString() || ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <SelectTrigger id="category_id" aria-invalid={!!errors.category_id}>
                  <SelectValue placeholder={t('categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldContent>
        {errors.category_id && <FieldError>{errors.category_id.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <FieldLabel htmlFor="tags">{t('tags')}</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagsInput
                value={field.value}
                onChange={field.onChange}
                error={!!errors.tags}
                maxLength={20}
              />
            )}
          />
        </FieldContent>
        {errors.tags && <FieldError>{errors.tags.message}</FieldError>}
      </Field>

      <Field className="gap-1">
        <div className="flex justify-between items-center">
          <FieldLabel htmlFor="content" required>{t('content')}</FieldLabel>
          {(lastSaved || isSaving || hasError) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {isSaving ? (
                <>
                  <Spinner className="w-3 h-3" /> {t('savingDraft')}
                </>
              ) : hasError ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-destructive font-medium">{draftT('autoSaveFailed')}</span>
                </>
              ) : lastSaved ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t('lastSaved', { time: lastSaved.toLocaleTimeString() })}</span>
                </>
              ) : null}
            </span>
          )}
        </div>
        <FieldContent>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <RichEditor
                value={field.value}
                onChange={field.onChange}
                error={!!errors.content}
              />
            )}
          />
        </FieldContent>
        {errors.content && <FieldError>{errors.content.message}</FieldError>}
      </Field>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {actionT('cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              {actionT('saving')}
            </>
          ) : mode === 'edit' ? (
            actionT('update')
          ) : (
            actionT('publish')
          )}
        </Button>
      </div>

      <AlertDialog open={!!pendingDraft} onOpenChange={(open) => !open && cancelRestore()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{draftT('restoreTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {draftT('restorePrompt')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRestore}>
              {actionT('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              {draftT('restore')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
