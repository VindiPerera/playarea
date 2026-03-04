import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U';

    const handleLogout = async () => {
        setOpen(false);
        await logout();
    };

    return (
        <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-3 shadow-sm">

            {/* Left — Logo */}
            <div className="flex items-center gap-4">
                <img
                    src="/images/jaan_logo.jpg"
                    alt="JAAN Network"
                    className="h-12 w-auto object-contain"
                />

                {/* Title */}
                <div className="hidden sm:block">
                    <p className="text-sm font-bold text-gray-800 leading-tight">PlayArea</p>
                    <p className="text-xs text-gray-500 leading-tight">Games Platform</p>
                </div>
            </div>

            {/* Right — User */}
            <div className="relative">
                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    {/* Avatar circle */}
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-sm font-bold select-none">
                        {initial}
                    </span>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                        {user?.name ?? 'User'}
                    </span>
                    {/* Chevron */}
                    <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
