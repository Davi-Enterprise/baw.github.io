import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Black Amethyst Wrestling | Where Raw Energy Meets Destiny',
  description: 'Black Amethyst Wrestling (BAW) — Independent Professional Wrestling. Elite Athletes. Unforgettable Moments. Premium live events, cinematic storytelling, and world-class competition.',
  keywords: 'wrestling, professional wrestling, BAW, Black Amethyst Wrestling, live events, tickets, roster, sports entertainment',
  openGraph: {
    title: 'Black Amethyst Wrestling',
    description: 'Where Raw Energy Meets Destiny. Elite independent professional wrestling.',
    type: 'website',
    siteName: 'Black Amethyst Wrestling',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Black Amethyst Wrestling',
    description: 'Where Raw Energy Meets Destiny.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
