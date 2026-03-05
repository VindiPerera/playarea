import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { token }                         = useAuth();
    const navigate                          = useNavigate();
    const [entranceFee, setEntranceFee]     = useState('');
    const [loading, setLoading]             = useState(true);
    const [saving, setSaving]               = useState(false);
    const [success, setSuccess]             = useState('');
    const [error, setError]                 = useState('');

    useEffect(() => {
        if (!token) return;
        fetch('/api/settings', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(data => {
                setEntranceFee(data.entrance_fee ?? '0');
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ entrance_fee: entranceFee }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to save settings.');
            } else {
                setSuccess('Settings saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (_) {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">‹</button>
                    <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">Settings</h1>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading…</div>
                ) : (
                    <div className="max-w-md">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 bg-[#455a64]">
                                <p className="text-white font-bold text-sm uppercase tracking-wider">General Settings</p>
                                <p className="text-gray-300 text-xs mt-0.5">Configure system-wide settings</p>
                            </div>
                            <form onSubmit={handleSave} className="p-5 space-y-5">
                                {/* Entrance Fee */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Entrance Fee (LKR) <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-gray-400 mb-2">This fee will be automatically added to every new open bill.</p>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">LKR</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={entranceFee}
                                            onChange={e => setEntranceFee(e.target.value)}
                                            required
                                            placeholder="0.00"
                                            className="w-full border border-gray-300 rounded-lg pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                                {success && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-xl py-3 text-sm font-bold uppercase tracking-wider transition"
                                >
                                    {saving ? 'Saving…' : 'Save Settings'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
