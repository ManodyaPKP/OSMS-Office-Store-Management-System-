import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen }) => {
  const { hasRole } = useAuth();

  return (
    <aside className={`sidebar transition-all duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-8">📦 Store MS</h1>
        <nav className="space-y-3">
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/departments" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">🏢</span>
            <span>Departments</span>
          </a>
          <a href="/assets" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">📦</span>
            <span>Assets</span>
          </a>
          <a href="/repairs" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">🔧</span>
            <span>Repairs</span>
          </a>

          <div className="my-4 border-t border-slate-700"></div>
          
          <a href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">👤</span>
            <span>My Profile</span>
          </a>
          
          <a href="/messages" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
            <span className="text-lg">💬</span>
            <span>Messages</span>
          </a>

          {hasRole(['admin']) && (
            <>
              <div className="my-4 border-t border-slate-700"></div>
              <a href="/approvals" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-slate-800 transition-colors">
                <span className="text-lg">📋</span>
                <span>Registration Approvals</span>
              </a>
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export const Navbar = ({ userName, onLogout }) => {
  const { hasRole } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  React.useEffect(() => {
    loadCounts();
    // Refresh counts every 15 seconds
    const interval = setInterval(loadCounts, 15000);
    return () => clearInterval(interval);
  }, [hasRole]);

  const loadCounts = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    if (hasRole(['admin'])) {
      try {
        const response = await fetch('http://localhost:5000/api/users/registrations/pending', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data && data.success && Array.isArray(data.data)) {
          setPendingCount(data.data.length);
        }
      } catch (error) {
        console.debug('Failed to load pending count:', error);
      }
    }

    // Load unread messages
    try {
      const response = await fetch('http://localhost:5000/api/messages/unread/count', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data && data.success) {
        setUnreadMessages(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.debug('Failed to load unread messages:', error);
    }
  };

  return (
    <nav className="navbar fixed top-0 right-0 left-0 md:left-64 z-40 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Welcome back!</h2>
        <div className="flex items-center gap-4">
          {unreadMessages > 0 && (
            <a 
              href="/messages" 
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-lg hover:shadow-md transition-all hover:border-blue-400"
              title="View messages"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-semibold text-blue-900">
                {unreadMessages > 0 ? `${unreadMessages} New` : 'Messages'}
              </span>
              {unreadMessages > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </a>
          )}

          {hasRole(['admin']) && pendingCount > 0 && (
            <a 
              href="/approvals" 
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg hover:shadow-md transition-all hover:border-amber-400"
              title="View pending registration approvals"
            >
              <span className="text-lg">📋</span>
              <span className="text-sm font-semibold text-amber-900">
                {pendingCount > 0 ? `${pendingCount} Pending` : 'Approvals'}
              </span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </a>
          )}
          <span className="text-sm text-slate-600">{userName}</span>
          <button onClick={onLogout} className="btn-secondary text-sm">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export const MainLayout = ({ children, userName, onLogout, sidebarOpen }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-1 md:ml-0">
        <Navbar userName={userName} onLogout={onLogout} />
        <main className="mt-20 p-4 md:p-8">
          <div className="container-main">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
