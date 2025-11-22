import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import '../globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  // FIX: Add your production domain here to remove the localhost warning
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || ''), 
  
  title: 'The Parliament of Plating & Pouring Affairs',
  description: 'Extraordinary culinary experiences merging South African heritage with world-class gastronomy',
  keywords: 'culinary experiences, South African cuisine, fine dining, events, reservations',
  authors: [{ name: 'The Parliament of Plating & Pouring Affairs' }],
  openGraph: {
    title: 'The Parliament of Plating & Pouring Affairs',
    description: 'Extraordinary culinary experiences merging South African heritage with world-class gastronomy',
    type: 'website',
    locale: 'en_ZA',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-cream text-charcoal-900 antialiased">
        <AuthProvider>
          <Navigation />
          <main className="pt-16 min-h-screen"> {/* Account for fixed navigation */}
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-charcoal-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold mb-4">PPPA</h3>
                  <p className="text-charcoal-300">
                    Extraordinary culinary experiences merging South African heritage with world-class gastronomy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-charcoal-300">
                    <li><a href="/events" className="hover:text-white transition-colors">Events</a></li>
                    <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                    <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Brands</h4>
                  <ul className="space-y-2 text-charcoal-300">
                    <li>Prestige Palate</li>
                    <li>Da Wine konnect</li>
                    <li>Chef Neo's Kitchen</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <address className="not-italic text-charcoal-300 space-y-2">
                    <p>hello@parliamentplating.com</p>
                    <p>+27 21 123 4567</p>
                    <p>Johannesburg, South Africa</p>
                  </address>
                </div>
              </div>
              <div className="border-t border-charcoal-800 mt-8 pt-8 text-center text-charcoal-400">
                <p>&copy; {new Date().getFullYear()} The Parliament of Plating & Pouring Affairs. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}