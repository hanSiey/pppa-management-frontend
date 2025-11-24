'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  StarIcon,
  ArrowLongLeftIcon,
  CheckCircleIcon,
  MinusIcon,
  PlusIcon,
  BanknotesIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import api from '@/lib/api'

// --- Interfaces ---
interface Event {
  id: number
  title: string
  slug: string
  description: string
  location: string
  address: string
  start_datetime: string
  end_datetime: string
  capacity: number
  ticket_types: TicketType[]
  sub_events: SubEvent[]
}

interface TicketType {
  id: number
  name: string
  price: string
  reservation_fee: string
  quantity_available: number
}

interface SubEvent {
  id: number
  title: string
  start_datetime: string
  end_datetime: string
  capacity: number
}

interface ReservationForm {
  ticket_type_id: number
  quantity: number
  guest_email: string
  full_name: string
  phone_number: string
}

interface UserProfile {
    id: number;
    email: string;
    full_name: string;
    phone_number: string;
}

interface BankingDetail {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    branch_code: string;
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [bankingDetails, setBankingDetails] = useState<BankingDetail[]>([])
  
  const [reservationForm, setReservationForm] = useState<ReservationForm>({
    ticket_type_id: 0,
    quantity: 1,
    guest_email: '',
    full_name: '',
    phone_number: ''
  })
  
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.slug) {
      fetchEvent()
    }
    // Note: We do NOT fetch currentUser here to avoid 401 redirects for guests.
    // Auth is checked only when "Proceed to Payment" is clicked.
    fetchBankingDetails()
  }, [params.slug])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/events/${params.slug}/`)
      setEvent(response.data)
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBankingDetails = async () => {
      try {
          const response = await api.get('/payments/banking-details/');
          setBankingDetails(response.data.results || response.data);
      } catch (error) {
          console.error('Error fetching banking details:', error);
      }
  }

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reservationForm.ticket_type_id === 0) {
        alert("Please select a ticket type before booking.")
        return
    }

    setSubmitting(true)
    try {
      const payload = {
        ticket_type: reservationForm.ticket_type_id,
        quantity: reservationForm.quantity,
        guest_email: reservationForm.guest_email,
      };

      const response = await api.post('/reservations/reservations/', payload)
      
      // Redirect to the reservation status/payment page
      window.location.href = `/reservations/${response.data.reference_code}`
    } catch (error: any) {
      console.error('Error creating reservation:', error.response?.data || error)
      let msg = 'Failed to create reservation. Please check your details.';
      if (error.response?.data) {
          if (typeof error.response.data === 'string') { msg = error.response.data; }
          else if (error.response.data.detail) { msg = error.response.data.detail; }
          else { msg = Object.entries(error.response.data).map(([key, value]) => `${key}: ${value}`).join('\n'); }
      }
      alert(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedTicket) return;

    try {
        // We attempt to fetch the user profile here.
        // If this fails (401), we assume they are a guest and redirect.
        const response = await api.get('/auth/me/');
        const user = response.data;
        
        setCurrentUser(user);
        
        // Pre-fill form with authenticated user data
        setReservationForm(prev => ({
            ...prev,
            guest_email: user.email || '',
            full_name: user.full_name || '',
            phone_number: user.phone_number || ''
        }));
        
        // Open the modal
        setShowReservationForm(true);

    } catch (error) {
        // User is not authenticated -> Redirect to login
        // We pass the current URL as a redirect param so they can come back
        const currentPath = window.location.pathname;
        router.push(`/login?redirect=${currentPath}`);
    }
  }

  const formatCurrency = (amount: string) => {
    return `R ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      full: date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const updateQuantity = (delta: number) => {
    if (!selectedTicket) return
    setReservationForm(prev => {
      const newQty = prev.quantity + delta
      if (newQty >= 1 && newQty <= Math.min(10, selectedTicket.quantity_available)) {
        return { ...prev, quantity: newQty }
      }
      return prev
    })
  }

  if (loading) return <EventDetailSkeleton />
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>

  const eventDate = getEventDate(event.start_datetime)
  const activeBank = bankingDetails.length > 0 ? bankingDetails[0] : null;

  return (
    <div className="min-h-screen bg-charcoal-50 font-sans selection:bg-primary-200">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-charcoal-900 text-white pb-24 pt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500 blur-3xl"></div>
            <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-blue-500 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
            <a href="/events" className="inline-flex items-center text-charcoal-300 hover:text-white transition-colors mb-8 group">
                <ArrowLongLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"/>
                Back to Events
            </a>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl"
                >
                    <div className="flex items-center space-x-2 mb-4 text-primary-400 font-medium tracking-wide uppercase text-xs">
                         <StarIconSolid className="w-4 h-4" />
                         <span>Exclusive Experience</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-white mb-4">
                        {event.title}
                    </h1>
                    <div className="flex flex-wrap items-center text-charcoal-200 gap-4 md:gap-8 text-sm md:text-base">
                        <div className="flex items-center">
                            <CalendarIcon className="w-5 h-5 mr-2 text-primary-500"/>
                            {eventDate.full}
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="w-5 h-5 mr-2 text-primary-500"/>
                            {event.location}
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden md:block bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center min-w-[120px]"
                >
                    <span className="block text-sm uppercase tracking-wider text-charcoal-300">{eventDate.month}</span>
                    <span className="block text-4xl font-bold text-white font-serif">{eventDate.day}</span>
                    <span className="block text-xs text-primary-400 mt-1">{eventDate.time}</span>
                </motion.div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* --- LEFT CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100"
            >
                <h2 className="text-2xl font-serif font-bold text-charcoal-900 mb-6 flex items-center">
                    <StarIcon className="w-6 h-6 mr-2 text-primary-500" />
                    About the Event
                </h2>
                <div className="prose prose-charcoal prose-lg max-w-none text-charcoal-600 leading-relaxed whitespace-pre-line">
                    {event.description}
                </div>
                <div className="mt-8 pt-8 border-t border-charcoal-100 grid sm:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-bold text-charcoal-900 mb-2 text-sm uppercase tracking-wide">Venue Address</h4>
                        <p className="text-charcoal-600">{event.address}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-charcoal-900 mb-2 text-sm uppercase tracking-wide">Capacity</h4>
                        <p className="text-charcoal-600">{event.capacity} Guests (Limited Availability)</p>
                    </div>
                </div>
            </motion.div>

            {event.sub_events && event.sub_events.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-charcoal-100"
                >
                    <h2 className="text-2xl font-serif font-bold text-charcoal-900 mb-6 flex items-center">
                        <ClockIcon className="w-6 h-6 mr-2 text-primary-500" />
                        Event Schedule
                    </h2>
                    <div className="space-y-0">
                        {event.sub_events.map((sub) => (
                            <div key={sub.id} className="relative pl-8 pb-8 last:pb-0 border-l-2 border-charcoal-100 last:border-transparent">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-2 border-white"></div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                                    <h3 className="text-lg font-bold text-charcoal-900">{sub.title}</h3>
                                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-fit mt-2 sm:mt-0">
                                        {new Date(sub.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <p className="text-charcoal-500 text-sm">
                                    Ends at {new Date(sub.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
          </div>

          {/* --- RIGHT SIDEBAR (Booking) --- */}
          <div className="lg:col-span-1">
             <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="sticky top-24"
             >
                <div className="bg-white rounded-2xl shadow-xl shadow-charcoal-900/5 border border-charcoal-100 overflow-hidden">
                    <div className="bg-charcoal-900 p-6 text-white">
                        <h3 className="font-serif font-bold text-xl">Reserve Your Spot</h3>
                        <p className="text-charcoal-300 text-sm mt-1">Select a ticket tier below</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            {event.ticket_types.map((ticket) => {
                                const isSelected = selectedTicket?.id === ticket.id;
                                const isSoldOut = ticket.quantity_available === 0;

                                return (
                                    <div 
                                        key={ticket.id}
                                        onClick={() => !isSoldOut && (setSelectedTicket(ticket), setReservationForm(prev => ({ ...prev, ticket_type_id: ticket.id })))}
                                        className={`
                                            relative p-4 rounded-xl border-2 transition-all cursor-pointer
                                            ${isSoldOut ? 'opacity-50 cursor-not-allowed bg-charcoal-50 border-charcoal-100' : ''}
                                            ${isSelected 
                                                ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500' 
                                                : 'border-charcoal-100 hover:border-primary-300 hover:shadow-md'
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-primary-500 text-white p-1 rounded-full">
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-charcoal-900">{ticket.name}</span>
                                            <span className="font-serif font-bold text-primary-600 text-lg">
                                                {formatCurrency(ticket.price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs mt-2">
                                            <span className="text-charcoal-500">Fee: {formatCurrency(ticket.reservation_fee)}</span>
                                            <span className={`${ticket.quantity_available < 10 ? 'text-orange-600 font-medium' : 'text-green-600'}`}>
                                                {isSoldOut ? 'Sold Out' : `${ticket.quantity_available} left`}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <AnimatePresence>
                            {selectedTicket && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-charcoal-100 pt-6 space-y-4"
                                >
                                    <div className="flex items-center justify-between bg-charcoal-50 rounded-xl p-2 border border-charcoal-100">
                                        <span className="text-sm font-bold text-charcoal-700 pl-3">Quantity</span>
                                        <div className="flex items-center bg-white rounded-lg shadow-sm border border-charcoal-100">
                                          <button 
                                            onClick={() => updateQuantity(-1)}
                                            className="p-2 hover:text-primary-600 transition-colors"
                                            disabled={reservationForm.quantity <= 1}
                                          >
                                            <MinusIcon className="w-4 h-4" />
                                          </button>
                                          <span className="w-8 text-center font-bold text-charcoal-900">{reservationForm.quantity}</span>
                                          <button 
                                            onClick={() => updateQuantity(1)}
                                            className="p-2 hover:text-primary-600 transition-colors"
                                            disabled={reservationForm.quantity >= selectedTicket.quantity_available}
                                          >
                                            <PlusIcon className="w-4 h-4" />
                                          </button>
                                        </div>
                                    </div>

                                    <div className="bg-charcoal-50 rounded-lg p-4 space-y-2 text-sm">
                                        <div className="flex justify-between text-charcoal-600">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency((parseFloat(selectedTicket.price) * reservationForm.quantity).toString())}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-charcoal-900 pt-2 border-t border-charcoal-200">
                                            <span>Reservation Deposit</span>
                                            <span className="text-primary-600">{formatCurrency((parseFloat(selectedTicket.reservation_fee) * reservationForm.quantity).toString())}</span>
                                        </div>
                                        <p className="text-xs text-charcoal-500 mt-1 italic text-center">Deposit required to secure booking.</p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleProceedToPayment}
                                        className="w-full btn-primary py-4 shadow-lg shadow-primary-500/20 text-lg flex items-center justify-center gap-2"
                                    >
                                        <LockClosedIcon className="w-5 h-5" />
                                        Proceed to Payment
                                    </button>
                                    
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <p className="text-charcoal-400 text-sm flex items-center justify-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" /> Secure Payment Processing
                    </p>
                </div>
             </motion.div>
          </div>
        </div>
      </div>

      {/* --- RESERVATION & PAYMENT MODAL --- */}
      <AnimatePresence>
        {showReservationForm && selectedTicket && (
            <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="bg-primary-500 p-6 text-white text-center flex-shrink-0">
                    <h3 className="text-2xl font-serif font-bold">Complete Reservation</h3>
                    <p className="text-primary-100 text-sm">Confirm details and view payment info.</p>
                </div>

                <div className="p-8 overflow-y-auto">
                    <form onSubmit={handleReservation} className="space-y-5">
                        {/* User Details Section */}
                        <div className="space-y-4">
                             <h4 className="text-charcoal-900 font-bold border-b pb-2">Guest Information</h4>
                             <div>
                                <label className="block text-sm font-bold text-charcoal-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={reservationForm.full_name}
                                    onChange={(e) => setReservationForm(prev => ({...prev, full_name: e.target.value}))}
                                    className="w-full p-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-charcoal-50"
                                    placeholder="e.g. John Doe"
                                    disabled={!!currentUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={reservationForm.guest_email}
                                    onChange={(e) => setReservationForm(prev => ({...prev, guest_email: e.target.value}))}
                                    className="w-full p-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-charcoal-50"
                                    placeholder="john@example.com"
                                    disabled={!!currentUser}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal-700 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    value={reservationForm.phone_number}
                                    onChange={(e) => setReservationForm(prev => ({...prev, phone_number: e.target.value}))}
                                    className="w-full p-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-charcoal-50"
                                    placeholder="+27 ..."
                                    disabled={!!currentUser}
                                />
                            </div>
                        </div>

                        {/* Payment Info Section */}
                        <div className="bg-charcoal-50 rounded-xl p-5 border border-charcoal-200 mt-6">
                             <div className="flex items-center mb-3 text-charcoal-900">
                                 <BanknotesIcon className="w-5 h-5 mr-2 text-primary-600" />
                                 <h4 className="font-bold">Payment Information</h4>
                             </div>
                             <p className="text-sm text-charcoal-600 mb-4 leading-relaxed">
                                 To secure your spot, please make an EFT of 
                                 <strong className="text-charcoal-900"> {formatCurrency((parseFloat(selectedTicket.reservation_fee) * reservationForm.quantity).toString())} </strong> 
                                 to the account below. You will need to upload proof of payment on the next screen.
                             </p>
                             
                             {activeBank ? (
                                 <div className="bg-white p-3 rounded border border-charcoal-200 text-sm space-y-1 font-mono text-charcoal-700">
                                     <div className="flex justify-between"><span>Bank:</span><span className="font-bold">{activeBank.bank_name}</span></div>
                                     <div className="flex justify-between"><span>Holder:</span><span className="font-bold text-xs">{activeBank.account_name}</span></div>
                                     <div className="flex justify-between"><span>Account No:</span><span className="font-bold">{activeBank.account_number}</span></div>
                                     <div className="flex justify-between"><span>Branch Code:</span><span className="font-bold">{activeBank.branch_code}</span></div>
                                     <div className="flex justify-between text-primary-700"><span>Reference:</span><span className="font-bold italic">(Provided on next step)</span></div>
                                 </div>
                             ) : (
                                 <div className="bg-white p-3 rounded border border-charcoal-200 text-sm text-center text-charcoal-500 italic">
                                     Banking details will be provided on the next step.
                                 </div>
                             )}
                        </div>
                        
                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowReservationForm(false)}
                                className="flex-1 py-3 px-4 border border-charcoal-200 text-charcoal-600 rounded-lg hover:bg-charcoal-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 btn-primary py-3 px-4 rounded-lg font-medium shadow-md disabled:opacity-50"
                            >
                                {submitting ? 'Processing...' : 'Confirm & Upload Proof'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-charcoal-50 pb-12">
        <div className="bg-charcoal-900 h-[400px] w-full animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 -mt-20 relative">
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl p-8 h-96 animate-pulse shadow-sm"></div>
                <div className="lg:col-span-1 bg-white rounded-2xl p-8 h-64 animate-pulse shadow-sm"></div>
            </div>
        </div>
    </div>
  )
}