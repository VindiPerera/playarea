import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { token }                         = useAuth();
    const navigate                          = useNavigate();
    const [form, setForm]                   = useState({
        entrance_base_price: '',
        entrance_base_duration: '',
        entrance_stage1_price: '',
        entrance_stage1_duration: '',
        entrance_above10_price: ''
    });
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
                setForm({
                    entrance_base_price: data.entrance_base_price ?? '0',
                    entrance_base_duration: data.entrance_base_duration ?? '0',
                    entrance_stage1_price: data.entrance_stage1_price ?? '',
                    entrance_stage1_duration: data.entrance_stage1_duration ?? '',
                    entrance_above10_price: data.entrance_above10_price ?? ''
                });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

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
                body: JSON.stringify(form),
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
                                <p className="text-white font-bold text-sm uppercase tracking-wider">Entrance Fee Pricing</p>
                                <p className="text-gray-300 text-xs mt-0.5">Configure time-based entrance fee with pricing stages</p>
                            </div>
                            <form onSubmit={handleSave} className="p-5 space-y-5">

                                {/* Base */}
                                <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Base Price
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Price (LKR) <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">LKR</span>
                                                <input type="number" min="0" step="0.01" value={form.entrance_base_price}
                                                    onChange={e => handleChange('entrance_base_price', e.target.value)} required placeholder="0.00"
                                                    className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (mins) <span className="text-red-500">*</span></label>
                                            <input type="number" min="1" value={form.entrance_base_duration}
                                                onChange={e => handleChange('entrance_base_duration', e.target.value)} required placeholder="30"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                {/* Stage 1 */}
                                <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1st Stage — Recurring (Optional)
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Extra Price (LKR)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">LKR</span>
                                                <input type="number" min="0" step="0.01" value={form.entrance_stage1_price}
                                                    onChange={e => handleChange('entrance_stage1_price', e.target.value)} placeholder="0.00"
                                                    className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Every (mins)</label>
                                            <input type="number" min="1" value={form.entrance_stage1_duration}
                                                onChange={e => handleChange('entrance_stage1_duration', e.target.value)} placeholder="10"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                {/* Above Age 10 */}
                                <div>
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Above Age 10 Entrance Fee
                                    </p>
                                    <p className="text-xs text-gray-400 mb-3">Flat rate — no time stages. Applied per person over age 10.</p>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Price (LKR)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">LKR</span>
                                            <input type="number" min="0" step="0.01" value={form.entrance_above10_price}
                                                onChange={e => handleChange('entrance_above10_price', e.target.value)} placeholder="0.00"
                                                className="w-full border border-gray-300 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                                        </div>
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
