import type { Metadata } from 'next'
import '@/styles/globals.css'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'معهد الأفق التعليمي',
  description: 'منصة تعليمية متقدمة',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50">
        {/* Header */}
        <Header />
        
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="  min-h-screen transition-all duration-300" style={{marginRight: '280px'}}>
          <div className="p-4 md:p-6 w-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}