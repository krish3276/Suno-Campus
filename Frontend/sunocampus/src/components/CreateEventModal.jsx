import React, { useState, useRef } from 'react';

const CreateEventModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    banner: null,
    bannerPreview: null,
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    visibility: 'global',
    maxParticipants: '',
    faqs: [{ question: '', answer: '' }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bannerInputRef = useRef(null);

  const categories = [
    'Workshop',
    'Seminar',
    'Conference',
    'Hackathon',
    'Competition',
    'Cultural',
    'Sports',
    'Fest',
    'Webinar',
    'Other',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        banner: file,
        bannerPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleFAQChange = (index, field, value) => {
    const updatedFAQs = [...formData.faqs];
    updatedFAQs[index][field] = value;
    setFormData(prev => ({ ...prev, faqs: updatedFAQs }));
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const removeFAQ = (index) => {
    if (formData.faqs.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      banner: null,
      bannerPreview: null,
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      venue: '',
      visibility: 'global',
      maxParticipants: '',
      faqs: [{ question: '', answer: '' }],
    });
  };

  const validate = () => {
    if (!formData.title.trim()) { alert('Please enter event title'); return false; }
    if (!formData.category) { alert('Please select a category'); return false; }
    if (!formData.description.trim()) { alert('Please enter event description'); return false; }
    if (!formData.startDate) { alert('Please select start date'); return false; }
    if (!formData.endDate) { alert('Please select end date'); return false; }
    if (!formData.registrationDeadline) { alert('Please select registration deadline'); return false; }
    if (!formData.venue.trim()) { alert('Please enter venue / location'); return false; }
    return true;
  };

  const buildPayload = (isDraft) => {
    const faqs = formData.faqs.filter(f => f.question.trim() && f.answer.trim());
    return {
      title: formData.title.trim(),
      eventType: formData.category,
      banner: formData.banner,
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      registrationDeadline: formData.registrationDeadline,
      venue: formData.venue.trim(),
      visibility: formData.visibility,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      faqs,
      isDraft,
    };
  };

  const handleSubmit = async (isDraft = false) => {
    if (!isDraft && !validate()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload(isDraft));
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const sectionTitle = (text) => (
    <div className="mb-4 mt-2">
      <span className="inline-block bg-red-600 text-white text-xs font-bold tracking-wider uppercase px-3 py-1 rounded">
        {text}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ───── BASIC INFORMATION ───── */}
          {sectionTitle('Basic Information')}

          {/* Event Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Annual Tech Fest 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category…</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Event Banner */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Event Banner *</label>
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              {formData.bannerPreview ? (
                <img src={formData.bannerPreview} alt="Banner preview" className="max-h-40 object-contain rounded" />
              ) : (
                <>
                  <svg className="w-12 h-12 text-yellow-500 mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" />
                  </svg>
                  <p className="text-sm font-semibold text-blue-600">Click to upload banner image</p>
                  <p className="text-xs text-gray-400 mt-1">Recommended size: 1920×600px</p>
                </>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
            </div>
          </div>

          {/* ───── DESCRIPTION ───── */}
          {sectionTitle('Description')}
          <div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Provide detailed description of the event…"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              maxLength={5000}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/5000</div>
          </div>

          {/* ───── DATE & TIME ───── */}
          {sectionTitle('Date & Time')}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-red-600 mb-1">Registration Deadline *</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ───── VENUE & VISIBILITY ───── */}
          {sectionTitle('Venue & Visibility')}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Venue / Location *</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., Main Auditorium or Online (Zoom)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Visibility Type *</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="global">Global (All colleges can see)</option>
              <option value="campus">Campus (Only your college)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Maximum Participants</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              placeholder="Leave empty for unlimited"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ───── FAQ SECTION (OPTIONAL) ───── */}
          {sectionTitle('FAQ Section (Optional)')}

          <div className="space-y-4">
            {formData.faqs.map((faq, index) => (
              <div key={index} className="relative border border-gray-200 rounded-lg p-4 space-y-3">
                {formData.faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFAQ(index)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg leading-none"
                  >
                    ×
                  </button>
                )}
                <div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                    placeholder="Question"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={faq.answer}
                    onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                    placeholder="Answer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFAQ}
              className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add FAQ
            </button>
          </div>

          {/* ───── ACTION BUTTONS ───── */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-8 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing…' : 'Publish Event'}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
