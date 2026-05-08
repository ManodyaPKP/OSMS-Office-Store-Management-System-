import React, { useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { getErrorMessage, formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  ThumbsUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  ThumbsDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

// ─── Button Components ────────────────────────────────────────────────────────
const PrimaryButton = ({ onClick, disabled, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-4 py-2 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-cyan-500 to-blue-600
      shadow-md shadow-cyan-500/25
      hover:shadow-lg hover:shadow-cyan-500/40
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
      ${className}
    `}
  >
    <span className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    {children}
  </button>
);

const SecondaryButton = ({ onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center gap-2
      px-4 py-2 rounded-xl font-semibold text-sm
      border border-slate-200 dark:border-slate-600
      text-slate-700 dark:text-slate-300
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
      hover:bg-slate-50 dark:hover:bg-slate-700
      hover:border-slate-300 dark:hover:border-slate-500
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
      ${className}
    `}
  >
    {children}
  </button>
);

const SuccessButton = ({ onClick, disabled, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-4 py-2 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-emerald-500 to-teal-600
      shadow-md shadow-emerald-500/25
      hover:shadow-lg hover:shadow-emerald-500/40
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
      ${className}
    `}
  >
    <span className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    {children}
  </button>
);

const DangerButton = ({ onClick, disabled, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-4 py-2 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-red-500 to-rose-600
      shadow-md shadow-red-500/25
      hover:shadow-lg hover:shadow-red-500/40
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
      ${className}
    `}
  >
    <span className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    {children}
  </button>
);

// ─── Alert Component ─────────────────────────────────────────────────────────
const Alert = ({ type, message, onDismiss }) => (
  <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-l-4 text-sm font-medium animate-slideInDown ${
    type === 'success' 
      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-300'
      : 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300'
  }`}>
    <div className="flex items-center gap-2">
      {type === 'success' ? <Icons.Check /> : <Icons.Warning />}
      {message}
    </div>
    <button onClick={onDismiss} className="hover:opacity-70">✕</button>
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
const StatCard = ({ icon: Icon, label, value, accent, delay = 0 }) => {
  const accentMap = {
    cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-900/20', icon: 'bg-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20', icon: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
    purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  };
  const a = accentMap[accent] ?? accentMap.cyan;
  
  return (
    <div
      className={`
        group relative overflow-hidden
        bg-white dark:bg-slate-800/80
        border border-slate-100 dark:border-slate-700/60
        rounded-2xl p-5
        shadow-sm hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 ease-out
        animate-fadeInUp
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${a.bg} rounded-2xl`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${a.text}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${a.icon} text-white shadow-md ring-4 ring-${accent}-200 dark:ring-${accent}-800 flex-shrink-0`}>
          <Icon />
        </div>
      </div>
    </div>
  );
};

