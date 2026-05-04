import React from 'react';

export const Sidebar = ({ isOpen }) => {
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
        </nav>
      </div>
    </aside>
  );
};

export const Navbar = ({ userName, onLogout }) => {
  return (
    <nav className="navbar fixed top-0 right-0 left-0 md:left-64 z-40 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">Welcome back!</h2>
        <div className="flex items-center gap-4">
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
