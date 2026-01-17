import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://eplur.vercel.app', // Replace with your actual domain
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // Add more static URLs if any
  ]
}