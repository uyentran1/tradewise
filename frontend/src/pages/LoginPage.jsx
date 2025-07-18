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
      <div className="flex justify-center items-center py-12 px-6">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Welcome back 👋</h2>
          <p className="text-center text-gray-600 mb-6">Log in to access your dashboard.</p>
          <div className="flex justify-center items-center flex-1 px-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setMessage('');
                }}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMessage('');
                }}
                className="w-full p-3 border border-gray-300 rounded"
                required
              />
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
              >
                Log In
              </button>
            </form>
          </div>
          <div className="text-center my-4 text-gray-600">or log in with</div>
          <div className="flex justify-center mb-4">
            <button className="w-10 h-10 border rounded-full flex items-center justify-center">
              <img src="/google-icon.svg" alt="Google login" className="w-6 h-6" />
            </button>
          </div>

          <p className="text-center text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Sign up.
            </Link>
          </p>
          
          {message && (
            <p
              className={`mt-4 text-sm text-center ${
                message.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message}
            </p>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;