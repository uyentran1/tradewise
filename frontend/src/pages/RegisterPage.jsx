import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api';
import Layout from '../layouts/Layout';
import OTPVerification from '../components/OTPVerification';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleOTPVerificationSuccess = (result) => {
    if (result.registrationComplete) {
      setMessage('Registration completed successfully! Redirecting to login...');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setShowOTPVerification(false);
      setTempToken('');
      setTimeout(() => navigate('/login'), 1000);
    } else {
      // For login verification (shouldn't happen here but keeping for safety)
      login(result.token);
      navigate('/');
    }
  };

  const handleOTPCancel = () => {
    setShowOTPVerification(false);
    setTempToken('');
    setMessage('Registration cancelled. Please try again.');
  };

  const handleGoogleSignup = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await API.post('/auth/google', {
        credential: credentialResponse.credential
      });
      login(res.data.token);
      setMessage('Account created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Google signup error:', err);
      const errorMsg = err?.response?.data?.error || 'Google signup failed. Please try again.';
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setMessage('Passwords do not match');
    }

    if (password.length < 8) {
      return setMessage('Password must be at least 8 characters long');
    }

    setIsLoading(true);

    try {
      const res = await API.post('/auth/register', { fullName, email, password });

      // Check if verification is required
      if (res.data.requiresVerification) {
        setTempToken(res.data.tempToken);
        setShowOTPVerification(true);
        setMessage(res.data.message || 'Please check your email for the verification code.');
      } else {
        // This shouldn't happen but keeping for safety
        setMessage('Account created successfully!');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirm('');
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || 'Registration failed. Please try again.';
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Show OTP verification if required
  if (showOTPVerification) {
    return (
      <OTPVerification
        tempToken={tempToken}
        onVerificationSuccess={handleOTPVerificationSuccess}
        onCancel={handleOTPCancel}
      />
    );
  }

  return (
    <Layout hideLink="register">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex justify-center items-center py-12 px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-slate-100 backdrop-blur-md border border-slate-200 p-8 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-slate-800">
                Create Account
              </h2>
              <p className="text-slate-600">
                Start tracking smart signals today.
              </p>
            </div>

            {/* From */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setMessage('');
                  }}
                  className="w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage('');
                  }}
                  className="w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage('');
                  }}
                  className="w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Create a secure password"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-slate-500 mt-1">Minimum 8 characters required</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setMessage('');
                  }}
                  className="w-full pl-12 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  placeholder="Confirm your password"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Terms */}
            <p className="text-xs text-slate-500 text-center mt-4">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>

            {/* Divider */}
            <div className="text-center my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm ">
                  <span className="bg-slate-100 px-4 text-slate-500">or continue with</span>
                </div>
              </div>
            </div>
            
            {/* Social Login */}
            <div className="flex justify-center mb-6">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSignup}
                  onError={() => {
                    setMessage('Google signup failed. Please try again.');
                  }}
                  width="384"
                  theme="outline"
                  text="signup_with"
                  shape="rectangular"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                Sign in
              </Link>
            </p>

            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl text-sm text-left ${
                message.includes('successfully') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <div className="whitespace-pre-line">
                  {message}
                </div>
              </div>
            )}
          </div>
          
          
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;