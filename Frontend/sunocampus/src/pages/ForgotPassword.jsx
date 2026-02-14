import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex justify-center items-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Branding */}
          <div className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 text-white flex flex-col justify-center">
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-blue-100">Don't worry, we'll help you reset it</p>
              </div>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Check Your Email</h3>
                    <p className="text-blue-100 text-sm">We'll send you a password reset link</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Process</h3>
                    <p className="text-blue-100 text-sm">The reset link expires in 1 hour for security</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-white bg-opacity-20 rounded-full p-2 mt-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Quick & Easy</h3>
                    <p className="text-blue-100 text-sm">Reset your password in just a few clicks</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-white border-opacity-20">
                <p className="text-sm text-blue-100">
                  Remember your password?{" "}
                  <Link to="/login" className="text-white font-semibold hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="md:w-1/2 p-8 sm:p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Reset Password</h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {success ? (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="font-semibold text-green-800 mb-1">Email Sent!</h3>
                        <p className="text-sm text-green-700">
                          We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-sm text-green-700 mt-2">
                          Please check your email and click the link to reset your password.
                          The link will expire in 1 hour.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Didn't receive the email?</h4>
                    <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure you entered the correct email</li>
                      <li>Wait a few minutes and check again</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSuccess(false);
                        setEmail("");
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Send Another Link
                    </button>
                    <Link
                      to="/login"
                      className="block w-full text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex gap-2">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        className={`block w-full pl-10 pr-3 py-3 border ${
                          error ? "border-red-300 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="your.email@college.edu"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg transition-all ${
                      isLoading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:from-blue-700 hover:to-purple-700 hover:shadow-xl transform hover:-translate-y-0.5"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      ← Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
