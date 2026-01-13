import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://showcase.bandcoin.io"),
  title: {
    default: "BandCoin ShowCase - Professional Digital Services for Musicians",
    template: "%s | BandCoin ShowCase",
  },
  description:
    "Professional digital services for musicians including tools for music production, image generation, EPK creation, venue booking, and custom website design. Amplify your music career with BandCoin ShowCase.",
  keywords: [
    "music production tools",
    "AI music creation",
    "EPK creator",
    "musician website builder",
    "gig finder",
    "venue booking",
    "music marketing",
    "beat maker",
    "AI image generation for musicians",
    "publishing assistant",
    "music promotion tools",
  ],
  authors: [{ name: "BandCoin" }],
  creator: "BandCoin",
  publisher: "BandCoin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/images/bandcoin-logo.png",
    shortcut: "/images/bandcoin-logo.png",
    apple: "/images/bandcoin-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://showcase.bandcoin.io",
    title: "BandCoin ShowCase - Professional Digital Services for Musicians",
    description:
      "Complete platform for music production, visual creation, and professional web experiences. Professional tools for modern musicians.",
    siteName: "BandCoin ShowCase",
    images: [
      {
        url: "/images/bandcoin-logo.png",
        width: 1200,
        height: 630,
        alt: "BandCoin ShowCase Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BandCoin ShowCase - Professional Digital Services for Musicians",
    description: "Complete platform for music production, visual creation, and professional web experiences.",
    images: ["/images/bandcoin-logo.png"],
    creator: "@bandcoin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code-here",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BandCoin ShowCase",
              url: "https://showcase.bandcoin.io",
              logo: "https://showcase.bandcoin.io/images/bandcoin-logo.png",
              description: "Professional digital services platform for musicians",
              sameAs: [
                "https://twitter.com/bandcoin",
                "https://facebook.com/bandcoin",
                "https://instagram.com/bandcoin",
              ],
              offers: {
                "@type": "AggregateOffer",
                offerCount: 8,
                itemOffered: [
                  {
                    "@type": "Service",
                    name: "Beat Builder",
                    description: "Drum Pattern Creator for musicians (uses AI)",
                  },
                  {
                    "@type": "Service",
                    name: "VibePortal",
                    description: "Image Generation Suite for album art and promotional materials (uses AI)",
                  },
                  {
                    "@type": "Service",
                    name: "Site Builder",
                    description: "Custom Website Design & Hosting for musicians",
                  },
                  {
                    "@type": "Service",
                    name: "PubAssist",
                    description: "Music Publishing Registration Assistant for ASCAP and BMI",
                  },
                  {
                    "@type": "Service",
                    name: "Gig Finder",
                    description: "Venue Discovery and booking contact finder (uses AI)",
                  },
                ],
              },
            }),
          }}
        />
      </head>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
