import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import API from '../api';
import Layout from '../layouts/Layout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await API.post('/auth/google', {
        credential: credentialResponse.credential
      });
      login(res.data.token);
      setMessage('Login successful!');
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      const errorMsg = err?.response?.data?.error || 'Google login failed. Please try again.';
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token);
      setMessage('Login successful!');
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || 'Login failed. Please try again.';
      setMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideLink="login">
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
            <div className="text-center mb-8 mt-3">
              
              <h2 className="text-3xl font-bold mb-2 text-slate-800">
                Welcome Back
              </h2>
              <p className="text-slate-600">
                Sign in to access your trading dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full pl-20 pr-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                  placeholder="Enter your password"
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
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                Forgot your password?
              </Link>
            </div>

            {/* Divider */}
            <div className="text-center my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-100 text-slate-500 backdrop-blur-md">or continue with</span>
                </div>
              </div>
            </div>
            
            {/* Social Login */}
            <div className="flex justify-center mb-6">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    setMessage('Google login failed. Please try again.');
                  }}
                  width="384"
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors">
                Create account
              </Link>
            </p>
            
            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl text-sm text-center ${
                message.includes('success') 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>
             
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;