import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconGamepad = () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <rect x="8" y="18" width="48" height="28" rx="10"/>
        <line x1="20" y1="28" x2="20" y2="36"/><line x1="16" y1="32" x2="24" y2="32"/>
        <circle cx="44" cy="28" r="2" fill="currentColor" stroke="none"/>
        <circle cx="44" cy="36" r="2" fill="currentColor" stroke="none"/>
        <circle cx="40" cy="32" r="2" fill="currentColor" stroke="none"/>
        <circle cx="48" cy="32" r="2" fill="currentColor" stroke="none"/>
    </svg>
);

const IconBilling = () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <rect x="8" y="14" width="48" height="36" rx="6"/>
        <line x1="8" y1="26" x2="56" y2="26"/>
        <rect x="16" y="34" width="10" height="6" rx="2"/>
    </svg>
);

const IconCustomer = () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <circle cx="26" cy="22" r="10"/>
        <path d="M6 54c0-11 9-18 20-18s20 7 20 18"/>
        <circle cx="46" cy="20" r="7"/>
        <path d="M56 50c0-8-5-13-10-14"/>
    </svg>
);

const IconReport = () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <rect x="10" y="8" width="44" height="48" rx="4"/>
        <line x1="20" y1="24" x2="44" y2="24"/>
        <line x1="20" y1="34" x2="44" y2="34"/>
        <line x1="20" y1="44" x2="34" y2="44"/>
        <polyline points="36,42 40,38 44,40 48,34"/>
    </svg>
);

const IconCoin = () => (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
        <circle cx="32" cy="32" r="22"/>
        <circle cx="32" cy="32" r="14"/>
        <text x="32" y="38" textAnchor="middle" fontSize="16" fontWeight="bold"
            stroke="none" fill="currentColor" fontFamily="Arial">$</text>
    </svg>
);

// ── Dashboard cards config ─────────────────────────────────────────────────────
const cards = [
  
    {
        key:   'billing',
        title: 'BILLING',
        desc:  'Create invoices, track payments and manage billing records for customers.',
        Icon:  IconBilling,
        bg:    '#1a237e',   // dark navy
        path:  '/billing',
    },
    
    {
        key:   'coins',
        title: 'COINS',
        desc:  'Create and manage coin packages with custom names and prices.',
        Icon:  IconCoin,
        bg:    '#6a1b9a',   // purple
        path:  '/coins',
    },
      {
        key:   'games',
        title: 'GAMES',
        desc:  'Browse car, bike and teddy bear games. Track player sessions and manage game listings.',
        Icon:  IconGamepad,
        bg:    '#e53935',   // red
        path:  '/games',
    },
    {
        key:   'customer',
        title: 'CUSTOMER',
        desc:  'Add and manage customers, assign games, and view customer details.',
        Icon:  IconCustomer,
        bg:    '#f9a825',   // yellow
        path:  '/customers',
    },
    {
        key:   'report',
        title: 'REPORT',
        desc:  'View summaries and analytics across games, customers and billing activity.',
        Icon:  IconReport,
        bg:    '#2e7d32',   // green
        path:  '/reports',
    },
];

// ── Card component ─────────────────────────────────────────────────────────────
function DashCard({ card, onClick }) {
    const { title, desc, Icon, bg, path } = card;
    const clickable = !!path;

    return (
        <div
            onClick={onClick}
            style={{ backgroundColor: bg }}
            className={`relative rounded-2xl p-8 flex flex-col items-center text-center text-white shadow-lg transition-all duration-200
                ${clickable ? 'cursor-pointer hover:scale-[1.03] hover:brightness-110' : 'cursor-default opacity-90'}`}
        >
            {/* Circular icon */}
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-inner">
                <div className="text-white">
                    <Icon />
                </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-extrabold tracking-widest mb-3 uppercase drop-shadow">
                {title}
            </h3>

            {/* Description */}
            <p className="text-sm text-white/85 leading-relaxed">
                {desc}
            </p>

            {/* Coming soon badge */}
            {!clickable && (
                <span className="mt-4 inline-block text-xs bg-black/20 rounded-full px-3 py-1 tracking-wide">
                    Coming Soon
                </span>
            )}
        </div>
    );
}

// ── Home page ──────────────────────────────────────────────────────────────────
export default function Home() {
    const { user } = useAuth();
    const navigate  = useNavigate();

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Welcome row */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Welcome back, <span className="text-red-600">{user?.name}</span>
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">Select a module to get started.</p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map(card => (
                        <DashCard
                            key={card.key}
                            card={card}
                            onClick={() => card.path && navigate(card.path)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
