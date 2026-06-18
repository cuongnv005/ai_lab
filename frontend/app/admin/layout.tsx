import { AdminLayoutClient } from '@/features/admin/components/admin-layout-client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
