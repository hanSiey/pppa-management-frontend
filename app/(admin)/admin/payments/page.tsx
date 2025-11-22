'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BanknotesIcon,
  ClockIcon,
  ArrowPathIcon,
  BuildingLibraryIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

interface Payment {
    id: number;
    reservation_reference: string;
    event_title: string;
    amount: number;
    payment_method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paid_at: string | null;
    transaction_reference: string;
}

interface PaymentStats {
    today: { count: number, amount: number };
    this_week: { count: number, amount: number };
    this_month: { count: number, amount: number };
}

interface BankingDetail {
    id: number;
    bank_name: string;
    account_name: string;
    account_number: string;
    branch_code: string;
    is_active: boolean;
}

const API_URLS = {
    PAYMENTS: 'payments/payments/',
    PAYMENT_DETAIL: (pk: number) => `payments/payments/${pk}/`,
    MARK_COMPLETED: (pk: number) => `payments/payments/${pk}/mark-completed/`,
    STATS: 'payments/payments/stats/',
    BANKING_DETAILS: 'payments/banking-details/',
    BANKING_DETAIL_ITEM: (pk: number) => `payments/banking-details/${pk}/`,
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [bankingDetails, setBankingDetails] = useState<BankingDetail[]>([])
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'banking'>('pending')
  
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false)
  const [showBankingModal, setShowBankingModal] = useState(false)
  
  // Create Payment Form State
  const [newPayment, setNewPayment] = useState({
      reservation_reference: '',
      amount: '',
      payment_method: 'eft',
      transaction_reference: '',
      status: 'completed'
  })

  // Banking Detail Form State
  const [bankingForm, setBankingForm] = useState<Partial<BankingDetail>>({
      bank_name: '',
      account_name: '',
      account_number: '',
      branch_code: '',
      is_active: true
  })
  const [editingBankId, setEditingBankId] = useState<number | null>(null)

  const fetchData = async () => {
    setLoading(true);
    try {
        const [payRes, statsRes, bankRes] = await Promise.all([
            api.get(API_URLS.PAYMENTS),
            api.get(API_URLS.STATS),
            api.get(API_URLS.BANKING_DETAILS)
        ]);
        
        setPayments(payRes.data.results || payRes.data);
        setStats(statsRes.data);
        setBankingDetails(bankRes.data.results || bankRes.data);
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  // --- Payment Handlers ---
  const handleMarkCompleted = async (paymentId: number) => {
    const transactionRef = window.prompt("Enter Transaction Reference (e.g., Bank Ref):");
    if (transactionRef === null) return; 
    
    try {
        await api.post(API_URLS.MARK_COMPLETED(paymentId), { transaction_reference: transactionRef });
        alert(`Payment #${paymentId} verified and marked COMPLETED.`);
        fetchData(); 
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update payment.');
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
      if (!window.confirm(`Delete Payment #${paymentId}? This will recalculate the reservation balance.`)) return;
      try {
          await api.delete(API_URLS.PAYMENT_DETAIL(paymentId));
          setPayments(prev => prev.filter(p => p.id !== paymentId));
          const statsRes = await api.get(API_URLS.STATS);
          setStats(statsRes.data);
      } catch (error) {
          alert('Failed to delete payment.');
      }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await api.post(API_URLS.PAYMENTS, {
              reservation_reference: newPayment.reservation_reference,
              amount: parseFloat(newPayment.amount),
              payment_method: newPayment.payment_method,
              transaction_reference: newPayment.transaction_reference,
              status: newPayment.status
          });
          alert('Payment recorded. Reservation balance updated.');
          setShowCreatePaymentModal(false);
          setNewPayment({ reservation_reference: '', amount: '', payment_method: 'eft', transaction_reference: '', status: 'completed' });
          fetchData();
      } catch (error: any) {
          alert(`Failed: ${error.response?.data?.detail || 'Check reservation reference'}`);
      }
  }

  // --- Banking Detail Handlers ---
  const openBankingModal = (detail?: BankingDetail) => {
      if (detail) {
          setEditingBankId(detail.id);
          setBankingForm(detail);
      } else {
          setEditingBankId(null);
          setBankingForm({ bank_name: '', account_name: '', account_number: '', branch_code: '', is_active: true });
      }
      setShowBankingModal(true);
  };

  const handleSaveBankingDetail = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          if (editingBankId) {
              await api.patch(API_URLS.BANKING_DETAIL_ITEM(editingBankId), bankingForm);
          } else {
              await api.post(API_URLS.BANKING_DETAILS, bankingForm);
          }
          // Refresh banking list
          const bankRes = await api.get(API_URLS.BANKING_DETAILS);
          setBankingDetails(bankRes.data.results || bankRes.data);
          setShowBankingModal(false);
      } catch (error) {
          alert('Failed to save banking details.');
      }
  };

  const handleDeleteBankingDetail = async (id: number) => {
      if (!window.confirm("Are you sure? This will remove it from the public view.")) return;
      try {
          await api.delete(API_URLS.BANKING_DETAIL_ITEM(id));
          setBankingDetails(prev => prev.filter(b => b.id !== id));
      } catch (error) {
          alert('Failed to delete.');
      }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const historyPayments = payments.filter(p => p.status !== 'pending');
  
  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header & Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="md:col-span-1">
                <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-1">Payments</h1>
                <p className="text-charcoal-600 text-sm">Manage transactions & revenue.</p>
                <div className="flex gap-2 mt-4">
                    <button 
                        onClick={() => setShowCreatePaymentModal(true)}
                        className="btn-primary flex-1 flex items-center justify-center text-sm py-2"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" /> Payment
                    </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-charcoal-100 shadow-sm">
                  <p className="text-xs text-charcoal-500 uppercase font-bold">Today's Revenue</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">R {stats?.today.amount.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{stats?.today.count} transactions</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-charcoal-100 shadow-sm">
                  <p className="text-xs text-charcoal-500 uppercase font-bold">This Week</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">R {stats?.this_week.amount.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{stats?.this_week.count} transactions</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-charcoal-100 shadow-sm">
                  <p className="text-xs text-charcoal-500 uppercase font-bold">This Month</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">R {stats?.this_month.amount.toLocaleString() ?? 0}</p>
                  <p className="text-xs text-charcoal-400 mt-1">{stats?.this_month.count} transactions</p>
              </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-charcoal-200 mb-6">
              <button
                  onClick={() => setActiveTab('pending')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                      activeTab === 'pending' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                  }`}
              >
                  <ClockIcon className="w-4 h-4 mr-2"/>
                  Pending Review
                  {pendingPayments.length > 0 && (
                      <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                          {pendingPayments.length}
                      </span>
                  )}
              </button>
              <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                      activeTab === 'history' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                  }`}
              >
                  <ReceiptPercentIcon className="w-4 h-4 mr-2"/>
                  History
              </button>
              <button
                  onClick={() => setActiveTab('banking')}
                  className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center ${
                      activeTab === 'banking' 
                      ? 'border-primary-500 text-primary-600' 
                      : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                  }`}
              >
                  <BuildingLibraryIcon className="w-4 h-4 mr-2"/>
                  Banking Details
              </button>
              <button onClick={fetchData} className="ml-auto text-charcoal-400 hover:text-primary-600">
                  <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>

          {/* --- Tab Content --- */}
          <div className="card overflow-hidden">
            {/* PENDING & HISTORY TABS */}
            {(activeTab === 'pending' || activeTab === 'history') && (
                <>
                    {(activeTab === 'pending' ? pendingPayments : historyPayments).length === 0 ? (
                        <div className="p-12 text-center text-charcoal-500">
                            <BanknotesIcon className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
                            <p>No {activeTab} payments found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-charcoal-200">
                            <thead className="bg-charcoal-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Reference</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-charcoal-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-bold text-charcoal-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-charcoal-200">
                                {(activeTab === 'pending' ? pendingPayments : historyPayments).map((p) => (
                                    <tr key={p.id} className="hover:bg-charcoal-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm font-bold text-charcoal-900">{p.reservation_reference}</span>
                                            {p.transaction_reference && <div className="text-xs text-charcoal-500">Ref: {p.transaction_reference}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-600">
                                            {p.event_title || 'Unknown Event'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-900">
                                            R {p.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500 capitalize">
                                            {p.payment_method.replace('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">
                                            {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                p.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                p.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {p.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {p.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleMarkCompleted(p.id)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                    title="Verify & Mark Completed"
                                                >
                                                    <CheckCircleIcon className='w-5 h-5'/>
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleDeletePayment(p.id)}
                                                className="text-red-400 hover:text-red-600"
                                                title="Delete Payment"
                                            >
                                                <TrashIcon className='w-5 h-5'/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </>
            )}

            {/* BANKING DETAILS TAB */}
            {activeTab === 'banking' && (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-charcoal-900">Registered Bank Accounts</h3>
                        <button onClick={() => openBankingModal()} className="btn-secondary text-sm flex items-center">
                            <PlusIcon className="w-4 h-4 mr-2"/> Add Bank
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        {bankingDetails.map((bank) => (
                            <div key={bank.id} className={`border rounded-xl p-5 ${bank.is_active ? 'bg-white border-charcoal-200' : 'bg-charcoal-50 border-charcoal-100 opacity-75'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-charcoal-900 text-lg">{bank.bank_name}</h4>
                                        <p className="text-sm text-charcoal-500">{bank.account_name}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${bank.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {bank.is_active ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                
                                <div className="space-y-1 text-sm font-mono bg-charcoal-50 p-3 rounded border border-charcoal-100 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-charcoal-500">Account No:</span>
                                        <span className="font-bold text-charcoal-900">{bank.account_number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-charcoal-500">Branch Code:</span>
                                        <span className="font-bold text-charcoal-900">{bank.branch_code}</span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => openBankingModal(bank)}
                                        className="p-2 text-charcoal-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <PencilSquareIcon className="w-5 h-5"/>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteBankingDetail(bank.id)}
                                        className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {bankingDetails.length === 0 && (
                            <div className="col-span-2 text-center p-8 border-2 border-dashed border-charcoal-200 rounded-xl text-charcoal-400">
                                No banking details added yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Manual Payment Modal */}
        <AnimatePresence>
            {showCreatePaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-charcoal-100 pb-4">
                            <h3 className="text-xl font-bold text-charcoal-900">Record New Payment</h3>
                            <button onClick={() => setShowCreatePaymentModal(false)}>
                                <XMarkIcon className="w-6 h-6 text-charcoal-400 hover:text-charcoal-600" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Reservation Reference *</label>
                                <input 
                                    type="text"
                                    required
                                    value={newPayment.reservation_reference}
                                    onChange={(e) => setNewPayment({...newPayment, reservation_reference: e.target.value})}
                                    className="input-field"
                                    placeholder="e.g. 3A1B4C..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Amount (R) *</label>
                                    <input 
                                        type="number"
                                        required
                                        step="0.01"
                                        value={newPayment.amount}
                                        onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Method</label>
                                    <select
                                        value={newPayment.payment_method}
                                        onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                                        className="input-field"
                                    >
                                        <option value="eft">EFT</option>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card Machine</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Transaction Ref</label>
                                <input 
                                    type="text"
                                    value={newPayment.transaction_reference}
                                    onChange={(e) => setNewPayment({...newPayment, transaction_reference: e.target.value})}
                                    className="input-field"
                                    placeholder="Receipt / Bank Ref"
                                />
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg flex items-start">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                <p className="text-xs text-blue-800">
                                    This will immediately update the reservation balance and status.
                                </p>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button type="button" onClick={() => setShowCreatePaymentModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Record Payment</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Banking Detail Modal */}
        <AnimatePresence>
            {showBankingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-charcoal-100 pb-4">
                            <h3 className="text-xl font-bold text-charcoal-900">
                                {editingBankId ? 'Edit Bank Account' : 'Add Bank Account'}
                            </h3>
                            <button onClick={() => setShowBankingModal(false)}>
                                <XMarkIcon className="w-6 h-6 text-charcoal-400 hover:text-charcoal-600" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveBankingDetail} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Bank Name *</label>
                                <input 
                                    type="text"
                                    required
                                    value={bankingForm.bank_name}
                                    onChange={(e) => setBankingForm({...bankingForm, bank_name: e.target.value})}
                                    className="input-field"
                                    placeholder="e.g. FNB, Standard Bank"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Account Holder Name *</label>
                                <input 
                                    type="text"
                                    required
                                    value={bankingForm.account_name}
                                    onChange={(e) => setBankingForm({...bankingForm, account_name: e.target.value})}
                                    className="input-field"
                                    placeholder="e.g. Parliament Plating Pty Ltd"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Account Number *</label>
                                    <input 
                                        type="text"
                                        required
                                        value={bankingForm.account_number}
                                        onChange={(e) => setBankingForm({...bankingForm, account_number: e.target.value})}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Branch Code *</label>
                                    <input 
                                        type="text"
                                        required
                                        value={bankingForm.branch_code}
                                        onChange={(e) => setBankingForm({...bankingForm, branch_code: e.target.value})}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center pt-2">
                                <input 
                                    type="checkbox" 
                                    id="is_active"
                                    checked={bankingForm.is_active}
                                    onChange={(e) => setBankingForm({...bankingForm, is_active: e.target.checked})}
                                    className="h-4 w-4 text-primary-600 rounded border-charcoal-300 focus:ring-primary-500"
                                />
                                <label htmlFor="is_active" className="ml-2 block text-sm text-charcoal-900">
                                    Active (Visible to customers)
                                </label>
                            </div>

                            <div className="flex justify-end pt-4 gap-3">
                                <button type="button" onClick={() => setShowBankingModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary">Save Details</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
  )
}