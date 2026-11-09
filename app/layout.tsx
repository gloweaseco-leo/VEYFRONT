import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_SC } from 'next/font/google'
import { LangProvider } from '@/lib/i18n'
import { headers } from 'next/headers'
import './globals.css'
import { releaseRobots } from '@/lib/seo-release'
import { brandKnowledgeGraph } from '@/lib/seo-schema'
import { AcquisitionCapture } from '@/components/veyfront/acquisition-capture'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
// Self-hosted CJK face so Chinese renders identically on every device, including headless review browsers without system CJK fonts.
const notoSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sc',
  display: 'swap',
  preload: false,
})

export const metadata: Metadata = {
  title: 'VEYFRONT — Building Digital Frontiers for Global Business',
  description:
    'VEYFRONT builds international B2B websites with SEO-Native foundations, buyer-ready product content, verified inquiries and optional ongoing improvements.',
  applicationName: 'VEYFRONT',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  metadataBase: new URL('https://veyfront.com'),
  robots: releaseRobots,
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#17262D',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialLang = (await headers()).get('x-vf-page-locale') === 'zh' ? 'zh' : 'en'
  return (
    <html
      lang={initialLang === "zh" ? "zh-CN" : "en"}
      className={`${geist.variable} ${geistMono.variable} ${notoSC.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <AcquisitionCapture />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandKnowledgeGraph).replace(/</g, '\\u003c') }}
        />
        <LangProvider initialLang={initialLang}>{children}</LangProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <SpeedInsights sampleRate={1} />
      </body>
    </html>
  )
}
