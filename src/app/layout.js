import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata = {
  title: '담가화로구이 소식지',
  description: '담가화로구이 가맹점 소식지',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-brand-cream text-brand-charcoal antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
