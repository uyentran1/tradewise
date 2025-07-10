import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Layout from '../layouts/Layout';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      return setMessage('Passwords do not match');
    }

    try {
      await API.post('/auth/register', { fullName, email, password });

      setMessage('Registration successful! You can now log in.');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirm('');
    } catch (err) {
      console.error(err);
      const errorMsg =
        err?.response?.data?.error || 'Registration failed. Please try again.';
      setMessage(errorMsg);
    }
  };

  return (
    <Layout showSearch={false} hideLink="register">
      <div className="flex justify-center items-center py-12 px-6">
        <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Create Your Account</h2>
          <p className="text-center text-gray-600 mb-6">
            Start tracking smarter signals today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setMessage('');
              }}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
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
            <input
              type="password"
              name="confirm"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setMessage('');
              }}
              className="w-full p-3 border border-gray-300 rounded"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </form>

          <div className="text-center my-4 text-gray-600">or sign up with</div>
          <div className="flex justify-center mb-4">
            <button className="w-10 h-10 border rounded-full flex items-center justify-center">
              <img src="/google-icon.svg" alt="Sign up with Google" className="w-6 h-6" />
            </button>
          </div>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log in.
            </Link>
          </p>

          {message && (
            <p
              className={`mt-4 text-sm text-center ${
                message.includes('successful') ? 'text-green-600' : 'text-red-600'
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

export default RegisterPage;