'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { DocumentIcon, PhotoIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface PaymentUploadProps {
  reservationId: number
  referenceCode: string
  onUploadComplete: (fileData: any) => void
  existingProofs?: Array<{
    id: number
    file: string
    uploaded_at: string
    verification_status: string
  }>
}

export default function PaymentUpload({
  reservationId,
  referenceCode,
  onUploadComplete,
  existingProofs = []
}: PaymentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    setError('')
    setSuccess('')

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG, or PDF file')
      return
    }

    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('reservation_id', reservationId.toString())

      // Simulate API call
      // const response = await api.post('/payments/upload_for_reservation/', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // })

      // Simulate success
      setTimeout(() => {
        const uploadedFile = {
          id: Date.now(),
          file: URL.createObjectURL(selectedFile),
          uploaded_at: new Date().toISOString(),
          verification_status: 'pending'
        }

        onUploadComplete(uploadedFile)
        setSuccess('Payment proof uploaded successfully!')
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1500)

    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100'
      case 'rejected':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing Proofs */}
      {existingProofs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Previously Uploaded Proofs</h3>
          <div className="space-y-3">
            {existingProofs.map((proof) => (
              <div key={proof.id} className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {proof.file.endsWith('.pdf') ? (
                    <DocumentIcon className="w-8 h-8 text-charcoal-400" />
                  ) : (
                    <PhotoIcon className="w-8 h-8 text-charcoal-400" />
                  )}
                  <div>
                    <p className="font-medium text-charcoal-900">
                      Proof #{proof.id}
                    </p>
                    <p className="text-sm text-charcoal-600">
                      Uploaded {new Date(proof.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.verification_status)}`}>
                    {proof.verification_status}
                  </span>
                  <a
                    href={proof.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">
          {existingProofs.length > 0 ? 'Upload New Proof' : 'Upload Payment Proof'}
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              {success}
            </p>
          </div>
        )}

        {/* Drag & Drop Area */}
        {!selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary-500 bg-primary-50' 
                : 'border-charcoal-300 hover:border-primary-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <DocumentIcon className="w-12 h-12 text-charcoal-400 mx-auto mb-4" />
            <p className="text-charcoal-900 font-medium mb-2">
              Drop your payment proof here or click to browse
            </p>
            <p className="text-charcoal-600 text-sm mb-4">
              Supported formats: JPG, PNG, PDF (Max 10MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Select File
            </button>
          </motion.div>
        )}

        {/* File Preview */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border border-charcoal-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedFile.type === 'application/pdf' ? (
                  <DocumentIcon className="w-8 h-8 text-charcoal-400" />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-charcoal-400" />
                )}
                <div>
                  <p className="font-medium text-charcoal-900">{selectedFile.name}</p>
                  <p className="text-sm text-charcoal-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-1 hover:bg-charcoal-100 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            {/* File Preview for Images */}
            {selectedFile.type.startsWith('image/') && (
              <div className="mt-4">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto"
                />
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={removeFile}
                className="flex-1 px-4 py-2 border border-charcoal-300 text-charcoal-700 rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Proof'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h4 className="font-semibold text-charcoal-900 mb-2">Payment Instructions</h4>
        <ul className="text-sm text-charcoal-600 space-y-1">
          <li>• Take a clear photo or screenshot of your payment confirmation</li>
          <li>• Ensure the reference number {referenceCode} is visible</li>
          <li>• Accepted formats: JPG, PNG, PDF</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Your reservation will be confirmed once payment is verified</li>
        </ul>
      </div>
    </div>
  )
}