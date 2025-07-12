import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !password) {
      setErr('All fields are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErr('Invalid email');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (e) {
      setErr('Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Sign in to your account</h2>
      {err && <div className="text-red-600 text-sm text-center">{err}</div>}
      <input
        type="email"
        className="input w-full"
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="input w-full"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
} 