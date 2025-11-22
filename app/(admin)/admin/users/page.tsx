'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import api from '@/lib/api'

// --- INTERFACES ---
interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
}

const API_URLS = {
  ADMIN_PROFILE: 'auth/me/', 
  USERS_LIST: 'auth/users/', 
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [adminProfile, setAdminProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [submitting, setSubmitting] = useState(false)

  // Function to fetch the current admin's profile
  const fetchAdminProfile = async () => {
    try {
        const response = await api.get(API_URLS.ADMIN_PROFILE);
        setAdminProfile(response.data);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
    }
  }
  
  // Function to fetch the full user list
  const fetchUsers = async () => {
    setLoading(true);
    try {
        const response = await api.get(API_URLS.USERS_LIST); 
        setUsers(response.data.results || response.data);
    } catch (error) {
        console.error('Error fetching users list:', error);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminProfile();
    fetchUsers();
  }, [])
  
  const handleEdit = (user: User) => {
      setEditingUser(user);
      setFormData({
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
          is_verified: user.is_verified
      });
      setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingUser) return;
      
      setSubmitting(true);
      try {
          const response = await api.patch(`${API_URLS.USERS_LIST}${editingUser.id}/`, formData);
          
          // Update local state
          setUsers(prev => prev.map(u => u.id === editingUser.id ? response.data : u));
          
          // Close modal and reset
          setIsEditModalOpen(false);
          setEditingUser(null);
          alert('User updated successfully.');
      } catch (error: any) {
          console.error('Error updating user:', error);
          alert(`Failed to update user: ${error.response?.data?.detail || 'Unknown error'}`);
      } finally {
          setSubmitting(false);
      }
  };

  const handleDelete = async (userId: number) => {
    if (!window.confirm(`Are you sure you want to delete User ID ${userId}?`)) return;
    
    try { 
        await api.delete(`${API_URLS.USERS_LIST}${userId}/`);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) { 
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="py-8"> 
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
              User Management
            </h1>
            <p className="text-charcoal-600">
              View and manage registered users.
            </p>
          </motion.div>
          
          {loading && <p className='text-center text-charcoal-500'>Loading data...</p>}
          
          {/* Current Admin Profile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 mb-8 grid md:grid-cols-2 gap-8"
          >
            <div>
                <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-4 flex items-center">
                    <UserCircleIcon className='w-6 h-6 mr-2 text-indigo-600'/>
                    Your Admin Profile
                </h2>
                <div className='space-y-2'>
                    <p><strong>Name:</strong> {adminProfile?.full_name || 'Loading...'}</p>
                    <p><strong>Email:</strong> {adminProfile?.email || 'Loading...'}</p>
                    <p><strong>Role:</strong> <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800'>{adminProfile?.role.toUpperCase() || 'N/A'}</span></p>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-4">Actions</h2>
                {adminProfile && (
                    <button onClick={() => handleEdit(adminProfile)} className="btn-secondary mr-3">Edit My Profile</button>
                )}
            </div>
          </motion.div>

          {/* User List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-serif font-bold text-charcoal-900 flex items-center">
                    <UserGroupIcon className="w-6 h-6 mr-2 text-gray-500" />
                    All Users ({users.length})
                </h2>
            </div>

            {users.length === 0 && !loading ? (
                <div className="p-8 text-center bg-yellow-50 rounded-lg">
                    <ExclamationTriangleIcon className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                    <p className="text-charcoal-600">
                        No users found.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                              user.role === 'organizer' ? 'bg-blue-100 text-blue-800' : 
                                              'bg-green-100 text-green-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${user.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.is_verified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleEdit(user)} 
                                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            title="Edit User"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id)} 
                                            className="text-red-600 hover:text-red-900"
                                            title="Delete User"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
          </motion.div>
        </div>

        {/* --- EDIT USER MODAL --- */}
        <AnimatePresence>
            {isEditModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="flex justify-between items-center p-6 border-b border-charcoal-100">
                            <h3 className="text-xl font-bold text-charcoal-900">Edit User</h3>
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-charcoal-400 hover:text-charcoal-600 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Name</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.full_name || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                                    className="input-field w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1">Phone Number</label>
                                <input 
                                    type="text"
                                    value={formData.phone_number || ''}
                                    onChange={(e) => setFormData(prev => ({...prev, phone_number: e.target.value}))}
                                    className="input-field w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal-700 mb-1">Role</label>
                                    <select
                                        value={formData.role || 'attendee'}
                                        onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                                        className="input-field w-full"
                                    >
                                        <option value="attendee">Attendee</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="finance">Finance</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center cursor-pointer">
                                        <div className="relative">
                                            <input 
                                                type="checkbox"
                                                checked={formData.is_verified || false}
                                                onChange={(e) => setFormData(prev => ({...prev, is_verified: e.target.checked}))}
                                                className="sr-only" 
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${formData.is_verified ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_verified ? 'transform translate-x-4' : ''}`}></div>
                                        </div>
                                        <span className="ml-3 text-sm font-medium text-charcoal-700">Verified User</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="btn-secondary bg-white text-charcoal-700 border border-charcoal-300 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {submitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  )
}