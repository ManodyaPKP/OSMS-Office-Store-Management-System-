import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  ID: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ─── Form field: text/email/tel ───────────────────────────────────────────────
const Field = ({ label, required, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {label}
      {required && <span className="text-cyan-500 text-sm leading-none">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
          <Icon />
        </span>
      )}
      {React.cloneElement(children, {
        className: `
          w-full ${Icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 rounded-xl text-sm
          border border-slate-200 dark:border-slate-600
          bg-white dark:bg-slate-700/50
          text-slate-900 dark:text-white
          placeholder-slate-300 dark:placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        `,
      })}
    </div>
  </div>
);

// ─── Text input ───────────────────────────────────────────────────────────────
const TInput = ({ label, type = 'text', placeholder, value, onChange, required, disabled, icon }) => (
  <Field label={label} required={required} icon={icon}>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} disabled={disabled} />
  </Field>
);

// ─── Password input ───────────────────────────────────────────────────────────
const PInput = ({ label, placeholder, value, onChange, required, disabled }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
        {required && <span className="text-cyan-500 text-sm leading-none">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><Icons.Lock /></span>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="
            w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
            border border-slate-200 dark:border-slate-600
            bg-white dark:bg-slate-700/50
            text-slate-900 dark:text-white
            placeholder-slate-300 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
          "
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
        >
          {show ? <Icons.EyeOff /> : <Icons.Eye />}
        </button>
      </div>
    </div>
  );
};

