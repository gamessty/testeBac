import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'testeBac',
    short_name: 'testeBac',
    description: 'A simple test platform',
    start_url: '/app',
    display: 'standalone',
    background_color: '#242424',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo_square_safe_area.png',
        sizes: '500x500',
        type: 'image/png',
      },
    ]
  }
}