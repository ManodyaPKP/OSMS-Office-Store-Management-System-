import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetAPI } from '../services/api';
import { getErrorMessage, getStatusLabel, getStatusColor } from '../utils/helpers';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  Laptop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Desktop: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Printer: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  ),
  Monitor: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Other: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Hash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const color = getStatusColor(status);
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}15`, color: color }}
    >
      {getStatusLabel(status)}
    </span>
  );
};

// ─── Asset Type Icon ─────────────────────────────────────────────────────────
const AssetTypeIcon = ({ type }) => {
  const icons = {
    laptop: <Icons.Laptop />,
    desktop: <Icons.Desktop />,
    printer: <Icons.Printer />,
    monitor: <Icons.Monitor />,
    other: <Icons.Other />,
  };
  return icons[type] || <Icons.Other />;
};

// ─── Filter Select ───────────────────────────────────────────────────────────
const FilterSelect = ({ value, onChange, options, label }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="appearance-none pl-3 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer transition-all"
    >
      <option value="">{label}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
      <Icons.ChevronDown />
    </div>
  </div>
);

// ─── Section Card ────────────────────────────────────────────────────────────
const SectionCard = ({ children, className = '', delay = 0 }) => (
  <div
    className={`
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
      rounded-2xl border border-slate-200/80 dark:border-slate-700/80
      shadow-sm hover:shadow-xl
      transition-all duration-300
      animate-fadeInUp
      ${className}
    `}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, delay = 0 }) => {
  const accentMap = {
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };
  
  return (
    <div
      className="group relative overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out animate-fadeInUp"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${accentMap[accent]}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${accentMap[accent]} bg-opacity-100 shadow-md`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

const AssetsPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    asset_type: ''
  });
  const [stats, setStats] = useState({ total: 0, active: 0, under_repair: 0, repaired: 0, condemned: 0 });

  useEffect(() => {
    loadAssets();
    loadStats();
    setTimeout(() => setAnimateIn(true), 80);
  }, [filters]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetAPI.getAll(filters);
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await assetAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', asset_type: '' });
  };

  const hasActiveFilters = filters.status !== '' || filters.asset_type !== '';

  const typeOptions = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'desktop', label: 'Desktop' },
    { value: 'printer', label: 'Printer' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'under_repair', label: 'Under Repair' },
    { value: 'repaired', label: 'Repaired' },
    { value: 'condemned', label: 'Condemned' },
  ];

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-200 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse tracking-wider uppercase">
            Loading assets…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Animated ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-56 -right-56 w-[480px] h-[480px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-emerald-300/10 dark:bg-emerald-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
      </div>

      {/* Navbar */}
      <header
        className={`
          sticky top-0 z-50
          transition-all duration-300 ease-out
          ${scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60 py-3'
            : 'bg-transparent py-4'
          }
        `}
        style={{ animation: 'slideInDown 0.4s ease-out both' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
            >
              <Icons.ArrowLeft />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                Asset Registry
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                Manage & track office equipment
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`
          max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
          transition-all duration-500 ease-out
          ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-xl text-sm text-red-700 dark:text-red-300 font-medium animate-slideInDown">
            <Icons.X /> {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Assets" value={stats.total || 0} icon={Icons.Laptop} accent="cyan" delay={40} />
          <StatCard label="Active" value={stats.active || 0} icon={Icons.Monitor} accent="emerald" delay={80} />
          <StatCard label="Under Repair" value={stats.under_repair || 0} icon={Icons.Printer} accent="amber" delay={120} />
          <StatCard label="Repaired" value={stats.repaired || 0} icon={Icons.Desktop} accent="violet" delay={160} />
          <StatCard label="Condemned" value={stats.condemned || 0} icon={Icons.Other} accent="emerald" delay={200} />
        </div>

        {/* Filters Section */}
        <SectionCard delay={240}>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <Icons.Filter />
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 flex items-center gap-1"
                >
                  <Icons.X /> Clear all
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Asset Type
                </label>
                <FilterSelect
                  name="asset_type"
                  value={filters.asset_type}
                  onChange={handleFilterChange}
                  options={typeOptions}
                  label="All Types"
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  Status
                </label>
                <FilterSelect
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  options={statusOptions}
                  label="All Status"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadAssets}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all duration-200 flex items-center gap-2"
                >
                  <Icons.Refresh />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Assets Table */}
        <SectionCard delay={280}>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Asset Inventory
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">{assets.length} items found</p>
              </div>
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                <Icons.Laptop />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No assets found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results'
                  : 'Start by adding assets to the system'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/60">
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Serial #</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Model</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Type</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Department</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">In Charge</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset, index) => (
                    <tr
                      key={asset.id}
                      className="group border-b border-slate-50 dark:border-slate-700/30 last:border-0 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 cursor-pointer transition-colors duration-150"
                      onClick={() => navigate(`/assets/${asset.id}`)}
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                            <AssetTypeIcon type={asset.asset_type} />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {asset.serial_number || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.model}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs capitalize text-slate-600 dark:text-slate-400">{asset.asset_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{asset.dept_name || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{asset.incharge_name || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </main>

      <style jsx>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-blob { animation: blob 9s infinite ease-in-out; }
        .animate-fadeInUp { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slideInDown { animation: slideInDown 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
      `}</style>
    </div>
  );
};

export default AssetsPage;