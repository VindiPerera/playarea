import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate   = useNavigate();

    const [form,    setForm]    = useState({ email: '', password: '' });
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res  = await fetch('/api/login', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body:    JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                const msg = data.errors?.email?.[0] ?? data.message ?? 'Login failed.';
                setError(msg);
            } else {
                login(data.user, data.token);
                navigate('/', { replace: true });
            }
        } catch (_) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/images/jaan_logo.jpg"
                        alt="JAAN Network"
                        className="h-16 w-auto object-contain mb-3"
                    />
                    <h1 className="text-xl font-bold text-gray-800">PlayArea</h1>
                    <p className="text-sm text-gray-500">Games Platform</p>
                </div>

                <h2 className="text-lg font-semibold text-gray-700 mb-6 text-center">
                    Sign in to your account
                </h2>

                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="admin@playarea.com"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
