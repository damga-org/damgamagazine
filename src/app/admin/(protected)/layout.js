import AuthGuard from '@/components/AuthGuard'

export const metadata = {
  title: '담가화로구이 소식지 관리',
}

export default function ProtectedAdminLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}
