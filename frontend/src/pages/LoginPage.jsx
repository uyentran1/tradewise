import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import Layout from '../layouts/Layout';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent browser to reload page

    try {
      const res = await API.post('/auth/login', { email, password });

      // localStorage.setItem('token', res.data.token); // Store the token
      login(res.data.token); // Stores token and decodes user

      setMessage('Login successful!');
      setEmail('');
      setPassword('');

      navigate('/'); // Redirect to HomePage
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || 'Login failed. Please try again.';
      setMessage(errorMsg);
    } 
  };

  return (
    <Layout showSearch={false} hideLink="login">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex justify-center items-center py-12 px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5"></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white border border-purple-200 p-8 rounded-2xl shadow-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Welcome back 👋
              </h2>
              <p className="text-gray-600">
                Log in to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage('');
                  }}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setMessage('');
                  }}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-pink-50/50 to-blue-50/50"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Log In
              </button>
            </form>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                Forgot your password?
              </Link>
            </div>

            {/* Social Login */}
            <div className="text-center my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or log in with</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mb-6">
              <button className="w-12 h-12 border border-purple-200 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group">
                <img src="/google-icon.svg" alt="Google login" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition-colors">
                Sign up.
              </Link>
            </p>
            
            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl text-sm text-center border ${
                message.includes('success') 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {message}
              </div>
            )}
          </div>
          
          {/* Bottom decoration */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Secure login • Protected by industry-standard encryption</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;