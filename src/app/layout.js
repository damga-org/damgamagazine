import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: '담가화로구이 소식지',
  description: '담가화로구이 가맹점 소식지',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="bg-[#FAF8F5] text-[#2D2926]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
