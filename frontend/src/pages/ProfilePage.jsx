import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import DeleteAccountModal from '../components/DeleteAccountModal';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Camera: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Cancel: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  Logout: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

// ─── Reusable Button Components ───────────────────────────────────────────────

/** Primary action button — gradient fill, shimmer on hover */
const PrimaryButton = ({ onClick, disabled, children, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-cyan-500 to-blue-600
      shadow-md shadow-cyan-500/25
      hover:shadow-lg hover:shadow-cyan-500/40
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
      ${className}
    `}
  >
    <span className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    {children}
  </button>
);

/** Secondary ghost button */
const SecondaryButton = ({ onClick, disabled, children, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      inline-flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl font-semibold text-sm
      border border-slate-200 dark:border-slate-600
      text-slate-700 dark:text-slate-300
      bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
      hover:bg-slate-50 dark:hover:bg-slate-700
      hover:border-slate-300 dark:hover:border-slate-500
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
      ${className}
    `}
  >
    {children}
  </button>
);

/** Success / confirm button */
const SuccessButton = ({ onClick, disabled, children, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl font-semibold text-sm text-white
      bg-gradient-to-r from-emerald-500 to-teal-600
      shadow-md shadow-emerald-500/25
      hover:shadow-lg hover:shadow-emerald-500/40
      hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
      ${className}
    `}
  >
    <span className="absolute inset-0 bg-white/10 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    {children}
  </button>
);

/** Danger button */
const DangerButton = ({ onClick, disabled, children, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative overflow-hidden inline-flex items-center justify-center gap-2
      px-5 py-2.5 rounded-xl font-semibold text-sm text-white
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

/** Ghost icon-only button */
const IconButton = ({ onClick, children, title, className = '' }) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      p-2 rounded-lg text-slate-500 dark:text-slate-400
      hover:text-slate-900 dark:hover:text-white
      hover:bg-slate-100 dark:hover:bg-slate-700
      active:scale-90
      transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-slate-300
      ${className}
    `}
  >
    {children}
  </button>
);