// ─── Role Badge ──────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    staff:      { label: 'Staff',      cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    technician: { label: 'Technician', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    other:      { label: 'Other',      cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  };
  const { label, cls } = map[role] ?? { label: role, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>
      {label}
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ApprovalsPage = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [deptId, setDeptId] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!hasRole(['admin'])) {
      navigate('/');
    }
  }, [hasRole, navigate]);

  useEffect(() => {
    fetchPendingRegistrations();
    setTimeout(() => setAnimateIn(true), 80);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getPendingRegistrations();
      setRegistrations(response.data.data || []);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await authAPI.approveRegistration(selectedRegistration.id, deptId);
      setSuccess('Registration approved successfully!');
      setActionModal(null);
      setSelectedRegistration(null);
      fetchPendingRegistrations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      await authAPI.rejectRegistration(selectedRegistration.id, notes);
      setSuccess('Registration rejected successfully!');
      setActionModal(null);
      setSelectedRegistration(null);
      setNotes('');
      fetchPendingRegistrations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (reg) => {
    setSelectedRegistration(reg);
    setActionModal('approve');
    setDeptId('');
  };

  const openRejectModal = (reg) => {
    setSelectedRegistration(reg);
    setActionModal('reject');
    setNotes('');
  };

  const stats = {
    total: registrations.length,
    staff: registrations.filter(r => r.user_type === 'staff').length,
    technician: registrations.filter(r => r.user_type === 'technician').length,
    other: registrations.filter(r => r.user_type === 'other').length,
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-200 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse tracking-wider uppercase">
            Loading registrations…
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
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-amber-300/10 dark:bg-amber-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
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
            <SecondaryButton onClick={() => navigate('/')}>
              <Icons.ArrowLeft />
              <span className="hidden sm:inline">Dashboard</span>
            </SecondaryButton>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                Registration Approvals
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                Review & manage pending user registrations
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
        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
          {success && <Alert type="success" message={success} onDismiss={() => setSuccess('')} />}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Icons.Users} label="Pending" value={stats.total} accent="cyan" delay={40} />
          <StatCard icon={Icons.User} label="Staff" value={stats.staff} accent="blue" delay={80} />
          <StatCard icon={Icons.Briefcase} label="Technicians" value={stats.technician} accent="amber" delay={120} />
          <StatCard icon={Icons.Building} label="Other" value={stats.other} accent="purple" delay={160} />
        </div>

        {/* Registrations List */}
        {registrations.length === 0 ? (
          <SectionCard delay={200}>
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">All Clear!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">No pending registrations at this time.</p>
            </div>
          </SectionCard>
        ) : (
          <div className="space-y-4">
            {registrations.map((reg, index) => (
              <SectionCard key={reg.id} delay={200 + index * 40}>
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    {/* Left - User Info */}
                    <div className="flex-1 min-w-0">
                      {/* Header with avatar and name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                          {reg.first_name?.charAt(0)}{reg.last_name?.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {reg.first_name} {reg.last_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <RoleBadge role={reg.user_type} />
                            <span className="text-xs text-slate-400">@{reg.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Info Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Mail />
                          <span className="text-slate-600 dark:text-slate-400">{reg.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Phone />
                          <span className="text-slate-600 dark:text-slate-400">{reg.mobile_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Icons.Calendar />
                          <span className="text-slate-600 dark:text-slate-400">
                            {formatDate(reg.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Role-Specific Details */}
                      {reg.user_type === 'staff' && (
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 mb-4 border border-blue-100 dark:border-blue-800/30">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-semibold text-blue-700 dark:text-blue-400">Department:</span> {reg.department_name || 'N/A'}</p>
                            <p><span className="font-semibold text-blue-700 dark:text-blue-400">Position:</span> {reg.position || 'N/A'}</p>
                            {reg.section_name && <p><span className="font-semibold text-blue-700 dark:text-blue-400">Section:</span> {reg.section_name}</p>}
                            {reg.unit_name && <p><span className="font-semibold text-blue-700 dark:text-blue-400">Unit:</span> {reg.unit_name}</p>}
                          </div>
                        </div>
                      )}

                      {reg.user_type === 'technician' && (
                        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-3 mb-4 border border-amber-100 dark:border-amber-800/30">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <p><span className="font-semibold text-amber-700 dark:text-amber-400">Company/Shop:</span> {reg.company_shop_name || 'N/A'}</p>
                            <p><span className="font-semibold text-amber-700 dark:text-amber-400">Phone:</span> {reg.company_phone || 'N/A'}</p>
                            <p className="sm:col-span-2"><span className="font-semibold text-amber-700 dark:text-amber-400">Address:</span> {reg.address || 'N/A'}</p>
                          </div>
                        </div>
                      )}

                      {reg.user_type === 'other' && (
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 mb-4 border border-purple-100 dark:border-purple-800/30">
                          <div className="space-y-1 text-sm">
                            <p><span className="font-semibold text-purple-700 dark:text-purple-400">ID Number:</span> {reg.id_number || 'N/A'}</p>
                            <p><span className="font-semibold text-purple-700 dark:text-purple-400">Registration Note:</span> <span className="italic">{reg.registration_note}</span></p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right - Action Buttons */}
                    <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                      <SuccessButton onClick={() => openApproveModal(reg)} disabled={loading} className="whitespace-nowrap">
                        <Icons.ThumbsUp />
                        Approve
                      </SuccessButton>
                      <DangerButton onClick={() => openRejectModal(reg)} disabled={loading} className="whitespace-nowrap">
                        <Icons.ThumbsDown />
                        Reject
                      </DangerButton>
                    </div>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </main>

      {/* Approve Modal */}
      {actionModal === 'approve' && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Approve Registration</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Approve <span className="font-semibold text-cyan-600">{selectedRegistration.first_name} {selectedRegistration.last_name}</span>'s registration
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Department <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                placeholder="Enter department ID or leave blank"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <SecondaryButton onClick={() => setActionModal(null)} className="flex-1">
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleApprove} disabled={loading} className="flex-1">
                {loading ? 'Approving...' : 'Approve'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionModal === 'reject' && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reject Registration</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Reject <span className="font-semibold text-red-600">{selectedRegistration.first_name} {selectedRegistration.last_name}</span>'s registration
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Rejection Reason <span className="text-xs font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide optional reason for rejection..."
                rows="3"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <SecondaryButton onClick={() => setActionModal(null)} className="flex-1">
                Cancel
              </SecondaryButton>
              <DangerButton onClick={handleReject} disabled={loading} className="flex-1">
                {loading ? 'Rejecting...' : 'Reject'}
              </DangerButton>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ApprovalsPage;