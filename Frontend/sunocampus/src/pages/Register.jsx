import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step registration
  const [formData, setFormData] = useState({
    // Basic Details
    fullName: "",
    email: "", // Must be college email
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    
    // College Details
    collegeName: "",
    collegeEmailDomain: "", // e.g., @mitindia.edu
    studentId: "", // Roll number
    branch: "",
    yearOfStudy: "",
    graduationYear: "",
    
    // Verification
    studentIdCard: null, // Student ID card upload
    
    // Agreement
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState({
    studentIdCard: null,
  });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // List of verified college email domains (in real app, fetch from backend)
  const verifiedCollegeDomains = [
    "@gnu.ac.in", // Gitam University
    "@mitindia.edu",
    "@iitd.ac.in",
    "@bits-pilani.ac.in",
    "@nitk.edu.in",
    "@vit.ac.in",
    // Add more verified domains
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          setErrors({ ...errors, [name]: "Please upload an image file" });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setErrors({ ...errors, [name]: "File size should be less than 5MB" });
          return;
        }
        
        setFormData({ ...formData, [name]: file });
        
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages({ ...previewImages, [name]: reader.result });
        };
        reader.readAsDataURL(file);
        
        // Clear error
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    } else {
      setFormData({ ...formData, [name]: value });
      
      // Clear error when user starts typing
      if (errors[name]) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      // Check if email is from a college domain
      const isCollegeEmail = verifiedCollegeDomains.some(domain => 
        formData.email.toLowerCase().endsWith(domain)
      );
      if (!isCollegeEmail) {
        newErrors.email = "Please use your official college email address (e.g., yourname@collegename.edu)";
      }
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College name is required";
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID / Roll number is required";
    }
    
    if (!formData.branch.trim()) {
      newErrors.branch = "Branch / Department is required";
    }
    
    if (!formData.yearOfStudy) {
      newErrors.yearOfStudy = "Year of study is required";
    }
    
    if (!formData.graduationYear) {
      newErrors.graduationYear = "Expected graduation year is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (!formData.studentIdCard) {
      newErrors.studentIdCard = "Please upload your student ID card";
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    
    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep3()) {
      return;
    }
    
    setLoading(true);
    setApiError("");
    
    // Create FormData for file upload
    const submitData = new FormData();
    
    // Map frontend field names to backend expected names
    submitData.append('fullName', formData.fullName);
    submitData.append('email', formData.email);
    submitData.append('phoneNumber', formData.phoneNumber);
    submitData.append('password', formData.password);
    submitData.append('dateOfBirth', formData.dateOfBirth);
    submitData.append('gender', formData.gender);
    submitData.append('collegeName', formData.collegeName);
    submitData.append('studentId', formData.studentId);
    submitData.append('branch', formData.branch);
    submitData.append('yearOfStudy', formData.yearOfStudy);
    submitData.append('graduationYear', formData.graduationYear);
    
    // Append files
    if (formData.studentIdCard) {
      submitData.append('studentIdCard', formData.studentIdCard);
    }
    
    try {
      const response = await authAPI.register(submitData);
      
      if (response.success) {
        alert(`Registration successful! You can now login with your credentials.`);
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setApiError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (fieldName) => {
    setFormData({ ...formData, [fieldName]: null });
    setPreviewImages({ ...previewImages, [fieldName]: null });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex justify-center items-center py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Student Registration</h1>
              <p className="text-blue-100 mt-1">Join SunoCampus Community</p>
            </div>
            <Link to="/" className="text-white hover:text-blue-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-100">Step {step} of 3</span>
              <span className="text-sm text-blue-100">{Math.round((step / 3) * 100)}%</span>
            </div>
            <div className="h-2 bg-blue-400 bg-opacity-30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{apiError}</p>
            </div>
          )}
          
          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personal Details</h2>
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>

              {/* College Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="yourname@collegename.edu"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <p className="text-xs text-gray-500 mt-1">⚠️ Use your official college email for verification</p>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Phone & DOB */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="10-digit mobile number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    maxLength={10}
                    className={`w-full px-4 py-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {['Male', 'Female', 'Other'].map(gender => (
                    <label key={gender} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>
            </div>
          )}

          {/* Step 2: College Details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">College Details</h2>
              
              {/* College Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="collegeName"
                  placeholder="Enter your college name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.collegeName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.collegeName && <p className="text-red-500 text-sm mt-1">{errors.collegeName}</p>}
              </div>

              {/* Student ID & Branch */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID / Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    placeholder="e.g., 2022BCS001"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.studentId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch / Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="branch"
                    placeholder="e.g., Computer Science"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.branch ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
                </div>
              </div>

              {/* Year of Study & Graduation Year */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Year of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.yearOfStudy ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="5">5th Year</option>
                  </select>
                  {errors.yearOfStudy && <p className="text-red-500 text-sm mt-1">{errors.yearOfStudy}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.graduationYear ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select year</option>
                    {Array.from({ length: 10 }, (_, i) => 2026 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.graduationYear && <p className="text-red-500 text-sm mt-1">{errors.graduationYear}</p>}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Verification Required</p>
                    <p className="mt-1">Your college details will be verified against your college email and ID card in the next step.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Upload & Verification */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Verification Documents</h2>
              
              {/* Student ID Card Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Student ID Card <span className="text-red-500">*</span>
                </label>
                {!previewImages.studentIdCard ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      name="studentIdCard"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                      id="studentIdCard"
                    />
                    <label htmlFor="studentIdCard" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-blue-600 font-medium">Click to upload Student ID Card</p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2 border-blue-500">
                    <img src={previewImages.studentIdCard} alt="Student ID" className="w-full h-64 object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => removeImage('studentIdCard')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {errors.studentIdCard && <p className="text-red-500 text-sm mt-1">{errors.studentIdCard}</p>}
              </div>

              {/* Verification Process Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Verification Process</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Email verification link will be sent to your college email</li>
                      <li>Our team will verify your ID card within 24-48 hours</li>
                      <li>You'll receive notification once your account is verified</li>
                      <li>Until verification, your account will have limited access</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                    . I confirm that all information provided is accurate and I am a legitimate student of the mentioned college.
                  </span>
                </label>
                {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
