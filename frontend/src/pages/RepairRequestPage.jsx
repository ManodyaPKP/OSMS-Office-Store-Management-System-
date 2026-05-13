import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { repairAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Send: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Cancel: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  CheckLg: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Laptop: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
  Document: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  XSmall: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
};

// ─── Section/Unit options ─────────────────────────────────────────────────────
const SECTION_UNIT_OPTIONS = [
  "DG Office",
  "ADG Office (Admin)",
  "Desathiya",
  "Translation Unit",
  "District Media Unit",
  "Sound Unit",
  "New Media Unit ( News.lk )",
  "IT Unit",
  "Internal Audit",
  "General Audit (ADG Office Media)",
  "Library",
  "Digital Archive Unit (GFU)",
  "Publicity Unit",
  "ID Unit",
  "Transport Unit",
  "Research Unit",
  "Social Media Unit",
  "Account Section",
  "Admin Section",
  "Publication Bureau",
  "Editing Unit (GFU)",
  "Maintenance Unit",
  "Camera Unit (GFU)",
  "Photography Unit (GFU)",
  "Film Archive (GFU)",
  "Monitoring Unit",
  "Production Unit (GFU)",
];

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Item Info',  icon: Icons.Laptop   },
  { id: 2, label: 'User Info', icon: Icons.User     },
  { id: 3, label: 'History',   icon: Icons.Calendar },
  { id: 4, label: 'Issue',     icon: Icons.Alert    },
];

// ─── Base field styles ────────────────────────────────────────────────────────
const fieldCls = `
  w-full px-4 py-2.5 rounded-xl text-sm
  border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-700/50
  text-slate-900 dark:text-white
  placeholder-slate-300 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
  disabled:opacity-50 transition-all duration-200
`;

const iconFieldCls = `
  w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
  border border-slate-200 dark:border-slate-600
  bg-white dark:bg-slate-700/50
  text-slate-900 dark:text-white
  placeholder-slate-300 dark:placeholder-slate-500
  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
  disabled:opacity-50 transition-all duration-200
`;

// ─── Label ────────────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
    {children}{required && <span className="text-cyan-500 ml-0.5">*</span>}
  </label>
);

// ─── Text Input ───────────────────────────────────────────────────────────────
const FInput = ({ label, name, type = 'text', value, onChange, required, placeholder, icon: Icon, disabled }) => (
  <div>
    <Label required={required}>{label}</Label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 pointer-events-none">
          <Icon />
        </span>
      )}
      <input
        type={type} name={name} value={value} onChange={onChange}
        required={required} placeholder={placeholder} disabled={disabled}
        className={Icon ? iconFieldCls : fieldCls}
      />
    </div>
  </div>
);

// ─── Textarea ─────────────────────────────────────────────────────────────────
const FTextarea = ({ label, name, value, onChange, required, placeholder, rows = 3, disabled }) => (
  <div>
    <Label required={required}>{label}</Label>
    <textarea
      name={name} value={value} onChange={onChange}
      required={required} placeholder={placeholder} rows={rows} disabled={disabled}
      className={`${fieldCls} resize-none`}
    />
  </div>
);