// ─── Password field with show/hide ───────────────────────────────────────────
const PasswordInput = ({ label, name, value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="
            w-full pl-4 pr-10 py-2.5
            border border-slate-200 dark:border-slate-600
            rounded-xl text-sm
            bg-slate-50 dark:bg-slate-700/60
            text-slate-900 dark:text-white
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            transition-all duration-200
          "
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          {show ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      </div>
    </div>
  );
};

// ─── Styled text input ────────────────────────────────────────────────────────
const TextInput = ({ label, type = 'text', name, value, onChange, required, placeholder }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}{required && <span className="text-cyan-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="
        w-full px-4 py-2.5
        border border-slate-200 dark:border-slate-600
        rounded-xl text-sm
        bg-slate-50 dark:bg-slate-700/60
        text-slate-900 dark:text-white
        placeholder-slate-400 dark:placeholder-slate-500
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
        transition-all duration-200
      "
    />
  </div>
);

// ─── Alert banner ─────────────────────────────────────────────────────────────
const Alert = ({ type, message, onDismiss }) => {
  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-300',
    error:   'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300',
  };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-l-4 text-sm font-medium animate-slideInDown ${styles[type]}`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <Icons.Check /> : <Icons.Warning />}
        {message}
      </div>
      <IconButton onClick={onDismiss} className="!p-1"><Icons.Cancel /></IconButton>
    </div>
  );
};

// ─── Section Card wrapper ─────────────────────────────────────────────────────
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

const SectionHeader = ({ icon: Icon, title, children }) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
    <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      <span className="text-cyan-500"><Icon /></span>
      {title}
    </h2>
    {children}
  </div>
);

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700/40 last:border-0">
    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
      <Icon />
    </div>
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{value || <span className="text-slate-400 italic font-normal">Not provided</span>}</p>
    </div>
  </div>
);

// ─── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    admin:      { label: 'Administrator', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
    staff:      { label: 'Staff Member',  cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    technician: { label: 'Technician',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  };
  const { label, cls } = map[role] ?? { label: role, cls: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  );
};

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    aria-label="Toggle theme"
    className={`
      relative flex items-center w-16 h-8 rounded-full p-1
      transition-colors duration-500 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2
      ${theme === 'dark' ? 'bg-indigo-600' : 'bg-amber-400'}
    `}
  >
    <span
      className={`
        absolute flex items-center justify-center
        w-6 h-6 bg-white rounded-full shadow-md
        transition-transform duration-500 ease-out
        ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0'}
      `}
    >
      {theme === 'dark'
        ? <span className="text-indigo-600"><Icons.Moon /></span>
        : <span className="text-amber-500"><Icons.Sun /></span>
      }
    </span>
  </button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [loading, setLoading]                   = useState(true);
  const [saving, setSaving]                     = useState(false);
  const [uploading, setUploading]               = useState(false);
  const [profile, setProfile]                   = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [editMode, setEditMode]                 = useState(false);
  const [message, setMessage]                   = useState('');
  const [error, setError]                       = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [animateIn, setAnimateIn]               = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const [formData, setFormData] = useState({ username: '', full_name: '', bio: '', phone: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    loadProfile();
    setTimeout(() => setAnimateIn(true), 80);
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile/me');
      if (response.data.success) {
        setProfile(response.data.data);
        setFormData({
          username:  response.data.data.username  || '',
          full_name: response.data.data.full_name || '',
          bio:       response.data.data.bio       || '',
          phone:     response.data.data.phone     || '',
        });
        if (response.data.data.hasProfilePicture) loadProfilePicture(response.data.data.id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/users/profile/picture/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        setProfilePictureUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error('Error loading profile picture:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePictureUrl(ev.target.result);
    reader.readAsDataURL(file);
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('profile_picture', file);
      await api.post('/users/profile/upload-picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Profile picture updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload picture');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const deleteProfilePicture = async () => {
    if (!window.confirm('Remove your profile picture?')) return;
    try {
      await api.delete('/users/profile/picture');
      setProfilePictureUrl(null);
      setMessage('Profile picture removed.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete picture');
      setTimeout(() => setError(''), 3000);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const response = await api.put('/users/profile/update', formData);
      if (response.data.success) {
        setMessage('Profile saved successfully!');
        setEditMode(false);
        if (updateUser && response.data.data) {
          updateUser({ username: response.data.data.username, full_name: response.data.data.full_name });
        }
        loadProfile();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required'); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    try {
      setSaving(true);
      await api.post('/users/profile/change-password', passwordData);
      setMessage('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-200 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse tracking-wider uppercase">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  const avatarInitial = profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* ── Animated ambient blobs ─────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-56 -right-56 w-[480px] h-[480px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-violet-300/10 dark:bg-violet-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <SecondaryButton onClick={() => navigate('/')}>
              <Icons.ArrowLeft />
              <span className="hidden sm:inline">Dashboard</span>
            </SecondaryButton>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                My Profile
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">Account settings & preferences</p>
            </div>
          </div>

          {/* Right: theme + logout */}
          <div className="flex items-center gap-3">
            <DangerButton onClick={logout}>
              <Icons.Logout />
              <span className="hidden sm:inline">Logout</span>
            </DangerButton>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main
        className={`
          max-w-6xl mx-auto px-4 sm:px-6 py-8
          transition-all duration-500 ease-out
          ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
      >
        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {message && <Alert type="success" message={message} onDismiss={() => setMessage('')} />}
          {error   && <Alert type="error"   message={error}   onDismiss={() => setError('')}   />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: avatar card ────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            <SectionCard delay={0}>
              {/* Gradient hero */}
              <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 rounded-t-2xl px-6 py-10 text-center overflow-hidden">
                {/* subtle mesh */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }} />

                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-full border-4 border-white/80 shadow-xl overflow-hidden bg-white">
                    {profilePictureUrl ? (
                      <img src={profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-300 to-blue-400 flex items-center justify-center">
                        <span className="text-4xl font-black text-white select-none">{avatarInitial}</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Camera button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Change photo"
                    className="
                      absolute -bottom-1 -right-1
                      p-2 bg-white dark:bg-slate-700 rounded-full shadow-md
                      text-cyan-600 dark:text-cyan-400
                      hover:scale-110 hover:shadow-lg
                      active:scale-95
                      transition-all duration-200
                      disabled:opacity-60
                    "
                  >
                    <Icons.Camera />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                </div>

                <h2 className="mt-4 text-xl font-black text-white leading-tight">{profile?.full_name}</h2>
                <p className="text-cyan-100/80 text-sm mt-0.5">@{profile?.username}</p>
                <div className="mt-3 flex justify-center">
                  <RoleBadge role={profile?.role} />
                </div>
              </div>

              {/* Info list */}
              <div className="px-5 py-4">
                <InfoRow icon={Icons.Mail}      label="Email"       value={profile?.email} />
                {profile?.department_name && <InfoRow icon={Icons.Building}   label="Department"  value={profile?.department_name} />}
                {profile?.designation      && <InfoRow icon={Icons.Briefcase} label="Designation" value={profile?.designation} />}
              </div>

              {/* Photo actions */}
              <div className="px-5 pb-5 space-y-2">
                <PrimaryButton onClick={() => fileInputRef.current?.click()} className="w-full" disabled={uploading}>
                  <Icons.Camera />
                  {uploading ? 'Uploading…' : 'Change Photo'}
                </PrimaryButton>
                {profilePictureUrl && (
                  <SecondaryButton onClick={deleteProfilePicture} className="w-full text-red-500 hover:text-red-600 border-red-200 dark:border-red-800/50">
                    <Icons.Trash />
                    Remove Photo
                  </SecondaryButton>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── Right column ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Information */}
            <SectionCard delay={80}>
              <SectionHeader icon={Icons.User} title="Personal Information">
                {!editMode && (
                  <PrimaryButton onClick={() => setEditMode(true)}>
                    <Icons.Edit />
                    Edit
                  </PrimaryButton>
                )}
              </SectionHeader>

              <div className="p-6">
                {!editMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                    <InfoRow icon={Icons.User} label="Username"  value={profile?.username} />
                    <InfoRow icon={Icons.User} label="Full Name" value={profile?.full_name} />
                    <div className="sm:col-span-2">
                      <InfoRow icon={Icons.Briefcase} label="Bio" value={profile?.bio || 'No bio added yet'} />
                    </div>
                    <InfoRow icon={Icons.Mail} label="Phone" value={profile?.phone} />
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); saveProfile(); }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TextInput
                        label="Username" name="username" required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                      <TextInput
                        label="Full Name" name="full_name" required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bio</label>
                      <textarea
                        name="bio" rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself…"
                        className="
                          w-full px-4 py-2.5 rounded-xl text-sm resize-none
                          border border-slate-200 dark:border-slate-600
                          bg-slate-50 dark:bg-slate-700/60
                          text-slate-900 dark:text-white
                          placeholder-slate-400 dark:placeholder-slate-500
                          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                          transition-all duration-200
                        "
                      />
                    </div>

                    <TextInput
                      label="Phone" type="tel" name="phone"
                      value={formData.phone}
                      placeholder="+1 234 567 8900"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />

                    <div className="flex gap-3 pt-1">
                      <SuccessButton type="submit" disabled={saving} className="flex-1">
                        <Icons.Save />
                        {saving ? 'Saving…' : 'Save Changes'}
                      </SuccessButton>
                      <SecondaryButton
                        onClick={() => {
                          setEditMode(false);
                          setFormData({ username: profile?.username || '', full_name: profile?.full_name || '', bio: profile?.bio || '', phone: profile?.phone || '' });
                        }}
                        className="flex-1"
                      >
                        <Icons.Cancel />
                        Cancel
                      </SecondaryButton>
                    </div>
                  </form>
                )}
              </div>
            </SectionCard>

            {/* Security / Password */}
            <SectionCard delay={160}>
              <SectionHeader icon={Icons.Shield} title="Security">
                {!showPasswordForm && (
                  <SecondaryButton onClick={() => setShowPasswordForm(true)}>
                    <Icons.Lock />
                    Change Password
                  </SecondaryButton>
                )}
              </SectionHeader>

              <div className="p-6">
                {!showPasswordForm ? (
                  <div className="flex items-center gap-4 py-2">
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      <Icons.Lock />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Password</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last changed: unknown</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">••••••••</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <PasswordInput
                      label="Current Password"  name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <PasswordInput
                      label="New Password"  name="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="At least 6 characters"
                    />
                    <PasswordInput
                      label="Confirm New Password"  name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                    />
                    <div className="flex gap-3 pt-1">
                      <SuccessButton onClick={changePassword} disabled={saving} className="flex-1">
                        <Icons.Save />
                        {saving ? 'Updating…' : 'Update Password'}
                      </SuccessButton>
                      <SecondaryButton
                        onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                        className="flex-1"
                      >
                        <Icons.Cancel />
                        Cancel
                      </SecondaryButton>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Appearance */}
            <SectionCard delay={240}>
              <SectionHeader icon={theme === 'dark' ? Icons.Moon : Icons.Sun} title="Appearance" />
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Theme</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Currently using <span className="font-medium text-cyan-500 capitalize">{theme}</span> mode
                  </p>
                </div>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard delay={320} className="border-red-200/60 dark:border-red-900/40">
              <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 rounded-t-2xl">
                <h2 className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
                  <Icons.Warning />
                  Danger Zone
                </h2>
              </div>
              <div className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Delete Account</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs">
                    This will permanently erase your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <DangerButton onClick={() => setShowDeleteModal(true)}>
                  <Icons.Trash />
                  Delete Account
                </DangerButton>
              </div>
            </SectionCard>

          </div>{/* end right column */}
        </div>{/* end grid */}
      </main>

      <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />
    </div>
  );
};

export default ProfilePage;