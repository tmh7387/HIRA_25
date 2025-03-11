import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { theme } from '../config/theme';
import '../index.css';

const SignIn = ({ onSignIn, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onSignIn(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${crypto.randomUUID()}@anonymous.user`,
        password: crypto.randomUUID(),
      });
      
      if (error) throw error;
      onSignIn(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: theme.colors.primary.main }}>
        Hazard Identification and Risk Assessment
      <br /> Sign In 
      </h2>
      {error && <p style={{ color: theme.colors.text.primary }} className="mb-4">{error}</p>}
      <form onSubmit={handleSignIn} className="space-y-4">
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
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          style={{ 
            backgroundColor: theme.colors.primary.main,
            '--tw-ring-color': theme.colors.primary.main
          }}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <div className="border-t flex-grow" style={{ borderColor: theme.colors.border.light }}></div>
        <span className="px-4 text-sm" style={{ color: theme.colors.text.secondary }}>or</span>
        <div className="border-t flex-grow" style={{ borderColor: theme.colors.border.light }}></div>
      </div>

      <button
        onClick={handleAnonymousSignIn}
        disabled={isLoading}
        className="w-full mt-4 py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
        style={{ 
          borderColor: theme.colors.border.light,
          color: theme.colors.text.primary,
          backgroundColor: 'white',
          '--tw-ring-color': theme.colors.primary.main
        }}
      >
        {isLoading ? 'Processing...' : 'Continue as Guest'}
      </button>

      <p className="mt-4 text-center text-sm" style={{ color: theme.colors.text.secondary }}>
        Don't have an account?{' '}
        <button
          onClick={onRegisterClick}
          className="font-medium"
          style={{ color: theme.colors.primary.main }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default SignIn;
