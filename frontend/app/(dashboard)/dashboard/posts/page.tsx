'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle,
  Globe,
  Eye
} from 'lucide-react';

import { usePosts, useDeletePost, usePromotePost } from '@/features/posts/hooks/use-posts';
import { useAuth } from '@/features/auth';
import { Header } from '@/shared/components/layout/header';
import { Footer } from '@/shared/components/layout/footer';
import { Button } from '@bks/ds-system-sdk/components/ui/button';
import { Input } from '@bks/ds-system-sdk/components/ui/input';
import { Badge } from '@bks/ds-system-sdk/components/ui/badge';
import { Spinner } from '@bks/ds-system-sdk/components/ui/spinner';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@bks/ds-system-sdk/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@bks/ds-system-sdk/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@bks/ds-system-sdk/components/ui/tooltip';

export default function DashboardPostsPage() {
  const t = useTranslations('Post.dashboard');
  const tFields = useTranslations('Post.fields');
  const actionT = useTranslations('action');
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch posts filtered by current logged-in user and search
  const { posts, pagination, isLoading, refetch, isFetching } = usePosts({
    user_id: user?.id ? Number(user.id) : undefined,
    search: debouncedSearch,
    page: page,
    perPage: 10,
  });

  // Force reload on mount or when user changes
  useEffect(() => {
    refetch();
  }, [refetch, user?.id]);

  const isSearchLoading = search !== debouncedSearch || (isFetching && search.trim() !== '');
  const isTableLoading = isLoading && posts.length === 0 && !search;

  const { deletePost, isDeleting } = useDeletePost();
  const { promotePost, isPromoting } = usePromotePost();

  const handleDelete = async (id: number) => {
    try {
      await deletePost(id);
      refetch();
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const getStatusBadge = (status: number, rejectReason?: string | null) => {
    switch (status) {
      case 1: // Pending
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 hover:bg-yellow-500/20">
            {t('statusPending')}
          </Badge>
        );
      case 2: // Published
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20">
            {t('statusPublished')}
          </Badge>
        );
      case 3: // Rejected
        const badgeElement = (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 cursor-help flex items-center gap-1">
            {t('statusRejected')}
            <Eye className="w-3 h-3 text-rose-500" />
          </Badge>
        );

        if (rejectReason) {
          return (
            <div className="flex justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger render={badgeElement} />
                  <TooltipContent side="top">
                    <div className="text-xs p-1 max-w-[200px] text-left">
                      <span className="font-bold block mb-0.5">{t('rejectReason')}</span>
                      <span>{rejectReason}</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          );
        }

        return badgeElement;

      case 4: // Approved
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20">
            {t('statusApproved')}
          </Badge>
        );

      case 5: // Deleted
        return (
          <Badge className="bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 hover:bg-zinc-500/20">
            {t('statusDeleted')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('statusUnknown')}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Suspense fallback={<div className="h-16 border-b bg-background" />}>
        <Header />
      </Suspense>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 py-8">
        <div className="flex flex-col gap-6">
          {/* Page Title & Add New Button */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <span className="p-1.5 bg-primary/10 text-primary rounded-lg">📋</span>
                {t('myPosts')}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {t('managePosts')}
              </p>
            </div>

            <Button render={<Link href="/dashboard/posts/new" className="flex items-center gap-1.5 font-bold text-xs select-none" />} nativeButton={false}>
              <Plus className="w-4 h-4" />
              {t('newPost')}
            </Button>
          </div>

          {/* Search Filter Bar */}
          <div className="flex items-center relative max-w-md w-full">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
            {isSearchLoading && <Spinner className="absolute right-3 w-4 h-4" />}
          </div>

          {/* Posts Table */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            {isTableLoading ? (
              <div className="flex flex-col items-center justify-center p-12 h-64">
                <Spinner className="w-8 h-8" />
                <span className="text-xs text-muted-foreground mt-2">{t('loadingPosts')}</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-64 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t('noPosts')}</p>
                <Button render={<Link href="/dashboard/posts/new" />} variant="outline" size="sm" nativeButton={false}>
                  {t('firstPost')}
                </Button>
              </div>
            ) : (
              <div className="w-full relative">
                {isFetching && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                    <Spinner className="w-8 h-8" />
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold text-xs py-3">{t('colTitle')}</TableHead>
                      <TableHead className="font-semibold text-xs py-3 text-center w-28">{t('colComments')}</TableHead>
                      <TableHead className="font-semibold text-xs py-3 text-center w-28">{t('colLikes')}</TableHead>
                      <TableHead className="font-semibold text-xs py-3 text-center w-36">{t('colStatus')}</TableHead>
                      <TableHead className="font-semibold text-xs py-3 text-right w-32">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="py-3.5 max-w-sm truncate font-medium">
                            <Link 
                              href={`/posts/${post.id}`}
                              className="text-foreground hover:text-primary transition-colors hover:underline block truncate"
                            >
                              {post.title}
                            </Link>
                        </TableCell>
                        <TableCell className="py-3.5 text-center text-muted-foreground text-xs">
                          <span className="inline-flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {post.comments_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-center text-muted-foreground text-xs">
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            {post.likes_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 text-center">
                          {getStatusBadge(post.status, post.reject_reason)}
                        </TableCell>
                        <TableCell className="py-3.5 text-right">
                          <div className="flex justify-end gap-1.5">
                            {post.status === 2 && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={async () => {
                                  await promotePost(post.id);
                                  refetch();
                                }}
                                disabled={isPromoting}
                                title={t('promoteTitle')}
                              >
                                <Globe className="w-3.5 h-3.5 text-blue-500 hover:text-blue-600" />
                              </Button>
                            )}

                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => router.push(`/dashboard/posts/${post.id}/edit`)}
                              title={t('editTitle')}
                            >
                              <Edit className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    title={t('deleteTitle')}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-500 hover:text-rose-600" />
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('deleteConfirmDesc')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel variant="outline">{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                    onClick={() => handleDelete(post.id)}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? <Spinner className="w-3 h-3 mr-1" /> : null}
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t dark:border-zinc-800">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                  page <= 1
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
                }`}
              >
                {t('prev')}
              </button>

              {Array.from({ length: pagination.lastPage }).map((_, index) => {
                const p = index + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3498db] text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-950'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.lastPage))}
                disabled={page === pagination.lastPage}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed ${
                  page >= pagination.lastPage
                    ? 'opacity-50 pointer-events-none text-zinc-400 border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-700 hover:bg-gray-50 border-gray-200 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-950'
                }`}
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
