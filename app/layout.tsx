import type { Metadata } from 'next'
import '@/styles/globals.css'
import '@/styles/course-details.css'
import '@/styles/home-header.css'
import '@/styles/course-cards.css'
import '@/styles/hero-search-section.css'
import 'react-phone-number-input/style.css'

export const metadata: Metadata = {
  title: 'منصة أفق للتعليم عن بعد',
  description:
    'أفق مؤسسة تعليمية رائدة متخصصة في بناء وتقديم برامج دبلوم احترافية في مجالات متنوعة تجمع بين الأصالة والمعاصرة.',
  icons: {
    icon: [{ url: '/logo.svg', type: 'image/svg+xml' }],
  },
};

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