// ─── Custom Searchable Dropdown ───────────────────────────────────────────────
const SearchableDropdown = ({ label, name, value, onChange, options, required, placeholder = 'Select…', disabled }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef           = useRef(null);
  const searchRef         = useRef(null);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-focus search input when panel opens
  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  const select = (option) => {
    onChange({ target: { name, value: option } });
    setOpen(false);
    setQuery('');
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
  };

  return (
    <div ref={wrapRef} className="relative">
      <Label required={required}>{label}</Label>

      {/* ── Trigger button ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm text-left
          border transition-all duration-200 focus:outline-none
          ${open
            ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white dark:bg-slate-700/50 shadow-sm'
            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`flex-shrink-0 transition-colors duration-200 ${value ? 'text-cyan-500' : 'text-slate-300 dark:text-slate-500'}`}>
            <Icons.Building />
          </span>
          {value ? (
            <span className="text-slate-900 dark:text-white font-semibold truncate">{value}</span>
          ) : (
            <span className="text-slate-300 dark:text-slate-500 truncate">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {/* Clear chip */}
          {value && (
            <span
              onClick={clear}
              className="
                inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full
                bg-slate-100 dark:bg-slate-600
                text-slate-400 dark:text-slate-300
                hover:bg-red-100 dark:hover:bg-red-900/40
                hover:text-red-500 dark:hover:text-red-400
                text-[10px] font-bold transition-all duration-150 cursor-pointer
              "
            >
              <Icons.XSmall />
              Clear
            </span>
          )}
          {/* Chevron rotates */}
          <span className={`text-slate-400 transition-transform duration-250 ${open ? 'rotate-180' : ''}`}>
            <Icons.ChevronDown />
          </span>
        </div>
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="
            absolute z-50 mt-1.5 w-full
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-700
            rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-slate-900/50
            overflow-hidden
          "
          style={{ animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          {/* Search bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-700/60">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Icons.Search />
              </span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search units…"
                className="
                  w-full pl-8 pr-8 py-2 rounded-xl text-xs
                  border border-slate-200 dark:border-slate-600
                  bg-slate-50 dark:bg-slate-700/60
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                  transition-all duration-150
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  <Icons.XSmall />
                </button>
              )}
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-56 overflow-y-auto py-1.5 rr-scrollbar">
            {filtered.length === 0 ? (
              <li className="px-4 py-8 text-center space-y-1">
                <p className="text-2xl">🔍</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">No units match "{query}"</p>
              </li>
            ) : (
              filtered.map((option, i) => {
                const active = value === option;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => select(option)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm
                        transition-colors duration-100
                        ${active
                          ? 'bg-cyan-50 dark:bg-cyan-900/25 text-cyan-700 dark:text-cyan-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }
                      `}
                    >
                      {/* Number / check badge */}
                      <span className={`
                        flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center
                        text-[9px] font-black transition-colors duration-150
                        ${active
                          ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-400/30'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                        }
                      `}>
                        {active ? <Icons.Check /> : i + 1}
                      </span>

                      {/* Label — highlight matching part */}
                      <span className="flex-1 truncate font-medium">
                        {query
                          ? (() => {
                              const idx = option.toLowerCase().indexOf(query.toLowerCase());
                              if (idx === -1) return option;
                              return (
                                <>
                                  {option.slice(0, idx)}
                                  <mark className="bg-cyan-200 dark:bg-cyan-700/60 text-cyan-800 dark:text-cyan-200 rounded px-0.5 not-italic">
                                    {option.slice(idx, idx + query.length)}
                                  </mark>
                                  {option.slice(idx + query.length)}
                                </>
                              );
                            })()
                          : option
                        }
                      </span>

                      {/* Selected checkmark on right */}
                      {active && (
                        <span className="flex-shrink-0 text-cyan-500">
                          <Icons.Check />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {/* Footer count */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {filtered.length} of {options.length} units
            </p>
            {value && (
              <span className="text-[10px] font-bold text-cyan-500 truncate max-w-[60%] text-right">
                ✓ {value}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Yes / No toggle ──────────────────────────────────────────────────────────
const YesNoToggle = ({ label, name, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <div className="flex gap-2">
      {['yes', 'no'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange({ target: { name, value: opt } })}
          className={`
            flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-1
            ${value === opt
              ? opt === 'yes'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-400/30 scale-[1.02]'
                : 'bg-slate-600 dark:bg-slate-500 text-white shadow-md scale-[1.02]'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
            }
          `}
        >
          {opt === 'yes' ? '✓  Yes' : '✗  No'}
        </button>
      ))}
    </div>
  </div>
);

// ─── Progress Stepper ─────────────────────────────────────────────────────────
const Stepper = ({ current, steps }) => (
  <div className="flex items-center mb-8">
    {steps.map((step, i) => {
      const done   = current > step.id;
      const active = current === step.id;
      const Icon   = step.icon;
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${done   ? 'bg-emerald-500 text-white shadow-md shadow-emerald-400/30'
              : active ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-400/30'
              :          'bg-slate-100 dark:bg-slate-700 text-slate-400'}
            `}>
              {done ? <Icons.CheckLg /> : <Icon />}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
              active ? 'text-cyan-600 dark:text-cyan-400'
              : done  ? 'text-emerald-500'
              :         'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${
              done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Step card ────────────────────────────────────────────────────────────────
const StepCard = ({ icon: Icon, title, accent = 'cyan', children }) => {
  const acc = {
    cyan:  { dot: 'bg-cyan-500',  text: 'text-cyan-500',  line: 'from-cyan-500/30'  },
    blue:  { dot: 'bg-blue-500',  text: 'text-blue-500',  line: 'from-blue-500/30'  },
    amber: { dot: 'bg-amber-500', text: 'text-amber-500', line: 'from-amber-500/30' },
    red:   { dot: 'bg-red-500',   text: 'text-red-500',   line: 'from-red-500/30'   },
  }[accent];
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
        <span className={`p-1.5 rounded-lg ${acc.dot} bg-opacity-10`}>
          <span className={acc.text}><Icon /></span>
        </span>
        <span className={`text-xs font-black uppercase tracking-widest ${acc.text}`}>{title}</span>
        <div className={`flex-1 h-px bg-gradient-to-r ${acc.line} to-transparent`} />
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

// ─── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-5 animate-fadeInUp">
    <div className="relative">
      <div className="w-24 h-24 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40 text-white">
          <Icons.CheckLg />
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl bg-emerald-300/20 animate-ping" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-black text-slate-800 dark:text-white">Request Submitted!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
        Your repair request has been logged. You'll be redirected to the repairs list.
      </p>
    </div>
    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
      <Icons.Spinner /> Redirecting…
    </div>
  </div>
);

// ─── Navigation Buttons ───────────────────────────────────────────────────────

/**
 * Cancel — ghost with a red left-bar that slides in on hover.
 * Communicates "exit / abandon" without being aggressive.
 */
const CancelBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="
      group relative overflow-hidden
      inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
      text-sm font-bold
      text-slate-500 dark:text-slate-400
      border border-slate-200 dark:border-slate-600
      bg-white dark:bg-slate-800/60
      hover:text-red-500 dark:hover:text-red-400
      hover:border-red-200 dark:hover:border-red-800/60
      hover:bg-red-50/50 dark:hover:bg-red-900/10
      active:scale-[0.97]
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-800 focus:ring-offset-2
    "
  >
    {/* animated left accent bar */}
    <span className="
      absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full
      bg-red-400 dark:bg-red-500
      scale-y-0 group-hover:scale-y-100
      transition-transform duration-200 origin-center
    " />
    <span className="transition-transform duration-150 group-hover:rotate-90">
      <Icons.Cancel />
    </span>
    Cancel
  </button>
);

/**
 * Back — ghost with arrow that nudges left on hover.
 * Neutral tone — it's safe to go back.
 */
const BackBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="
      group relative
      inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
      text-sm font-bold
      text-slate-600 dark:text-slate-300
      border border-slate-200 dark:border-slate-600
      bg-white dark:bg-slate-800/60
      hover:bg-slate-50 dark:hover:bg-slate-700/60
      hover:border-slate-300 dark:hover:border-slate-500
      active:scale-[0.97]
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
    "
  >
    <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
      <Icons.ArrowLeft />
    </span>
    Back
  </button>
);

/**
 * Continue — cyan → blue gradient with shimmer + arrow nudging right.
 * Primary forward-progress action.
 */
const ContinueBtn = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="
      group relative overflow-hidden
      inline-flex items-center gap-2 px-6 py-2.5 rounded-xl
      text-sm font-bold text-white
      bg-gradient-to-r from-cyan-500 to-blue-600
      shadow-md shadow-cyan-500/25
      hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.97]
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2
    "
  >
    {/* shimmer sweep */}
    <span className="
      absolute inset-0 pointer-events-none
      bg-gradient-to-r from-transparent via-white/20 to-transparent
      -translate-x-full group-hover:translate-x-full
      transition-transform duration-500 ease-out
    " />
    Continue
    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </span>
  </button>
);

/**
 * Submit — emerald → teal gradient, slightly wider padding, send icon.
 * Distinct from Continue — users know this is the terminal action.
 */
const SubmitBtn = ({ disabled, children }) => (
  <button
    type="submit"
    disabled={disabled}
    className="
      group relative overflow-hidden
      inline-flex items-center gap-2 px-7 py-2.5 rounded-xl
      text-sm font-bold text-white
      bg-gradient-to-r from-emerald-500 to-teal-600
      shadow-md shadow-emerald-500/25
      hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.97]
      disabled:opacity-60 disabled:cursor-not-allowed
      disabled:hover:translate-y-0 disabled:hover:shadow-md
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2
    "
  >
    <span className="
      absolute inset-0 pointer-events-none
      bg-gradient-to-r from-transparent via-white/20 to-transparent
      -translate-x-full group-hover:translate-x-full
      transition-transform duration-500 ease-out
    " />
    {children}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const RepairRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [currentStep, setStep]    = useState(1);

  const [formData, setFormData] = useState({
    itemName: '', model: '', modelNumber: '', serialNumber: '', quantity: 1,
    sectionUnitName: '',
    current_username: '', applicantPosition: '', departmentHead: '', handedOverBy: '',
    unitPhone: '', userMobile: '',
    previousMaintenance: 'no', handedOverDate: '', receiptBookInfo: '',
    errorDescription: '', errorDate: '', previousError: 'no',
  });

  useEffect(() => { setTimeout(() => setAnimateIn(true), 80); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step) => {
    if (step === 1 && (!formData.itemName || !formData.model || !formData.serialNumber || !formData.sectionUnitName)) {
      setError('Please fill all required fields in Item Information.'); return false;
    }
    if (step === 2 && (!formData.current_username || !formData.departmentHead || !formData.handedOverBy)) {
      setError('Please fill all required fields in User Information.'); return false;
    }
    if (step === 4 && (!formData.errorDescription || !formData.errorDate)) {
      setError('Please describe the issue and provide the error date.'); return false;
    }
    setError(''); return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setStep(s => Math.min(s + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);
    setError('');
    try {
      const response = await repairAPI.create({
        asset_name:           formData.itemName,
        model:                formData.model,
        model_number:         formData.modelNumber,
        serial_number:        formData.serialNumber,
        quantity:             formData.quantity,
        section_unit_name:    formData.sectionUnitName,
        current_username:     formData.current_username,
        applicant_position:   formData.applicantPosition,
        department_head:      formData.departmentHead,
        handed_over_by:       formData.handedOverBy,
        unit_phone:           formData.unitPhone,
        user_mobile:          formData.userMobile,
        previous_maintenance: formData.previousMaintenance,
        handed_over_date:     formData.handedOverDate,
        receipt_book_info:    formData.receiptBookInfo,
        issue_description:    formData.errorDescription,
        error_date:           formData.errorDate,
        previous_error:       formData.previousError,
        submitted_date:       new Date().toISOString().split('T')[0],
      });
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/repairs'), 3000);
      } else {
        setError(response.data.message || 'Failed to submit repair request');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-56 -right-56 w-[480px] h-[480px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-amber-300/8 dark:bg-amber-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60 py-3'
            : 'bg-transparent py-4'
        }`}
        style={{ animation: 'slideInDown 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BackBtn onClick={() => navigate('/repairs')} />
            <div>
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                New Repair Request
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">
                Step {currentStep} of {STEPS.length} — {STEPS[currentStep - 1].label}
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-400/30">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={`max-w-4xl mx-auto px-4 sm:px-6 py-8 transition-all duration-500 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        {success ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <SuccessScreen />
          </div>
        ) : (
          <>
            <Stepper current={currentStep} steps={STEPS} />

            {error && (
              <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-xl text-sm text-red-700 dark:text-red-300 font-medium animate-slideInDown">
                <Icons.Alert /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Step 1 */}
              {currentStep === 1 && (
                <StepCard icon={Icons.Laptop} title="Item Information" accent="cyan">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FInput label="Item Name" name="itemName" required icon={Icons.Laptop}
                      value={formData.itemName} onChange={handleChange}
                      placeholder="e.g. Dell Laptop, HP Printer" />
                    <FInput label="Model" name="model" required
                      value={formData.model} onChange={handleChange}
                      placeholder="e.g. Inspiron 15, LaserJet Pro" />
                    <FInput label="Model Number" name="modelNumber"
                      value={formData.modelNumber} onChange={handleChange}
                      placeholder="e.g. P125F, M428fdw" />
                    <FInput label="Serial Number" name="serialNumber" required icon={Icons.Document}
                      value={formData.serialNumber} onChange={handleChange}
                      placeholder="Enter serial number" />
                    <FInput label="Quantity" name="quantity" type="number" required
                      value={formData.quantity} onChange={handleChange} placeholder="1" />
                    <SearchableDropdown
                      label="Section / Unit Name" name="sectionUnitName" required
                      value={formData.sectionUnitName} onChange={handleChange}
                      options={SECTION_UNIT_OPTIONS} placeholder="Select section or unit…" />
                  </div>
                </StepCard>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <StepCard icon={Icons.User} title="User Information" accent="blue">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FInput label="Current User" name="current_username" required icon={Icons.User}
                      value={formData.current_username} onChange={handleChange}
                      placeholder="Name of person using the item" />
                    <FInput label="Applicant's Position" name="applicantPosition"
                      value={formData.applicantPosition} onChange={handleChange}
                      placeholder="e.g. Senior Accountant" />
                    <FInput label="Department Head" name="departmentHead" required icon={Icons.User}
                      value={formData.departmentHead} onChange={handleChange}
                      placeholder="Name of department head" />
                    <FInput label="Handed Over By" name="handedOverBy" required
                      value={formData.handedOverBy} onChange={handleChange}
                      placeholder="Person who handed over the item" />
                    <FInput label="Unit Phone" name="unitPhone" type="tel" icon={Icons.Phone}
                      value={formData.unitPhone} onChange={handleChange} placeholder="011-1234567" />
                    <FInput label="User Mobile" name="userMobile" type="tel" icon={Icons.Phone}
                      value={formData.userMobile} onChange={handleChange} placeholder="071-1234567" />
                  </div>
                </StepCard>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <StepCard icon={Icons.Calendar} title="Maintenance History" accent="amber">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <YesNoToggle label="Previous Maintenance?" name="previousMaintenance"
                      value={formData.previousMaintenance} onChange={handleChange} />
                    <FInput label="Date of Handover to the ICT unit" name="handedOverDate" type="date"
                      icon={Icons.Calendar} value={formData.handedOverDate} onChange={handleChange} />
                    <div className="sm:col-span-2">
                      <FInput label="Receipt Book & Page Number" name="receiptBookInfo"
                        icon={Icons.Document} value={formData.receiptBookInfo} onChange={handleChange}
                        placeholder="e.g. Book No: 05, Page: 120" />
                    </div>
                  </div>
                </StepCard>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <StepCard icon={Icons.Alert} title="Issue Details" accent="red">
                  <div className="space-y-5">
                    <FTextarea label="Error / Issue Description" name="errorDescription" required rows={5}
                      value={formData.errorDescription} onChange={handleChange}
                      placeholder="Describe the issue in detail — symptoms, when it started, error messages…" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FInput label="Date of Error" name="errorDate" type="date" required
                        icon={Icons.Calendar} value={formData.errorDate} onChange={handleChange} />
                      <YesNoToggle label="Previous Similar Error?" name="previousError"
                        value={formData.previousError} onChange={handleChange} />
                    </div>
                  </div>
                </StepCard>
              )}

              {/* ── Navigation row ─────────────────────────────────── */}
              <div className="flex items-center justify-between gap-4 pt-2">

                {/* Left side */}
                {currentStep === 1
                  ? <CancelBtn onClick={() => navigate('/repairs')} />
                  : <BackBtn onClick={goBack} />
                }

                {/* Centre dots */}
                <div className="flex items-center gap-1.5">
                  {STEPS.map(s => (
                    <span key={s.id} className={`rounded-full transition-all duration-300 ${
                      s.id === currentStep ? 'w-6 h-2 bg-cyan-500'
                      : s.id < currentStep  ? 'w-2 h-2 bg-emerald-400'
                      :                       'w-2 h-2 bg-slate-200 dark:bg-slate-600'
                    }`} />
                  ))}
                </div>

                {/* Right side */}
                {currentStep < STEPS.length ? (
                  <ContinueBtn onClick={goNext} />
                ) : (
                  <SubmitBtn disabled={loading}>
                    {loading
                      ? <><Icons.Spinner /> Submitting…</>
                      : <><Icons.Send /> Submit Request</>
                    }
                  </SubmitBtn>
                )}
              </div>

            </form>
          </>
        )}
      </main>

      <style>{`
        @keyframes slideInDown { from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dropdownIn  { from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blob        { 0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)} }
        .animate-blob        { animation: blob 9s infinite ease-in-out; }
        .animate-fadeInUp    { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slideInDown { animation: slideInDown 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .animation-delay-300 { animation-delay:300ms; }
        .animation-delay-500 { animation-delay:500ms; }
        /* Thin scrollbar for dropdown list */
        .rr-scrollbar::-webkit-scrollbar { width: 4px; }
        .rr-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .rr-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .dark .rr-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  );
};

export default RepairRequestPage;