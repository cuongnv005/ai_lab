'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useUpdatePost, useCategories } from '@/features/posts/hooks/use-posts';
import { usePostDetail } from '@/features/posts/hooks/use-post-detail';
import { Header } from '@/shared/components/layout/header';
import { Footer } from '@/shared/components/layout/footer';
import { PostForm } from '@/features/posts/components/post-form';
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner';
import { Card } from '@bks/ds-system-sdk/components/ui/card';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { ImageUploadBlock } from '@/features/posts/components/image-upload-block';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { post, isLoading: isPostLoading } = usePostDetail(id);
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { updatePost, isSubmitting } = useUpdatePost();
  const [showImageUpload, setShowImageUpload] = useState(false);
  const t = useTranslations("EditPostPage");

  useEffect(() => {
    const handler = () => setShowImageUpload(prev => !prev);
    window.addEventListener('toggleImageUpload', handler);
    return () => window.removeEventListener('toggleImageUpload', handler);
  }, []);

  const handleSubmit = async (data: any, setError: any) => {
    try {
      const result = await updatePost(id, data, setError);
      if (result) {
        router.push(`/posts/${id}`);
      }
    } catch (error: any) {
      // Hiển thị lỗi cho người dùng
      const status = error?.response?.status;
      const message = error?.response?.data?.message || error?.message;
      
      if (status === 401) {
        toast.error(t('errLogin'));
      } else if (status === 403) {
        toast.error(t('errPermission'));
      } else if (!message?.includes('validation')) {
        toast.error(message || t('errUpdate'));
      }
    }
  };

  const isLoading = isPostLoading || isCategoriesLoading;

  const defaultValues = post ? {
    title: post.title,
    category_id: post.category?.id ?? categories[0]?.id ?? 1,
    content: post.content,
    tags: (post.tags || []).map((t: any) => t.name),
  } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <Header />
      </Suspense>

      <main className={`flex-1 w-full mx-auto px-4 py-8 transition-all duration-300 ${showImageUpload ? 'max-w-6xl' : 'max-w-4xl'}`}>
        {/* Back Link */}
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('backToList')}
        </Link>

        {/* Page Header */}
        <div className="border-b border-border pb-5 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">✏️</span>
            {t('title')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Form Container */}
          <div className={showImageUpload ? "lg:col-span-8 transition-all" : "lg:col-span-12 transition-all"}>
            <Card className="p-6 md:p-8">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="w-8 h-8" />
                  <span className="text-xs text-muted-foreground mt-2">{t('loadingPost')}</span>
                </div>
              ) : !post ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="text-sm font-semibold text-rose-500">{t('notFound')}</span>
                  <Button render={<Link href="/dashboard/posts" />} variant="outline" className="mt-4" nativeButton={false}>
                    {t('backListButton')}
                  </Button>
                </div>
              ) : (
                <PostForm
                  categories={categories}
                  defaultValues={defaultValues}
                  mode="edit"
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  onCancel={() => router.push('/dashboard/posts')}
                  postId={id}
                />
              )}
            </Card>
          </div>

          {/* Right Sidebar (Sticky) */}
          {showImageUpload && (
            <div className="lg:col-span-4 sticky top-24 animate-in fade-in slide-in-from-right-4 duration-300">
              <ImageUploadBlock />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
