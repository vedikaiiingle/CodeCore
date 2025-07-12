import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login');
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex justify-center mb-6">
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${mode === 'login' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 rounded-t-lg font-semibold ${mode === 'signup' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>
        {mode === 'login' ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <SignupForm onSuccess={onClose} />
        )}
      </div>
    </div>
  );
} 