import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../../contexts/AppContext';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    const { user, isAuthenticated } = useAppContext();

    // Check if user is admin
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={styles.adminContainer}>
            <AdminSidebar />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;