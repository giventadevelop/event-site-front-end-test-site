import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Philantrop - Charity & Nonprofit Organization',
  description: 'The long journey to end poverty begins with a child. Join our mission to help people in need around the world.',
  keywords: 'charity, nonprofit, donation, philanthropy, help, volunteer, fundraising',
  openGraph: {
    title: 'Philantrop - Charity & Nonprofit Organization',
    description: 'The long journey to end poverty begins with a child. Join our mission to help people in need around the world.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Philantrop - Charity & Nonprofit Organization',
    description: 'The long journey to end poverty begins with a child. Join our mission to help people in need around the world.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function PhilantropLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Epilogue:wght@100;200;300;400;500;600;700;800;900&family=Sora:wght@100;200;300;400;500;600;700;800;900&family=Meow+Script:wght@400&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      {children}
    </>
  )
}