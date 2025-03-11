import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { theme } from '../config/theme';
import '../index.css';

const Registration = ({ onRegister, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      onRegister(data.user);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.primary.main }}>
      Hazard Identification and Risk Assessment
      <br />
      <br /> Create an Account
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: theme.colors.text.primary }}>
            Email address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm"
            style={{ 
              borderColor: theme.colors.border.light,
              backgroundColor: theme.colors.primary.light,
              '--tw-ring-color': theme.colors.primary.main,
              '--tw-ring-opacity': 0.5
            }}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: theme.colors.text.primary }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md shadow-sm"
            style={{ 
              borderColor: theme.colors.border.light,
              backgroundColor: theme.colors.primary.light,
              '--tw-ring-color': theme.colors.primary.main,
              '--tw-ring-opacity': 0.5
            }}
            placeholder="Create a password"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: theme.colors.primary.main,
            '--tw-ring-color': theme.colors.primary.main,
            ':hover': {
              backgroundColor: theme.colors.primary.hover
            }
          }}
        >
          Sign Up
        </button>
      </form>
      <p className="mt-4 text-center text-sm" style={{ color: theme.colors.text.secondary }}>
        Already have an account?{' '}
        <button
          onClick={onCancel}
          className="font-medium"
          style={{ color: theme.colors.primary.main }}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default Registration;
