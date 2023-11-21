import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== 'undefined') return path
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}${path}`
  }

  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

interface MetadataType {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
}

export function createMetadata({
  title = 'FileSage',
  description = 'Filesage is an open source software to make chatting to your pdf files easy.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false
}: MetadataType = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    icons,
    metadataBase: new URL('https://file-sage.vercel.app'),
    themeColor: '#FFF',
    ...(noIndex && {
      index: false,
      follow: false
    })
  }
}