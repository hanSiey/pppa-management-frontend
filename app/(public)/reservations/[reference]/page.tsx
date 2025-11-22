'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  EnvelopeIcon,
  ArrowLongRightIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import api from '@/lib/api'

interface Reservation {
  id: number
  reference_code: string
  status: 'reserved' | 'paid' | 'cancelled' | 'attended' | 'pending' | 'confirmed' | 'completed'
  total_amount: string
  amount_paid: string
  reservation_fee: string 
  quantity: number
  guest_email: string
  ticket_type_name: string
}

interface BankingDetail {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    branch_code: string;
}

export default function ReservationStatusPage() {
  const params = useParams()
  const referenceCode = params.reference as string
  
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [bankingDetails, setBankingDetails] = useState<BankingDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // Payment Choice State
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit'>('full')

  useEffect(() => {
    if (referenceCode) {
        fetchData()
    } else {
        setLoading(false)
    }
  }, [referenceCode])

  const fetchData = async () => {
      try {
          const [resResponse, bankResponse] = await Promise.all([
              api.get(`/reservations/reservations/?reference_code=${referenceCode}`),
              api.get('/payments/banking-details/')
          ]);

          const data = resResponse.data.results ? resResponse.data.results[0] : resResponse.data;
          
          if (Array.isArray(data)) {
             const found = data.find((r: any) => r.reference_code === referenceCode) || data[0];
             setReservation(found || null);
          } else {
             setReservation(data || null);
          }
          
          setBankingDetails(bankResponse.data.results || bankResponse.data);

      } catch (error) {
          console.error("Error fetching data:", error)
      } finally {
          setLoading(false)
      }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0])
      }
  }

  const handleUpload = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file || !reservation) return;

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const amountToPay = paymentOption === 'full' 
        ? parseFloat(reservation.total_amount) 
        : parseFloat(reservation.reservation_fee) * reservation.quantity;
      
      formData.append('amount', amountToPay.toString());

      try {
          await api.post(`/reservations/reservations/${reservation.id}/upload_payment_proof/`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setUploadSuccess(true);
          setFile(null);
          fetchData(); // Refresh data to show pending state
      } catch (error) {
          console.error("Upload failed", error);
          alert('Failed to upload proof. Please try again.');
          setUploading(false);
      }
  }

  if (loading) return <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">Loading...</div>
  if (!reservation) return <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">Reservation not found</div>

  const depositAmount = parseFloat(reservation.reservation_fee) * reservation.quantity;
  const totalAmount = parseFloat(reservation.total_amount);
  const displayAmount = paymentOption === 'full' ? totalAmount : depositAmount;
  
  // Get primary banking details (first one in list)
  const activeBank = bankingDetails.length > 0 ? bankingDetails[0] : null;

  // --- VIEW: PENDING VERIFICATION ---
  if (reservation.status === 'pending') {
      return (
        <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-charcoal-100 overflow-hidden"
          >
            <div className="bg-orange-500 p-6 text-center text-white">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                >
                    <DocumentMagnifyingGlassIcon className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-2xl font-serif font-bold">Verification Pending</h1>
                <p className="text-orange-100 mt-1">Proof of payment received.</p>
            </div>
            <div className="p-8 text-center">
                <p className="text-charcoal-600">We are reviewing your payment proof. You will receive an email once confirmed.</p>
                <div className="mt-6">
                    <Link href="/events" className="btn-secondary px-6 py-2 rounded-lg">Browse Events</Link>
                </div>
            </div>
          </motion.div>
        </div>
      )
  }

  // --- VIEW: PENDING PAYMENT (Reserved) ---
  if (reservation.status === 'reserved') {
      return (
        <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4 py-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-4xl w-full rounded-2xl shadow-xl border border-charcoal-100 overflow-hidden"
          >
            <div className="bg-yellow-500 p-6 text-center text-white">
                <ClockIcon className="w-12 h-12 mx-auto mb-3 text-yellow-50 opacity-90" />
                <h1 className="text-2xl font-serif font-bold">Payment Required</h1>
                <p className="text-yellow-50 mt-1">Complete payment to secure your booking.</p>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-12">
                {/* Payment Options & Bank Details */}
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-charcoal-900 mb-3">Select Payment Option</h3>
                        <div className="space-y-3">
                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'full' ? 'border-primary-500 bg-primary-50' : 'border-charcoal-100 hover:border-charcoal-300'}`}>
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                                        checked={paymentOption === 'full'}
                                        onChange={() => setPaymentOption('full')}
                                    />
                                    <span className="ml-3 font-medium text-charcoal-900">Full Amount</span>
                                </div>
                                <span className="font-bold text-charcoal-900">R {totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'deposit' ? 'border-primary-500 bg-primary-50' : 'border-charcoal-100 hover:border-charcoal-300'}`}>
                                <div className="flex items-center">
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                                        checked={paymentOption === 'deposit'}
                                        onChange={() => setPaymentOption('deposit')}
                                    />
                                    <span className="ml-3 font-medium text-charcoal-900">Deposit</span>
                                </div>
                                <span className="font-bold text-charcoal-900">R {depositAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-charcoal-50 p-5 rounded-xl border border-charcoal-200 text-sm space-y-3">
                        <h4 className="font-bold text-charcoal-900 flex items-center"><BanknotesIcon className="w-4 h-4 mr-2"/> Bank Details</h4>
                        {activeBank ? (
                            <div className="grid grid-cols-2 gap-2 text-charcoal-600">
                                <span>Bank:</span><span className="font-bold text-charcoal-900 text-right">{activeBank.bank_name}</span>
                                <span>Account Name:</span><span className="font-bold text-charcoal-900 text-right text-xs truncate">{activeBank.account_name}</span>
                                <span>Account No:</span><span className="font-bold text-charcoal-900 text-right font-mono">{activeBank.account_number}</span>
                                <span>Branch:</span><span className="font-bold text-charcoal-900 text-right font-mono">{activeBank.branch_code}</span>
                                <span>Reference:</span><span className="font-bold text-primary-600 text-right font-mono">{reservation.reference_code}</span>
                            </div>
                        ) : (
                            <div className="text-center text-charcoal-500 italic py-2">
                                Banking details are currently unavailable. Please contact support.
                            </div>
                        )}
                        
                        <div className="border-t border-charcoal-200 pt-3 flex justify-between items-center">
                            <span className="uppercase text-xs font-bold text-charcoal-500">Total to Pay</span>
                            <span className="text-xl font-serif font-bold text-primary-600">R {displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="flex flex-col justify-center">
                    <h3 className="font-bold text-charcoal-900 mb-4 flex items-center">
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2 text-primary-600"/> Upload Proof of Payment
                    </h3>
                    
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="border-2 border-dashed border-charcoal-200 rounded-xl p-8 text-center hover:bg-charcoal-50 transition-colors bg-charcoal-50/50">
                            <input 
                                type="file" 
                                id="pop-upload" 
                                className="hidden" 
                                accept="image/*,application/pdf"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="pop-upload" className="cursor-pointer block">
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <DocumentMagnifyingGlassIcon className="w-8 h-8 text-primary-500 mb-2"/>
                                        <span className="text-primary-600 font-medium break-all">{file.name}</span>
                                        <span className="text-xs text-charcoal-400 mt-1">Click to change</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ArrowUpTrayIcon className="w-8 h-8 text-charcoal-300 mb-2"/>
                                        <span className="text-charcoal-600 font-medium">Select PDF or Image</span>
                                        <span className="text-xs text-charcoal-400 mt-1">Max 10MB</span>
                                    </div>
                                )}
                            </label>
                        </div>
                        <button 
                            type="submit"
                            disabled={!file || uploading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-lg shadow-lg"
                        >
                            {uploading ? 'Uploading...' : `Confirm Payment of R ${displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
                        </button>
                    </form>
                </div>
            </div>
          </motion.div>
        </div>
      )
  }

  // --- VIEW: CONFIRMED (Deposit Paid) or COMPLETED (Fully Paid) ---
  const isFullyPaid = reservation.status === 'completed';
  
  // Safe calculation for outstanding balance
  const rawOutstanding = Number(reservation.total_amount) - Number(reservation.amount_paid);
  const outstanding = rawOutstanding > 0.01 ? rawOutstanding : 0;

  return (
    <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-charcoal-100 overflow-hidden"
      >
        <div className={`${reservation.status === 'cancelled' ? 'bg-red-500' : 'bg-green-600'} p-6 text-center`}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
                {reservation.status === 'cancelled' ? (
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                ) : (
                    <CheckCircleIcon className="w-10 h-10 text-green-600" />
                )}
            </motion.div>
            <h1 className="text-2xl font-serif font-bold text-white">
                {reservation.status === 'cancelled' ? 'Reservation Cancelled' : 'Reservation Confirmed!'}
            </h1>
            {reservation.status !== 'cancelled' && (
                <p className="text-green-100 mt-1">Your spot has been successfully secured.</p>
            )}
        </div>

        <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <p className="text-charcoal-500 text-sm uppercase tracking-wide font-bold">Booking Reference</p>
                <div className="bg-charcoal-50 py-3 px-4 rounded-lg border border-charcoal-100 inline-block">
                    <p className="text-2xl font-mono text-charcoal-900 font-bold tracking-wider select-all">
                        {referenceCode}
                    </p>
                </div>
            </div>

            {/* Balance Section */}
            {reservation.status !== 'cancelled' && !isFullyPaid && outstanding > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-800 font-bold text-sm">Outstanding Balance</span>
                        <span className="text-blue-900 font-bold text-lg">R {outstanding.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <p className="text-blue-600 text-xs">Please pay the remainder before the event.</p>
                </div>
            )}

            {reservation.status !== 'cancelled' && (
                <div className="space-y-4 border-t border-charcoal-100 pt-6">
                    <div className="flex items-start">
                        <EnvelopeIcon className="w-6 h-6 text-primary-500 mr-3 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-charcoal-900">Check your email</h3>
                            <p className="text-sm text-charcoal-600">We've sent a confirmation to <strong>{reservation.guest_email}</strong>.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-2">
                <Link 
                    href="/events"
                    className="block w-full btn-primary py-3 text-center rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                >
                    Browse More Events
                </Link>
                <Link 
                    href="/"
                    className="w-full text-center text-charcoal-500 text-sm mt-4 hover:text-charcoal-900 flex items-center justify-center"
                >
                    Return to Home <ArrowLongRightIcon className="w-4 h-4 ml-1"/>
                </Link>
            </div>
        </div>
      </motion.div>
    </div>
  )
}