// ─── Textarea ─────────────────────────────────────────────────────────────────
const TArea = ({ label, placeholder, value, onChange, required, disabled, rows = 3 }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {label}
      {required && <span className="text-cyan-500 text-sm leading-none">*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      rows={rows}
      className="
        w-full px-4 py-2.5 rounded-xl text-sm resize-none
        border border-slate-200 dark:border-slate-600
        bg-white dark:bg-slate-700/50
        text-slate-900 dark:text-white
        placeholder-slate-300 dark:placeholder-slate-500
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
      "
    />
  </div>
);

// ─── Section divider ──────────────────────────────────────────────────────────
const FormSection = ({ title, icon: Icon, accent = 'cyan', children, delay = 0 }) => {
  const acc = {
    cyan:   { dot: 'bg-cyan-500',   text: 'text-cyan-600',   line: 'from-cyan-500/30' },
    blue:   { dot: 'bg-blue-500',   text: 'text-blue-600',   line: 'from-blue-500/30' },
    violet: { dot: 'bg-violet-500', text: 'text-violet-600', line: 'from-violet-500/30' },
    amber:  { dot: 'bg-amber-500',  text: 'text-amber-600',  line: 'from-amber-500/30' },
    slate:  { dot: 'bg-slate-400',  text: 'text-slate-500',  line: 'from-slate-400/30' },
  }[accent];

  return (
    <div
      className="animate-fadeInUp"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-1.5 rounded-lg ${acc.dot} bg-opacity-10`}>
          <span className={acc.text}><Icon /></span>
        </div>
        <span className={`text-xs font-black uppercase tracking-widest ${acc.text}`}>{title}</span>
        <div className={`flex-1 h-px bg-gradient-to-r ${acc.line} to-transparent`} />
      </div>
      <div className="space-y-4 pl-1">{children}</div>
    </div>
  );
};

// ─── User-type card ───────────────────────────────────────────────────────────
const TypeCard = ({ value, current, onClick, icon: Icon, label, description, accent }) => {
  const active = value === current;
  const acc = {
    cyan:   { ring: 'ring-cyan-400',   bg: 'bg-cyan-50 dark:bg-cyan-900/20',   text: 'text-cyan-600 dark:text-cyan-400',   dot: 'bg-cyan-500'   },
    amber:  { ring: 'ring-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500'  },
    violet: { ring: 'ring-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20',text: 'text-violet-600 dark:text-violet-400',dot: 'bg-violet-500'},
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2
        text-center cursor-pointer transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${acc.ring}
        ${active
          ? `border-current ${acc.bg} ${acc.text} ring-2`
          : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:-translate-y-0.5'
        }
      `}
    >
      {active && (
        <span className={`absolute top-2 right-2 w-4 h-4 rounded-full ${acc.dot} flex items-center justify-center`}>
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      )}
      <span className={`${active ? acc.text : 'text-slate-400'} transition-colors`}>
        <Icon />
      </span>
      <span className="text-xs font-black uppercase tracking-wider leading-none">{label}</span>
      <span className="text-[10px] font-medium text-slate-400 leading-tight">{description}</span>
    </button>
  );
};

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-5 animate-fadeInUp">
    <div className="relative">
      <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
          <Icons.Check />
        </div>
      </div>
      <div className="absolute inset-0 rounded-full bg-emerald-300/30 animate-ping" />
    </div>
    <div className="text-center space-y-1">
      <h3 className="text-xl font-black text-slate-800 dark:text-white">Registration Submitted!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Your account is pending admin approval. You'll be redirected to login shortly.
      </p>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <Icons.Spinner />
      Redirecting to login…
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType]       = useState('staff');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [mounted, setMounted]         = useState(false);

  // Common
  const [firstName, setFirstName]     = useState('');
  const [lastName, setLastName]       = useState('');
  const [email, setEmail]             = useState('');
  const [mobileNumber, setMobile]     = useState('');
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');

  // Staff
  const [deptName, setDeptName]       = useState('');
  const [sectionName, setSection]     = useState('');
  const [unitName, setUnit]           = useState('');
  const [position, setPosition]       = useState('');

  // Technician
  const [companyName, setCompany]     = useState('');
  const [companyPhone, setCompPhone]  = useState('');
  const [address, setAddress]         = useState('');

  // Other
  const [idNumber, setIdNumber]       = useState('');
  const [regNote, setRegNote]         = useState('');

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        mobile_number: mobileNumber,
        user_type: userType,
        username,
        password,
      };

      if (userType === 'staff') {
        payload.department_name = deptName;
        payload.section_name    = sectionName;
        payload.unit_name       = unitName;
        payload.position        = position;
      } else if (userType === 'technician') {
        payload.company_shop_name = companyName;
        payload.company_phone     = companyPhone;
        payload.address           = address;
      } else if (userType === 'other') {
        payload.id_number          = idNumber;
        payload.registration_note  = regNote;
      }

      const response = await fetch('http://localhost:5000/api/users/register/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">

      {/* ── Ambient blobs ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute -bottom-40 left-1/3 w-[380px] h-[380px] bg-indigo-500/8 rounded-full blur-3xl animate-blob animation-delay-500" />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* ── Left panel — branding ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[38%] flex-col justify-between p-12 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-black text-lg tracking-tight">Asset Hub</span>
        </div>

        {/* Middle content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Join the<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Asset & Repair
              </span><br />
              Platform
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed max-w-xs">
              Create your account and get access to streamlined asset tracking and repair management.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: '🔧', text: 'Track repair jobs in real-time' },
              { icon: '🖥️', text: 'Manage all your assets centrally' },
              { icon: '📊', text: 'Insightful reports and analytics' },
              { icon: '🔒', text: 'Role-based access control' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 animate-fadeInUp"
                style={{ animationDelay: `${100 + i * 80}ms`, animationFillMode: 'both' }}
              >
                <span className="text-lg">{f.icon}</span>
                <span className="text-sm text-slate-300 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <span className="text-cyan-400 mt-0.5 flex-shrink-0"><Icons.Info /></span>
          <p className="text-xs text-slate-400 leading-relaxed">
            After submitting, an administrator will review your request before granting access.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center overflow-y-auto">
        <div
          className={`
            w-full max-w-xl mx-auto px-4 py-8 lg:py-12
            transition-all duration-500 ease-out
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}
        >
          {/* Back button */}
          <button
            onClick={() => navigate('/login')}
            className="
              mb-6 inline-flex items-center gap-2
              text-slate-400 hover:text-slate-200
              text-sm font-semibold transition-colors duration-150
              group
            "
          >
            <span className="group-hover:-translate-x-0.5 transition-transform duration-150">
              <Icons.ArrowLeft />
            </span>
            Back to Login
          </button>

          {/* Card */}
          <div className="bg-white/5 dark:bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/10">
              <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
              <p className="text-slate-400 text-sm mt-1">
                Already have one?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>

            {/* Card body */}
            <div className="px-8 py-6">
              {success ? (
                <SuccessScreen />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm font-medium animate-slideInDown">
                      <Icons.Warning />
                      {error}
                    </div>
                  )}

                  {/* Basic Info */}
                  <FormSection title="Basic Information" icon={Icons.User} accent="cyan" delay={0}>
                    <div className="grid grid-cols-2 gap-3">
                      <TInput label="First Name" required placeholder="John"
                        value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} />
                      <TInput label="Last Name" required placeholder="Doe"
                        value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} />
                    </div>
                    <TInput label="Email" type="email" icon={Icons.Mail} placeholder="john@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                    <TInput label="Mobile Number" type="tel" required icon={Icons.Phone} placeholder="+1 234 567 8900"
                      value={mobileNumber} onChange={e => setMobile(e.target.value)} disabled={loading} />
                  </FormSection>

                  {/* Account Type selector */}
                  <FormSection title="Account Type" icon={Icons.ID} accent="blue" delay={60}>
                    <div className="flex gap-3">
                      <TypeCard value="staff"      current={userType} onClick={() => setUserType('staff')}
                        icon={Icons.User}   label="Staff"      description="Department member"       accent="cyan"   />
                      <TypeCard value="technician" current={userType} onClick={() => setUserType('technician')}
                        icon={Icons.Wrench} label="Technician" description="Service provider"        accent="amber"  />
                      <TypeCard value="other"      current={userType} onClick={() => setUserType('other')}
                        icon={Icons.Globe}  label="Other"      description="External / guest"        accent="violet" />
                    </div>
                  </FormSection>

                  {/* Role-specific fields */}
                  {userType === 'staff' && (
                    <FormSection title="Staff Details" icon={Icons.Building} accent="cyan" delay={80}>
                      <div className="grid grid-cols-2 gap-3">
                        <TInput label="Department" placeholder="Finance Department"
                          value={deptName} onChange={e => setDeptName(e.target.value)} disabled={loading} />
                        <TInput label="Section" placeholder="Accounting Section"
                          value={sectionName} onChange={e => setSection(e.target.value)} disabled={loading} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <TInput label="Unit" placeholder="Budget Unit"
                          value={unitName} onChange={e => setUnit(e.target.value)} disabled={loading} />
                        <TInput label="Position" placeholder="Senior Accountant"
                          value={position} onChange={e => setPosition(e.target.value)} disabled={loading} />
                      </div>
                    </FormSection>
                  )}

                  {userType === 'technician' && (
                    <FormSection title="Technician Details" icon={Icons.Building} accent="amber" delay={80}>
                      <TInput label="Company / Shop Name" icon={Icons.Building} placeholder="Tech Solutions Inc."
                        value={companyName} onChange={e => setCompany(e.target.value)} disabled={loading} />
                      <div className="grid grid-cols-2 gap-3">
                        <TInput label="Company Phone" type="tel" icon={Icons.Phone} placeholder="+1 234 567 8900"
                          value={companyPhone} onChange={e => setCompPhone(e.target.value)} disabled={loading} />
                        <TInput label="Address" icon={Icons.MapPin} placeholder="123 Tech Street"
                          value={address} onChange={e => setAddress(e.target.value)} disabled={loading} />
                      </div>
                    </FormSection>
                  )}

                  {userType === 'other' && (
                    <FormSection title="Additional Information" icon={Icons.ID} accent="violet" delay={80}>
                      <TInput label="ID Number" required icon={Icons.ID} placeholder="ID123456"
                        value={idNumber} onChange={e => setIdNumber(e.target.value)} disabled={loading} />
                      <TArea label="Registration Note" required rows={3}
                        placeholder="Please explain why you want access to this platform…"
                        value={regNote} onChange={e => setRegNote(e.target.value)} disabled={loading} />
                    </FormSection>
                  )}

                  {/* Credentials */}
                  <FormSection title="Account Credentials" icon={Icons.Lock} accent="slate" delay={100}>
                    <TInput label="Username" required icon={Icons.User} placeholder="johndoe"
                      value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
                    <PInput label="Password" required placeholder="Minimum 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                  </FormSection>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      relative overflow-hidden w-full
                      flex items-center justify-center gap-2.5
                      px-6 py-3.5 rounded-xl
                      font-black text-sm uppercase tracking-widest text-white
                      bg-gradient-to-r from-cyan-500 to-blue-600
                      shadow-lg shadow-cyan-500/30
                      hover:shadow-xl hover:shadow-cyan-500/40
                      hover:-translate-y-0.5
                      active:translate-y-0 active:scale-[0.98]
                      disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                      transition-all duration-200 ease-out
                      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
                    "
                  >
                    {/* shimmer */}
                    <span className="absolute inset-0 bg-white/10 translate-x-[-110%] hover:translate-x-[110%] transition-transform duration-700 skew-x-12 pointer-events-none" />
                    {loading ? (
                      <><Icons.Spinner /> Submitting…</>
                    ) : (
                      <>Register Account</>
                    )}
                  </button>

                </form>
              )}
            </div>
          </div>

          {/* Mobile info note */}
          <div className="lg:hidden mt-5 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
            <span className="text-cyan-400 mt-0.5 flex-shrink-0"><Icons.Info /></span>
            <p className="text-xs text-slate-400 leading-relaxed">
              After submitting, an administrator will review your request before granting access.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;