import AuthGuard from '@/components/AuthGuard'
import AdminHeader from '@/components/AdminHeader'

export const metadata = {
  title: '담가화로구이 소식지 관리',
}

export default function ProtectedAdminLayout({ children }) {
  return (
    <AuthGuard>
      <AdminHeader />
      <main className="min-h-screen bg-brand-cream">
        {children}
      </main>
    </AuthGuard>
  )
}
