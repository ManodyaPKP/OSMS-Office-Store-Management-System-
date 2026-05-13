import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { repairAPI, assetAPI, authAPI } from '../services/api';
import { getErrorMessage, formatDate, getStatusLabel } from '../utils/helpers';
import { Card, Badge, Alert, LoadingSpinner, EmptyState } from '../components/UI';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

let pendingCountRefreshInterval = null;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  Wrench: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Cog: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    </svg>
  ),
  Dollar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Monitor: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  LogOut: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  TrendUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, prefix = '', suffix = '', duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const target = parseFloat(value);
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(eased * target * 100) / 100);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  const fmt = typeof value === 'number' && value % 1 !== 0
    ? display.toFixed(0)
    : Math.round(display);

  return <>{prefix}{fmt}{suffix}</>;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, prefix = '', suffix = '', delay = 0 }) => {
  const accentMap = {
    cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-900/20',    icon: 'bg-cyan-500',    text: 'text-cyan-600 dark:text-cyan-400',    ring: 'ring-cyan-200 dark:ring-cyan-800'    },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-800' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',   icon: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',   ring: 'ring-amber-200 dark:ring-amber-800'   },
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',     ring: 'ring-blue-200 dark:ring-blue-800'     },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20', icon: 'bg-violet-500',  text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-800' },
    slate:   { bg: 'bg-slate-50 dark:bg-slate-800',      icon: 'bg-slate-500',   text: 'text-slate-600 dark:text-slate-400',   ring: 'ring-slate-200 dark:ring-slate-700'   },
  };
  const a = accentMap[accent] ?? accentMap.cyan;

  return (
    <div
      className="
        group relative overflow-hidden
        bg-white dark:bg-slate-800/80
        border border-slate-100 dark:border-slate-700/60
        rounded-2xl p-5
        shadow-sm hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 ease-out
        animate-fadeInUp
      "
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* accent glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${a.bg} rounded-2xl`} />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${a.text}`}>
            <AnimatedNumber value={parseFloat(value) || 0} prefix={prefix} suffix={suffix} />
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${a.icon} text-white shadow-md ring-4 ${a.ring} flex-shrink-0`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    completed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    pending:     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    cancelled:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const cls = map[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      {getStatusLabel(status)}
    </span>
  );
};

<button
  onClick={() => navigate('/repair-request')}
  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
  New Repair Request
</button>

// ─── Role badge for pending regs ──────────────────────────────────────────────
const RolePill = ({ role }) => {
  const map = {
    staff:      { label: 'Staff',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    technician: { label: 'Technician', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  };
  const { label = role, cls = 'bg-slate-100 text-slate-600' } = map[role] ?? {};
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {label}
    </span>
  );
};

// ─── Tooltip for recharts ──────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3 py-2 text-sm">
      {label && <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? p.fill }} className="font-bold"> 
          {p.name}: ${(p.value || 0).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-3 py-2 text-sm">
      <p style={{ color: p.payload.color }} className="font-bold">{p.name}: {p.value}</p>
    </div>
  );
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ children, className = '', delay = 0 }) => (
  <div
    className={`
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
      border border-slate-100 dark:border-slate-700/60
      rounded-2xl shadow-sm
      animate-fadeInUp
      ${className}
    `}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    {children}
  </div>
);

const SectionHead = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700/50">
    <div>
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ─── Nav button ───────────────────────────────────────────────────────────────
const NavBtn = ({ onClick, children, variant = 'ghost' }) => {
  const base = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  const variants = {
    ghost:   `${base} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-300`,
    primary: `${base} bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 focus:ring-cyan-400`,
    amber:   `${base} bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md shadow-amber-400/20 hover:shadow-lg hover:shadow-amber-400/30 hover:-translate-y-0.5 focus:ring-amber-400`,
    danger:  `${base} bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-0.5 focus:ring-red-400`,
  };
  return <button onClick={onClick} className={variants[variant]}>{children}</button>;
};

// ─── View All link button ─────────────────────────────────────────────────────
const ViewAllBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      inline-flex items-center gap-1.5
      px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider
      text-cyan-600 dark:text-cyan-400
      border border-cyan-200 dark:border-cyan-700
      hover:bg-cyan-50 dark:hover:bg-cyan-900/30
      hover:border-cyan-400
      transition-all duration-200
    "
  >
    View All <Icons.ArrowRight />
  </button>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats]                         = useState(null);
  const [assets, setAssets]                       = useState(null);
  const [repairs, setRepairs]                     = useState([]);
  const [pendingRegistrations, setPendingReg]     = useState([]);
  const [pendingCount, setPendingCount]           = useState(0);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState('');
  const [profilePictureUrl, setProfilePicUrl]     = useState(null);
  const [scrolled, setScrolled]                   = useState(false);
  const [animateIn, setAnimateIn]                 = useState(false);

  // Scroll-aware navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    loadDashboardData();
    loadProfilePicture();
    setTimeout(() => setAnimateIn(true), 60);

    if (hasRole(['admin'])) {
      loadPendingCount();
      pendingCountRefreshInterval = setInterval(loadPendingCount, 15000);
    }
    return () => { if (pendingCountRefreshInterval) clearInterval(pendingCountRefreshInterval); };
  }, [hasRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const requests = [
        repairAPI.getStats(),
        assetAPI.getStats(),
        repairAPI.getAll({ status: '' }),
      ];
      if (hasRole(['admin'])) requests.push(authAPI.getPendingRegistrations());

      const results = await Promise.all(requests);
      if (results[0]?.data?.success) setStats(results[0].data.data);
      if (results[1]?.data?.success) setAssets(results[1].data.data);
      if (results[2]?.data?.success) setRepairs(results[2].data.data.slice(0, 8));
      if (hasRole(['admin']) && results[3]?.data?.success) setPendingReg(results[3].data.data.slice(0, 5));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async () => {
    try {
      const token  = localStorage.getItem('authToken');
      const userId = user?.id;
      if (!userId) return;
      const response = await fetch(`http://localhost:5000/api/users/profile/picture/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        setProfilePicUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error('Error loading profile picture:', err);
    }
  };

  const loadPendingCount = async () => {
    try {
      const response = await authAPI.getPendingRegistrations();
      if (response?.data?.success && Array.isArray(response.data.data)) {
        setPendingCount(response.data.data.length);
      }
    } catch {
      // silent
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-100 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Chart data ────────────────────────────────────────────────────────────
  const pieData = stats ? [
    { name: 'Completed',   value: stats.completed_repairs   || 0, color: '#10b981' },
    { name: 'Pending',     value: stats.pending_repairs     || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.in_progress_repairs || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  const barData = [
    { name: 'Assessment', value: stats?.total_assessment_cost || 0, fill: '#06b6d4' },
    { name: 'Invoice',    value: stats?.total_invoice_cost    || 0, fill: '#6366f1' },
  ];

  const avatarInitial = user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ── Ambient blobs ────────────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-64 -right-48 w-[500px] h-[500px] bg-cyan-300/10 dark:bg-cyan-600/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 -left-48 w-[400px] h-[400px] bg-blue-300/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute bottom-0 right-1/3 w-[380px] h-[380px] bg-indigo-300/10 dark:bg-indigo-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header
        className={`
          sticky top-0 z-50
          transition-all duration-300 ease-out
          ${scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60 py-3'
            : 'bg-transparent py-4'
          }
        `}
        style={{ animation: 'slideInDown 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Icons.Monitor />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                Dashboard
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none uppercase tracking-wider font-semibold">
                Asset & Repair Hub
              </p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Profile chip */}
            <button
              onClick={() => navigate('/profile')}
              className="
                flex items-center gap-2 px-3 py-2 rounded-xl
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                hover:border-cyan-300 dark:hover:border-cyan-700
                hover:shadow-md
                transition-all duration-200
                text-sm font-semibold text-slate-700 dark:text-slate-200
              "
            >
              {profilePictureUrl ? (
                <img src={profilePictureUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-2 ring-cyan-300" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-black">
                  {avatarInitial}
                </div>
              )}
              <span className="hidden sm:inline">{user?.full_name || user?.username || 'Profile'}</span>
            </button>

            {/* Admin approvals */}
            {hasRole(['admin']) && (
              <NavBtn onClick={() => navigate('/approvals')} variant="amber">
                <Icons.Clipboard />
                <span className="hidden sm:inline">
                  {pendingCount > 0 ? `${pendingCount} Pending` : 'Approvals'}
                </span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] font-black flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </NavBtn>
            )}

            {/* Logout */}
            <NavBtn onClick={handleLogout} variant="danger">
              <Icons.LogOut />
              <span className="hidden sm:inline">Logout</span>
            </NavBtn>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        className={`
          max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
          transition-all duration-500 ease-out
          ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        {/* Welcome strip */}
        <div className="mb-8 animate-fadeInUp" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Good{new Date().getHours() < 12 ? ' morning' : new Date().getHours() < 18 ? ' afternoon' : ' evening'},{' '}
            <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              {user?.full_name?.split(' ')[0] || user?.username || 'there'} 
            </span>
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">
            Here's your operational summary for today.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-xl text-sm text-red-700 dark:text-red-300 font-medium animate-slideInDown">
            ⚠️ {error}
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Icons.Wrench}  label="Total Repairs" value={stats?.total_repairs     || 0} accent="cyan"    delay={40}  />
          <StatCard icon={Icons.Check}   label="Completed"     value={stats?.completed_repairs  || 0} accent="emerald" delay={80}  />
          <StatCard icon={Icons.Clock}   label="Pending"       value={stats?.pending_repairs    || 0} accent="amber"   delay={120} />
          <StatCard icon={Icons.Cog}     label="In Progress"   value={stats?.in_progress_repairs|| 0} accent="blue"    delay={160} />
          <StatCard icon={Icons.Dollar}  label="Total Cost"    value={stats?.total_invoice_cost || 0} accent="violet"  prefix="$" delay={200} />
          <StatCard icon={Icons.Monitor} label="Total Assets"  value={assets?.total_assets      || 0} accent="slate"   delay={240} />
        </div>

        {/* ── Charts row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Pie chart */}
          <Section delay={280}>
            <SectionHead title="Repair Status" subtitle="Current distribution" />
            <div className="p-6">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconType="circle" iconSize={8}
                      formatter={(v) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2">
                  <span className="text-4xl">📊</span>
                  <p className="text-sm font-medium">No repair data yet</p>
                </div>
              )}
            </div>
          </Section>

          {/* Bar chart */}
          <Section delay={320}>
            <SectionHead title="Cost Breakdown" subtitle="Assessment vs Invoice totals" />
            <div className="p-6">
              {stats ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => `$${v.toLocaleString()}`}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(6,182,212,0.06)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-400">No data</div>
              )}
            </div>
          </Section>
        </div>
       
        {/* ── Admin: Pending Registrations ─────────────────────────────── */}
        {hasRole(['admin']) && (
          <Section delay={360} className="mb-6 border-l-4 border-amber-400">
            <SectionHead
              title="Pending Registrations"
              subtitle="New user approval requests"
              action={<ViewAllBtn onClick={() => navigate('/approvals')} />}
            />
            <div className="p-4">
              {pendingRegistrations.length > 0 ? (
                <div className="space-y-2">
                  {pendingRegistrations.map((reg, i) => (
                    <div
                      key={reg.id}
                      onClick={() => navigate('/approvals')}
                      className="
                        group flex items-center justify-between gap-3
                        px-4 py-3 rounded-xl cursor-pointer
                        bg-slate-50 dark:bg-slate-700/40
                        border border-slate-100 dark:border-slate-700
                        hover:border-amber-300 dark:hover:border-amber-600
                        hover:bg-amber-50/50 dark:hover:bg-amber-900/10
                        transition-all duration-200
                      "
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
                          {reg.first_name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                              {reg.first_name} {reg.last_name}
                            </span>
                            <RolePill role={reg.user_type} />
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {reg.department_name || reg.company_shop_name || 'N/A'} · {reg.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 hidden sm:inline">{formatDate(reg.created_at)}</span>
                        <span className="text-slate-300 dark:text-slate-500 group-hover:text-amber-500 transition-colors">
                          <Icons.ChevronRight />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 text-xl">✓</div>
                  <p className="text-sm font-semibold">All caught up!</p>
                  <p className="text-xs">No pending registrations</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ── Recent Repairs table ─────────────────────────────────────── */}
        <Section delay={400}>
          <SectionHead
            title="Recent Repairs"
            subtitle={`Showing ${repairs.length} latest records`}
            action={<ViewAllBtn onClick={() => navigate('/repairs')} />}
          />
          {repairs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/60">
                    {['ID', 'Asset', 'Issue', 'Status', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair, i) => (
                    <tr
                      key={repair.id}
                      className="
                        group border-b border-slate-50 dark:border-slate-700/30 last:border-0
                        hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10
                        cursor-pointer transition-colors duration-150
                      "
                      onClick={() => navigate(`/repairs/${repair.id}`)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 font-mono">
                          #{String(repair.id).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {repair.asset_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px]">
                        <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 block">
                          {repair.issue || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={repair.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {formatDate(repair.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <span className="text-5xl">🔧</span>
              <p className="text-sm font-semibold">No repair records found</p>
              <p className="text-xs">Records will appear here once repairs are logged</p>
            </div>
          )}
        </Section>

      </main>
    </div>
  );
};

export default Dashboard;