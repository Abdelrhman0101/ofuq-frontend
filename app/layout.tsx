import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/course-details.css'

export const metadata: Metadata = {
  title: 'معهد الأفق التعليمي',
  description: 'منصة تعليمية متقدمة',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}