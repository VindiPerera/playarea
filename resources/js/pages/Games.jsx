import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── Add/Edit Game Modal ───────────────────────────────────────────────────────
function GameModal({ token, onClose, onSaved, editGame = null }) {
    const isEditing = !!editGame;
    const [form,    setForm]    = useState({ 
        name: editGame?.name || '', 
        coin_id: editGame?.coin_id || '' 
    });
    const [errors,  setErrors]  = useState({});
    const [loading, setLoading] = useState(false);
    const [coins,   setCoins]   = useState([]);

    useEffect(() => {
        if (!token) return;
        
        // Fetch coins for dropdown
        fetch('/api/coins', { 
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch coins');
                return res.json();
            })
            .then(data => setCoins(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error('Error loading coins:', err);
                setCoins([]);
            });
    }, [token]);

    const handleChange = (e) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const url = isEditing ? `/api/games/${editGame.id}` : '/api/games';
            const method = isEditing ? 'PUT' : 'POST';
            
            const res  = await fetch(url, {
                method:  method,
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
                onSaved(data, isEditing);
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-800">
                        {isEditing ? 'Edit Game' : 'Add Game'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {errors.general && (
                    <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        {errors.general[0]}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Game Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Game Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Speed Racer"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
                    </div>

                    {/* Coin Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Coin Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="coin_id"
                            value={form.coin_id}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                        >
                            <option value="">-- Select a coin --</option>
                            {coins.map(coin => (
                                <option key={coin.id} value={coin.id}>
                                    {coin.name} - LKR {parseFloat(coin.price).toFixed(2)}
                                </option>
                            ))}
                        </select>
                        {errors.coin_id && <p className="mt-1 text-xs text-red-500">{errors.coin_id[0]}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2.5 text-sm font-semibold transition"
                        >
                            {loading ? 'Saving…' : (isEditing ? 'Update Game' : 'Add Game')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Game Card ─────────────────────────────────────────────────────────────────
const GAME_STYLE = {
    default: { bg: 'bg-red-600',  emoji: '🎮' },
};

function getStyle(name) {
    const n = name.toLowerCase();
    if (n.includes('car'))   return { bg: 'bg-red-600',   emoji: '🚗' };
    if (n.includes('bike'))  return { bg: 'bg-blue-600',  emoji: '🏍️' };
    if (n.includes('teddy')) return { bg: 'bg-pink-600',  emoji: '🧸' };
    return GAME_STYLE.default;
}

function GameCard({ game, token, onDeleted, onEdit }) {
    const { bg, emoji } = getStyle(game.name);
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async () => {
        try {
            await fetch(`/api/games/${game.id}`, {
                method:  'DELETE',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            onDeleted(game.id);
        } catch (_) {}
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Coloured top strip */}
            <div className={`${bg} flex items-center justify-center py-6`}>
                <span className="text-5xl">{emoji}</span>
            </div>

            <div className="p-5">
                {/* Name */}
                <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{game.name}</h3>

                {/* Details */}
                <div className="space-y-2 text-sm mt-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Coin Type:</span>
                        <span className="font-semibold text-gray-800">
                            {game.coin?.name || 'N/A'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Coin Price:</span>
                        <span className="font-semibold text-gray-800">
                            LKR {game.coin ? parseFloat(game.coin.price).toFixed(2) : '0.00'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Added:</span>
                        <span className="text-gray-700 font-medium">
                            {new Date(game.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 flex items-center justify-center py-3 gap-3">
                {confirming ? (
                    <>
                        <span className="text-xs text-gray-300">Delete this game?</span>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition"
                        >
                            No
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => onEdit(game)}
                            className="text-blue-400 hover:text-blue-300 transition"
                            title="Edit game"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setConfirming(true)}
                            className="text-red-400 hover:text-red-300 transition"
                            title="Delete game"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Games Page ────────────────────────────────────────────────────────────────
export default function Games() {
    const { token }                   = useAuth();
    const navigate                    = useNavigate();
    const [games,     setGames]       = useState([]);
    const [loading,   setLoading]     = useState(true);
    const [search,    setSearch]      = useState('');
    const [showModal, setShowModal]   = useState(false);
    const [editingGame, setEditingGame] = useState(null);

    useEffect(() => {
        if (!token) return;
        
        fetch('/api/games', {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
            .then(r => {
                if (!r.ok) throw new Error('Failed to fetch games');
                return r.json();
            })
            .then(data => setGames(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error('Error loading games:', err);
                setGames([]);
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleSaved   = (game, isEditing) => {
        if (isEditing) {
            setGames(prev => prev.map(g => g.id === game.id ? game : g));
        } else {
            setGames(prev => [game, ...prev]);
        }
    };
    const handleDeleted = (id)   => setGames(prev => prev.filter(g => g.id !== id));
    const handleEdit = (game) => {
        setEditingGame(game);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingGame(null);
    };

    const filtered = games.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Page header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-500 hover:text-gray-700 transition text-xl font-bold"
                        >
                            ‹
                        </button>
                        <h1 className="text-2xl font-extrabold tracking-wide text-gray-800 uppercase">
                            Games
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-4 py-1.5">
                            <span className="text-sm font-bold">{games.length}</span>
                            <span className="text-xs text-gray-400">/ Total Games</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition"
                        >
                            + Add Game
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by game name..."
                        className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>

                {/* Cards */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading games…</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-4xl mb-3">🎮</p>
                        <p className="font-medium">No games found.</p>
                        {games.length === 0 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                            >
                                Add your first game
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {filtered.map(g => (
                            <GameCard
                                key={g.id}
                                game={g}
                                token={token}
                                onDeleted={handleDeleted}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                )}
            </main>

            {showModal && (
                <GameModal
                    token={token}
                    onClose={handleCloseModal}
                    onSaved={handleSaved}
                    editGame={editingGame}
                />
            )}
        </div>
    );
}
