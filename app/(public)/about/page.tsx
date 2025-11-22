'use client'

import { motion } from 'framer-motion'
import { SparklesIcon, HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  const brands = [
    {
      name: 'Prestige Palate',
      description: 'Renowned for exquisite dining experiences and culinary innovation that pushes boundaries while honoring tradition.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Da Wine konnect',
      description: 'Masters of viniculture, curating exceptional wine pairings and immersive tasting experiences.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: "Chef Neo's Kitchen",
      description: 'Where South African heritage meets contemporary gastronomy, creating unforgettable flavor journeys.',
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const values = [
    {
      icon: SparklesIcon,
      title: 'Culinary Excellence',
      description: 'We believe every dish tells a story and every meal should be an unforgettable experience.'
    },
    {
      icon: HeartIcon,
      title: 'Cultural Heritage',
      description: 'Proudly South African, we celebrate our rich culinary traditions while embracing global influences.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Sustainable Luxury',
      description: 'Committed to ethical sourcing, environmental responsibility, and supporting local communities.'
    }
  ]

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-serif font-bold mb-6"
          >
            About The Parliament
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-charcoal-200 max-w-3xl mx-auto leading-relaxed"
          >
            A distinguished collective born from the collaboration of three premier food services brands, 
            creating extraordinary culinary experiences that merge South African heritage with world-class gastronomy.
          </motion.p>
        </div>
      </section>

      {/* Founding Brands */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-charcoal-900 mb-4">
              Our Founding Brands
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              Three distinct voices, one unified vision for exceptional culinary experiences.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="card p-8 text-center"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">
                  {brand.name}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {brand.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-charcoal-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-serif font-bold text-charcoal-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
              The principles that guide every experience we create.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-8"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-charcoal-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-charcoal-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-6 text-xl text-charcoal-600 leading-relaxed">
              <p>
                In the heart of Victoria Falls, where the wild roar of water meets the warm
                African sun, four friends from Gauteng, South Africa. Bound by their shared
                passions—cooking, hospitality, and fine wine—they envisioned something unique:
                to blend authentic South African flavours with premium wines, crafting meals that
                tell raw African stories.

              </p>
              <p>
                Each bring their expertise to the table: three chefs known for reviving
                traditional recipes, and innovative culinary artist blending global influences.
                Alongside them, a wine entrepreneur bringing a collection of exclusive, carefully 
                selected wines that celebrate the continent’s rich terroir.
                Together, they founded a venture that merges their talents, offering extraordinary meals
                where every dish is paired perfectly with a fine wine—a celebration of culture, friendship, 
                and the finest tastes Africa has to offer.
              </p>
              <p>
              From the bustling streets of Joburg to the majestic landscape of Vic Falls, their journey 
              creates a dining experience that’s more than a meal, it’s a story of connection, heritage, 
              and unforgettable flavours.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="card p-12 bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          >
            <h2 className="text-4xl font-serif font-bold mb-6">
              Ready to Experience The Parliament?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join us for an unforgettable culinary journey that celebrates South African heritage 
              through world-class gastronomy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/events" className="btn-secondary bg-white text-charcoal-900 hover:bg-charcoal-50">
                View Events
              </a>
              <a href="/contact" className="border-2 border-white text-white hover:bg-white hover:text-charcoal-900 font-medium py-3 px-6 rounded-lg transition-all duration-200">
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}