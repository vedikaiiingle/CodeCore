import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function SignupForm({ onSuccess }) {
  const { signup } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setErr('All fields are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErr('Invalid email');
      return;
    }
    if (form.password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      setErr('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      onSuccess();
    } catch (e) {
      setErr('Registration failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-2 text-center">Create your account</h2>
      {err && <div className="text-red-600 text-sm text-center">{err}</div>}
      <input
        type="text"
        className="input w-full"
        placeholder="Username"
        name="username"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        className="input w-full"
        placeholder="Email address"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        className="input w-full"
        placeholder="Password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
        minLength={6}
      />
      <input
        type="password"
        className="input w-full"
        placeholder="Confirm Password"
        name="confirm"
        value={form.confirm}
        onChange={handleChange}
        required
        minLength={6}
      />
      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </form>
  );
} 