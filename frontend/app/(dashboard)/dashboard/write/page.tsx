import { redirect } from 'next/navigation';

export default async function WriteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ category_id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const categoryId = resolvedParams.category_id;
  if (categoryId) {
    redirect(`/dashboard/posts/new?category_id=${categoryId}`);
  }
  redirect('/dashboard/posts/new');
}
