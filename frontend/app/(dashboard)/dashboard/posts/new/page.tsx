'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useCreatePost, useCategories } from '@/features/posts/hooks/use-posts';
import { Header } from '@/shared/components/layout/header';
import { Footer } from '@/shared/components/layout/footer';
import { PostForm } from '@/features/posts/components/post-form';
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner';
import { Card } from '@bks/ds-system-sdk/components/ui/card';
import { ImageUploadBlock } from '@/features/posts/components/image-upload-block';
import { useTranslations } from 'next-intl';

function NewPostFormContent({ categories, isSubmitting, handleSubmit, router }: any) {
  const searchParams = useSearchParams();
  const categoryIdParam = searchParams.get('category_id');
  const defaultCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;

  return (
    <PostForm
      categories={categories}
      defaultValues={defaultCategoryId ? { category_id: defaultCategoryId } : undefined}
      mode="create"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onCancel={() => router.push('/dashboard/posts')}
    />
  );
}

export default function NewPostPage() {
  const router = useRouter();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { createPost, isSubmitting } = useCreatePost();
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    const handler = () => setShowImageUpload(prev => !prev);
    window.addEventListener('toggleImageUpload', handler);
    return () => window.removeEventListener('toggleImageUpload', handler);
  }, []);

  const t = useTranslations("CreatePostPage");

  const handleSubmit = async (data: any, setError: any) => {
    try {
      const result = await createPost(data, setError);
      if (result) {
        router.push('/dashboard/posts');
      }
    } catch (error) {
      // Error is handled via form validation error mapping and standard toasts
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <Header />
      </Suspense>

      <main className={`flex-1 w-full mx-auto px-4 py-8 transition-all duration-300 ${showImageUpload ? 'max-w-6xl' : 'max-w-4xl'}`}>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors group mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t("backToList", { defaultValue: "Quay lại danh sách bài viết" })}
        </Link>

        {/* Page Header */}
        <div className="border-b border-border pb-5 mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <span className="p-1.5 bg-primary/10 text-primary rounded-lg">📝</span>
            {t("title", { defaultValue: "Viết bài mới" })}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {t("description", { defaultValue: "Đăng bài chia sẻ kiến thức mới lên diễn đàn." })}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Form Container */}
          <div className={showImageUpload ? "lg:col-span-8 transition-all" : "lg:col-span-12 transition-all"}>
            <Card className="p-6 md:p-8">
              {isCategoriesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner className="w-8 h-8" />
                  <span className="text-xs text-muted-foreground mt-2">{t("loadingCategories", { defaultValue: "Đang tải danh mục..." })}</span>
                </div>
              ) : (
                <Suspense fallback={
                  <div className="flex flex-col items-center justify-center py-12">
                    <Spinner className="w-8 h-8" />
                    <span className="text-xs text-muted-foreground mt-2">{t("initializingForm", { defaultValue: "Đang khởi tạo form..." })}</span>
                  </div>
                }>
                  <NewPostFormContent
                    categories={categories}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                    router={router}
                  />
                </Suspense>
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
