import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requireAdmin = false }: { requireAdmin?: boolean }) => {
    const { user, token } = useAuth();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user?.role !== 'admin') {
        // Optionally redirect unauthorized users
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
