import React, { useState } from 'react';

export default function ApplyContributorModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    reasonForApplying: '',
    experience: '',
    collegeIdCard: null,
    authorityLetter: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Validate file size (5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, [name]: 'File size must be less than 5MB' }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(files[0].type)) {
        setErrors((prev) => ({ ...prev, [name]: 'Only JPEG, PNG, and PDF files are allowed' }));
        return;
      }
      
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.reasonForApplying.trim()) {
      newErrors.reasonForApplying = 'Reason for applying is required';
    } else if (formData.reasonForApplying.length > 1000) {
      newErrors.reasonForApplying = 'Reason cannot exceed 1000 characters';
    }
    
    if (formData.experience && formData.experience.length > 1000) {
      newErrors.experience = 'Experience cannot exceed 1000 characters';
    }
    
    if (!formData.collegeIdCard) {
      newErrors.collegeIdCard = 'College ID card is required';
    }
    
    if (!formData.authorityLetter) {
      newErrors.authorityLetter = 'Authority letter is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        reasonForApplying: '',
        experience: '',
        collegeIdCard: null,
        authorityLetter: null,
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Apply to Become a Contributor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Only one contributor per college is allowed. 
                  Your application will be reviewed by administrators. Please provide accurate information and valid documents.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason for Applying */}
            <div>
              <label htmlFor="reasonForApplying" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to become a contributor? <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reasonForApplying"
                name="reasonForApplying"
                value={formData.reasonForApplying}
                onChange={handleChange}
                rows={4}
                placeholder="Explain your motivation and how you plan to contribute to your campus community..."
                className={`w-full px-4 py-2 border ${errors.reasonForApplying ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isSubmitting}
              />
              {errors.reasonForApplying && (
                <p className="mt-1 text-sm text-red-500">{errors.reasonForApplying}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.reasonForApplying.length}/1000 characters
              </p>
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Relevant Experience (Optional)
              </label>
              <textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Any previous experience in event management, content creation, or community leadership..."
                className={`w-full px-4 py-2 border ${errors.experience ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                disabled={isSubmitting}
              />
              {errors.experience && (
                <p className="mt-1 text-sm text-red-500">{errors.experience}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.experience.length}/1000 characters
              </p>
            </div>

            {/* College ID Card */}
            <div>
              <label htmlFor="collegeIdCard" className="block text-sm font-medium text-gray-700 mb-2">
                College ID Card <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={`border-2 border-dashed ${errors.collegeIdCard ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}>
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {formData.collegeIdCard ? formData.collegeIdCard.name : 'Click to upload College ID Card'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="collegeIdCard"
                    name="collegeIdCard"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {errors.collegeIdCard && (
                <p className="mt-1 text-sm text-red-500">{errors.collegeIdCard}</p>
              )}
            </div>

            {/* Authority Letter */}
            <div>
              <label htmlFor="authorityLetter" className="block text-sm font-medium text-gray-700 mb-2">
                Authority Letter <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className={`border-2 border-dashed ${errors.authorityLetter ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 text-center hover:border-blue-500 transition-colors`}>
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm text-gray-600">
                      {formData.authorityLetter ? formData.authorityLetter.name : 'Click to upload Authority Letter'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or PDF (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    id="authorityLetter"
                    name="authorityLetter"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
              {errors.authorityLetter && (
                <p className="mt-1 text-sm text-red-500">{errors.authorityLetter}</p>
              )}
              <p className="mt-2 text-xs text-gray-600">
                Upload a letter of recommendation or approval from college authorities (HOD, Principal, etc.)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
