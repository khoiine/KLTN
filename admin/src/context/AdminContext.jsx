import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';

export const AdminContext = createContext();

const AdminContextProvider = ({ children, token }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            if (!token) {
                setUnreadCount(0);
                return;
            }
            const response = await axios.get(
                backendUrl + '/api/chat/admin-unread-count',
                { headers: { token } }
            );
            if (response.data.success) {
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000);
            return () => clearInterval(interval);
        }
    }, [token]);

    const value = {
        unreadCount,
        setUnreadCount,
        fetchUnreadCount
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;