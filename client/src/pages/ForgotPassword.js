import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const email = watch('email');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/forgot-password', {
        email: data.email
      });

      if (response.status === 200) {
        setSubmitted(true);
        toast.success('Password reset instructions sent to your email!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center animate-fadeInUp">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-8 text-left">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Check your spam or promotions folder if you don't see the email in your inbox.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-primary flex items-center justify-center gap-2"
              >
                <span>Send Another Email</span>
              </button>
              <Link
                to="/login"
                className="btn btn-outline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-95 border border-gray-100 animate-slideInRight">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500 group-focus-within:text-purple-600 transition-colors" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span> {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <div className="loading-spinner h-5 w-5"></div>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <Mail className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-purple-600 transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
