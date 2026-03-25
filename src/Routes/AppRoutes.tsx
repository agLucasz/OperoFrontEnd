import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../Pages/Auth/Login';
import Register from '../Pages/Auth/Register';
import Dashboard from '../Pages/Dashboard/Dashboard';

function Protected({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/" replace />;
    return <>{children}</>;
}

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
