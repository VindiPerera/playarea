import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Service Modal ─────────────────────────────────────────────────────────────
function ServiceModal({ token, onClose, onSaved, editService }) {
    const [form, setForm] = useState({
        name: '', base_price: '', base_duration: '',
        stage1_duration: '', stage1_price: '',
        stage2_duration: '', stage2_price: '',
    });
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editService) {
            setForm({
                name:            editService.name || '',
                base_price:      editService.base_price || '',
                base_duration:   editService.base_duration || '',
                stage1_duration: editService.stage1_duration || '',
                stage1_price:    editService.stage1_price || '',
                stage2_duration: editService.stage2_duration || '',
                stage2_price:    editService.stage2_price || '',
            });
        }
    }, [editService]);

    const handleChange = (e) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = editService ? `/api/services/${editService.id}` : '/api/services';
            const method = editService ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    stage1_duration: form.stage1_duration || null,
                    stage1_price:    form.stage1_price || null,
                    stage2_duration: form.stage2_duration || null,
                    stage2_price:    form.stage2_price || null,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors(data.errors ?? { general: [data.message ?? 'Error'] });
            } else {
                onSaved(data);
                onClose();
            }
        } catch (_) {
            setErrors({ general: ['Network error. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-7 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">
                        {editService ? 'Edit Service' : 'Add Service'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                {errors.general && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errors.general[0]}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Service Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Service Name <span className="text-red-500">*</span>
                        </label>
                        <input name="name" value={form.name} onChange={handleChange} required
                            placeholder="e.g. Trampoline"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                    </div>

                    {/* Base Price & Duration */}
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-3">Base Pricing</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Price (LKR) <span className="text-red-500">*</span></label>
                                <input name="base_price" type="number" min="0" step="0.01" value={form.base_price} onChange={handleChange} required
                                    placeholder="500.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Duration (mins) <span className="text-red-500">*</span></label>
                                <input name="base_duration" type="number" min="1" value={form.base_duration} onChange={handleChange} required
                                    placeholder="30"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* Stage 1 */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">1st Stage (Optional)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Extra Duration (mins)</label>
                                <input name="stage1_duration" type="number" min="1" value={form.stage1_duration} onChange={handleChange}
                                    placeholder="15"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Additional Price (LKR)</label>
                                <input name="stage1_price" type="number" min="0" step="0.01" value={form.stage1_price} onChange={handleChange}
                                    placeholder="200.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* Stage 2 */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">2nd Stage – Recurring (Optional)</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Recurring Duration (mins)</label>
                                <input name="stage2_duration" type="number" min="1" value={form.stage2_duration} onChange={handleChange}
                                    placeholder="10"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Recurring Price (LKR)</label>
                                <input name="stage2_price" type="number" min="0" step="0.01" value={form.stage2_price} onChange={handleChange}
                                    placeholder="150.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-300 text-white rounded-lg py-2.5 text-sm font-bold transition">
                            {loading ? 'Saving…' : (editService ? 'Update Service' : 'Add Service')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Services Page ──────────────────────────────────────────────────────────────
export default function Services() {
    const { token }                       = useAuth();
    const navigate                        = useNavigate();
    const [services, setServices]         = useState([]);
    const [loading, setLoading]           = useState(true);
    const [showModal, setShowModal]       = useState(false);
    const [editService, setEditService]   = useState(null);
    const [search, setSearch]             = useState('');

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services', {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            const data = await res.json();
            setServices(Array.isArray(data) ? data : []);
        } catch (_) {
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (token) fetchServices(); }, [token]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await fetch(`/api/services/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (_) {}
    };

    const handleSaved = () => {
        fetchServices();
        setEditService(null);
    };

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">‹</button>
                    <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">Services</h1>
                </div>

                {/* Search + Add */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search services…"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                        />
                    </div>
                    <button onClick={() => { setEditService(null); setShowModal(true); }}
                        className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2">
                        <span className="text-lg leading-none">+</span> Add Service
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading…</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-3">🎯</p>
                        <p className="text-gray-400 text-sm">No services found. Add your first service!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map(service => (
                            <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                {/* Header */}
                                <div className="bg-[#00838f] px-5 py-4">
                                    <p className="text-white font-bold text-base">{service.name}</p>
                                </div>

                                {/* Body */}
                                <div className="p-5 space-y-3">
                                    {/* Base */}
                                    <div className="bg-teal-50 rounded-xl p-3">
                                        <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">Base</p>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">LKR {parseFloat(service.base_price).toFixed(2)}</span>
                                            <span className="text-gray-500">{service.base_duration} mins</span>
                                        </div>
                                    </div>

                                    {/* Stage 1 */}
                                    {service.stage1_duration && service.stage1_price && (
                                        <div className="bg-amber-50 rounded-xl p-3">
                                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">1st Stage</p>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">+LKR {parseFloat(service.stage1_price).toFixed(2)}</span>
                                                <span className="text-gray-500">+{service.stage1_duration} mins</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Stage 2 */}
                                    {service.stage2_duration && service.stage2_price && (
                                        <div className="bg-red-50 rounded-xl p-3">
                                            <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">2nd Stage (Recurring)</p>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">+LKR {parseFloat(service.stage2_price).toFixed(2)}</span>
                                                <span className="text-gray-500">every {service.stage2_duration} mins</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
                                    <button onClick={() => { setEditService(service); setShowModal(true); }}
                                        className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(service.id)}
                                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showModal && (
                    <ServiceModal
                        token={token}
                        editService={editService}
                        onClose={() => { setShowModal(false); setEditService(null); }}
                        onSaved={handleSaved}
                    />
                )}
            </main>
        </div>
    );
}
