import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Product Form Modal (Add / Edit) ───────────────────────────────────────────
function ProductModal({ token, product, onClose, onSaved }) {
    const isEdit = !!product;
    const [form, setForm] = useState({
        name:       product?.name       ?? '',
        cost_price: product?.cost_price ?? '',
        sell_price: product?.sell_price ?? '',
        discount:   product?.discount   ?? '0',
    });
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url    = isEdit ? `/api/products/${product.id}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';
            const res    = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept:         'application/json',
                    Authorization:  `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) {
                setErrors(data.errors ?? { general: [data.message ?? 'Error'] });
            } else {
                onSaved(data, isEdit);
                onClose();
            }
        } catch (_) {
            setErrors({ general: ['Network error. Please try again.'] });
        } finally {
            setLoading(false);
        }
    };

    const discount   = parseFloat(form.discount) || 0;
    const sellPrice  = parseFloat(form.sell_price) || 0;
    const effective  = sellPrice * (1 - discount / 100);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">
                        {isEdit ? 'Edit Product' : 'Add Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>

                {errors.general && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {errors.general[0]}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Soft Drink"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                    </div>

                    {/* Cost Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cost Price (LKR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">LKR</span>
                            <input
                                name="cost_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.cost_price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                        {errors.cost_price && <p className="mt-1 text-xs text-red-500">{errors.cost_price[0]}</p>}
                    </div>

                    {/* Sell Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sell Price (LKR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">LKR</span>
                            <input
                                name="sell_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.sell_price}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg pl-14 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                        </div>
                        {errors.sell_price && <p className="mt-1 text-xs text-red-500">{errors.sell_price[0]}</p>}
                    </div>

                    {/* Discount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Discount (%)
                        </label>
                        <div className="relative">
                            <input
                                name="discount"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={form.discount}
                                onChange={handleChange}
                                placeholder="0"
                                className="w-full border border-gray-300 rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">%</span>
                        </div>
                        {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount[0]}</p>}
                        {discount > 0 && sellPrice > 0 && (
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                Effective price: LKR {effective.toFixed(2)}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg py-2.5 text-sm font-semibold transition">
                            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Product Card ──────────────────────────────────────────────────────────────
const PRODUCT_COLORS = [
    'bg-emerald-600', 'bg-teal-600', 'bg-cyan-600',
    'bg-indigo-600',  'bg-violet-600', 'bg-rose-600',
];

function ProductCard({ product, index, token, onDeleted, onEdit }) {
    const bg = PRODUCT_COLORS[index % PRODUCT_COLORS.length];
    const [confirming, setConfirming] = useState(false);

    const discount      = parseFloat(product.discount) || 0;
    const sellPrice     = parseFloat(product.sell_price);
    const effectivePrice = sellPrice * (1 - discount / 100);

    const handleDelete = async () => {
        try {
            await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            onDeleted(product.id);
        } catch (_) {}
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Coloured top */}
            <div className={`${bg} flex flex-col items-center justify-center py-7 gap-1`}>
                <span className="text-4xl">📦</span>
                <span className="text-white font-bold text-sm mt-1 tracking-wide uppercase text-center px-3">
                    {product.name}
                </span>
                {discount > 0 && (
                    <span className="mt-1 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {discount}% OFF
                    </span>
                )}
            </div>

            <div className="p-5">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Cost:</span>
                        <span className="font-bold text-gray-800">
                            LKR {parseFloat(product.cost_price).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Sell:</span>
                        <span className={`font-bold ${discount > 0 ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            LKR {sellPrice.toFixed(2)}
                        </span>
                    </div>
                    {discount > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Effective:</span>
                            <span className="font-bold text-emerald-600 text-base">
                                LKR {effectivePrice.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Added:</span>
                        <span className="text-gray-700 font-medium">
                            {new Date(product.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 flex items-center justify-center py-3 gap-4">
                {confirming ? (
                    <>
                        <span className="text-xs text-gray-300">Delete?</span>
                        <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-xs font-semibold transition">Yes</button>
                        <button onClick={() => setConfirming(false)} className="text-gray-400 hover:text-white text-xs transition">No</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => onEdit(product)} className="text-gray-400 hover:text-white transition" title="Edit product">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button onClick={() => setConfirming(true)} className="text-gray-400 hover:text-white transition" title="Delete product">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Products Page ─────────────────────────────────────────────────────────────
export default function Products() {
    const { token }  = useAuth();
    const navigate   = useNavigate();

    const [products,   setProducts]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [showModal,  setShowModal]  = useState(false);
    const [editTarget, setEditTarget] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetch('/api/products', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => r.json())
            .then(d => setProducts(Array.isArray(d) ? d : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [token]);

    const handleSaved = (saved, isEdit) => {
        if (isEdit) {
            setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
        } else {
            setProducts(prev => [saved, ...prev]);
        }
    };

    const handleEdit = (product) => {
        setEditTarget(product);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditTarget(null);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            {showModal && (
                <ProductModal
                    token={token}
                    product={editTarget}
                    onClose={handleCloseModal}
                    onSaved={handleSaved}
                />
            )}

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Title row */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-700 text-xl font-bold transition">‹</button>
                        <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">Products</h1>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Product
                    </button>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-20">Loading…</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">📦</p>
                        <p className="text-gray-500 font-medium">No products yet.</p>
                        <p className="text-sm text-gray-400 mt-1">Click "Add Product" to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product, i) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                index={i}
                                token={token}
                                onDeleted={(id) => setProducts(prev => prev.filter(p => p.id !== id))}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
