import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login     from './pages/Login';
import Home      from './pages/Home';
import Customers from './pages/Customers';
import Games     from './pages/Games';
import Billing   from './pages/Billing';
import Coins     from './pages/Coins';
import Reports   from './pages/Reports';
import Services  from './pages/Services';
import Settings  from './pages/Settings';

// ── Protected wrapper ─────────────────────────────────────────────────────────
function Private({ children }) {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login"      element={<Login />} />
                    <Route path="/customers"  element={<Private><Customers /></Private>} />
                    <Route path="/games"      element={<Private><Games /></Private>} />
                    <Route path="/billing"    element={<Private><Billing /></Private>} />
                    <Route path="/coins"      element={<Private><Coins /></Private>} />
                    <Route path="/reports"    element={<Private><Reports /></Private>} />
                    <Route path="/services"   element={<Private><Services /></Private>} />
                    <Route path="/settings"   element={<Private><Settings /></Private>} />
                    <Route path="/*"          element={<Private><Home /></Private>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

createRoot(document.getElementById('app')).render(<App />);
