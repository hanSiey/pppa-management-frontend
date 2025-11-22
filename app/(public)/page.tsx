'use client'

import { motion } from 'framer-motion'
import { CalendarIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-luxury overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif font-bold text-charcoal-900 mb-6"
          >
            The Parliament of<br />
            <span className="text-gradient">Plating & Pouring Affairs</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-charcoal-700 mb-8 leading-relaxed"
          >
            Extraordinary culinary experiences merging South African heritage 
            with world-class gastronomy
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="btn-primary text-lg px-8 py-4">
              Explore Events
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Learn More
            </button>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif font-bold text-charcoal-900 mb-4">
            Curated Culinary Excellence
          </h2>
          <p className="text-xl text-charcoal-600 max-w-2xl mx-auto">
            A distinguished collective born from the collaboration of three premier 
            food services brands: Prestige Palate, Da Wine konnect, and Chef Neo's Kitchen.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card p-8 text-center"
            >
              <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-serif font-semibold text-charcoal-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-charcoal-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-charcoal-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-serif font-bold mb-6"
          >
            Ready for an Unforgettable Experience?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-charcoal-300 mb-8"
          >
            Join food enthusiasts, industry leaders, and tastemakers who appreciate 
            luxury, culture, and innovation.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="btn-primary text-lg px-8 py-4"
          >
            View Upcoming Events
          </motion.button>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: SparklesIcon,
    title: "Immersive Dining",
    description: "Curated experiences that transport you through South African heritage with world-class gastronomy."
  },
  {
    icon: UserGroupIcon,
    title: "Exclusive Community",
    description: "Connect with food enthusiasts, industry leaders, and tastemakers in intimate settings."
  },
  {
    icon: CalendarIcon,
    title: "Seamless Reservations",
    description: "Easy booking process with calendar integration and personalized service for every guest."
  }
]