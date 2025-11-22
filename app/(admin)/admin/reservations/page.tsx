'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentCheckIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'
import { urlUtils } from '@/lib/utils'

interface Reservation {
    id: number;
    reference_code: string;
    guest_email: string;
    quantity: number;
    total_amount: number;
    amount_paid: number;
    outstanding_balance: number;
    status: 'reserved' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'attended';
    ticket_type_name: string;
}

interface PaymentProof {
    id: number;
    reservation: number;
    reservation__reference_code: string;
    file: string;
    amount: number; // Declared amount
    verification_status: 'pending' | 'approved' | 'rejected';
}

const API_URLS = {
    RESERVATIONS: 'reservations/reservations/',
    PAYMENT_PROOFS: 'reservations/payment-proofs/',
    APPROVE_PROOF: (pk: number) => `reservations/payment-proofs/${pk}/approve/`,
    REJECT_PROOF: (pk: number) => `reservations/payment-proofs/${pk}/reject/`,
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [pendingProofs, setPendingProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true);
    try {
        const [resResponse, proofResponse] = await Promise.all([
            api.get(API_URLS.RESERVATIONS),
            api.get(API_URLS.PAYMENT_PROOFS, { params: { verification_status: 'pending' } })
        ]);
        
        setReservations(resResponse.data.results || resResponse.data);
        setPendingProofs(proofResponse.data.results || proofResponse.data);

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const handleApprove = async (proofId: number) => {
    if (!window.confirm(`Approve Payment Proof #${proofId}? This will record the payment.`)) return;
    try {
        await api.post(API_URLS.APPROVE_PROOF(proofId));
        alert(`Proof approved successfully.`);
        fetchData();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to approve proof.');
    }
  };

  const handleReject = async (proofId: number) => {
    const notes = window.prompt("Reason for rejection:");
    if (notes === null) return;
    try {
        await api.post(API_URLS.REJECT_PROOF(proofId), { notes });
        alert(`Proof rejected.`);
        fetchData();
    } catch (error) {
        alert('Failed to reject proof.');
    }
  };

  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
                Reservation Management
                </h1>
                <p className="text-charcoal-600">
                Review proofs and monitor reservation status.
                </p>
            </div>
            <button onClick={fetchData} className="text-primary-600 hover:text-primary-800">
                <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`}/>
            </button>
          </div>

          {/* Pending Approvals Widget */}
          {pendingProofs.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 mb-8 border-l-4 border-orange-500"
            >
                <h2 className="text-xl font-bold text-charcoal-900 mb-4 flex items-center">
                <DocumentCheckIcon className='w-6 h-6 text-orange-500 mr-2'/>
                Pending Payment Proofs ({pendingProofs.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingProofs.map((proof) => {
                    const reservation = reservations.find(r => r.id === proof.reservation);
                    return (
                    <div key={proof.id} className="p-4 bg-white border border-charcoal-200 rounded-lg shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono text-xs font-bold bg-charcoal-100 px-2 py-1 rounded">
                                    {proof.reservation__reference_code || reservation?.reference_code}
                                </span>
                                <span className="text-xs text-charcoal-500">ID: {proof.id}</span>
                            </div>
                            <p className="font-bold text-charcoal-900">Declared: R {Number(proof.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                            <p className="text-sm text-charcoal-600 mb-3">
                                Total Due: R {reservation?.total_amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '...'}
                            </p>
                            <a 
                                href={urlUtils.getMediaUrl(proof.file)}
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-primary-600 hover:text-primary-800 underline mb-4 block"
                            >
                                View Proof Document
                            </a>
                        </div>
                        <div className='flex space-x-2 mt-auto'>
                            <button 
                                onClick={() => handleApprove(proof.id)}
                                className="flex-1 btn-success flex items-center justify-center text-xs py-2"
                            >
                                <CheckIcon className='w-3 h-3 mr-1'/> Approve
                            </button>
                            <button 
                                onClick={() => handleReject(proof.id)}
                                className="flex-1 btn-danger flex items-center justify-center text-xs py-2"
                            >
                                <XMarkIcon className='w-3 h-3 mr-1'/> Reject
                            </button>
                        </div>
                    </div>
                    )
                })}
                </div>
            </motion.div>
          )}

          {/* All Reservations List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50">
                <h2 className="text-lg font-bold text-charcoal-900">All Reservations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-charcoal-200">
                <thead className="bg-white">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Guest</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Ticket</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-charcoal-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-charcoal-500 uppercase tracking-wider">Paid</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-charcoal-500 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-charcoal-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-charcoal-200">
                  {reservations.map((res) => {
                      // Correct calculation: Total - Paid
                      const balance = Number(res.total_amount) - Number(res.amount_paid);
                      const balanceDisplay = balance > 0.01 ? balance : 0;

                      return (
                        <tr key={res.id} className="hover:bg-charcoal-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-mono text-sm font-medium text-charcoal-900">{res.reference_code}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-charcoal-900">{res.guest_email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">
                                {res.quantity} x {res.ticket_type_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-charcoal-900">
                                R {Number(res.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
                                R {Number(res.amount_paid).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                {balanceDisplay > 0 ? (
                                    <span className="text-red-600 font-bold">
                                        R {balanceDisplay.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    res.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    res.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                    res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {res.status === 'confirmed' ? 'Deposit Paid' : res.status.toUpperCase()}
                                </span>
                            </td>
                        </tr>
                      )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
    </div>
  )
}