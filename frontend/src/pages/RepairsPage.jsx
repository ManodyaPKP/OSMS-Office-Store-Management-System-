import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairAPI } from '../services/api';
import { getErrorMessage, formatDate } from '../utils/helpers';
import html2pdf from 'html2pdf.js';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
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
  Wrench: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  WrenchSm: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Cog: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  XSmall: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Printer: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  completed:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  pending:     { label: 'Pending',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',         dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
  in_progress: { label: 'In Progress', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',             dot: 'bg-blue-500',    bar: 'bg-blue-500'    },
  in_repair:   { label: 'In Repair',   cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',     dot: 'bg-violet-500',  bar: 'bg-violet-500'  },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',                 dot: 'bg-red-500',     bar: 'bg-red-500'     },
};

const StatusPill = ({ status }) => {
  const { label, cls, dot } = STATUS_MAP[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
};

// ─── Animated stat counter ────────────────────────────────────────────────────
const AnimatedNumber = ({ value, duration = 900 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    const target = Number(value);
    const start  = performance.now();
    const tick   = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 4); // ease-out-quart
      setDisplay(Math.round(e * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <>{display}</>;
};

// ─── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, delay = 0 }) => {
  const a = {
    cyan:    { bg: 'bg-cyan-500',    ring: 'ring-cyan-200 dark:ring-cyan-800',       text: 'text-cyan-600 dark:text-cyan-400',    glow: 'group-hover:shadow-cyan-500/20'    },
    emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-800', text: 'text-emerald-600 dark:text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
    amber:   { bg: 'bg-amber-500',   ring: 'ring-amber-200 dark:ring-amber-800',     text: 'text-amber-600 dark:text-amber-400',  glow: 'group-hover:shadow-amber-500/20'   },
    violet:  { bg: 'bg-violet-500',  ring: 'ring-violet-200 dark:ring-violet-800',   text: 'text-violet-600 dark:text-violet-400', glow: 'group-hover:shadow-violet-500/20' },
  }[accent] ?? {};

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out animate-fadeInUp ${a.glow}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* subtle hover tint */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-transparent to-slate-50/40 dark:to-white/[0.02] rounded-2xl pointer-events-none" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
          <p className={`text-3xl font-black tabular-nums ${a.text}`}>
            <AnimatedNumber value={value} />
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${a.bg} text-white shadow-md ring-4 ${a.ring} flex-shrink-0`}>
          {Icon && <Icon />}
        </div>
      </div>
    </div>
  );
};

// ─── Delete confirmation modal ────────────────────────────────────────────────
const DeleteConfirmModal = ({ repairId, onConfirm, onCancel }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    style={{ animation: 'fadeIn 0.15s ease-out both' }}
  >
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <div
      className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
      style={{ animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Warning icon */}
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Delete Repair #{String(repairId).padStart(4,'0')}?</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
        This action is permanent and cannot be undone. All data for this request will be removed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 active:scale-[0.97]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Detail row ───────────────────────────────────────────────────────────────
const DetailRow = ({ label, value, mono = false, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
    <p className={`text-sm font-semibold text-slate-800 dark:text-slate-200 break-words ${mono ? 'font-mono' : ''}`}>
      {value || <span className="font-normal italic text-slate-300 dark:text-slate-600">—</span>}
    </p>
  </div>
);

// ─── Modal section ────────────────────────────────────────────────────────────
const ModalSection = ({ icon: Icon, title, accent = 'cyan', children }) => {
  const SectionIcon = Icon || Icons.WrenchSm;
  const acc = {
    cyan:   'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500',
    amber:  'bg-amber-50 dark:bg-amber-900/30 text-amber-500',
    blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-500',
    red:    'bg-red-50 dark:bg-red-900/30 text-red-500',
  }[accent] ?? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500';

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-700/50">
        <span className={`p-1.5 rounded-lg ${acc}`}><SectionIcon /></span>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">{children}</div>
    </div>
  );
};

// ─── PDF generation ───────────────────────────────────────────────────────────
const generatePDF = (repair) => {
  const el = document.createElement('div');
  el.style.cssText = 'padding:20px;font-family:Arial,sans-serif;background:white;color:#333';
  el.innerHTML = `
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,sans-serif;line-height:1.4;color:#333}
      .header{text-align:center;margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #0284c7}
      .header h1{color:#0284c7;font-size:22px;margin-bottom:5px}
      .header p{color:#666;font-size:11px;margin:2px 0}
      .req-id{text-align:right;font-size:11px;color:#666;margin-bottom:15px}
      .section{margin-bottom:20px;page-break-inside:avoid}
      .section-title{font-size:14px;font-weight:bold;color:#0284c7;border-bottom:1px solid #ccc;padding-bottom:5px;margin-bottom:12px}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px 20px}
      .item{margin-bottom:6px}
      .lbl{font-size:10px;font-weight:bold;color:#666;text-transform:uppercase;margin-bottom:2px}
      .val{font-size:12px;color:#333;word-break:break-word}
      .full{grid-column:span 2}
      .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:bold}
      .b-yes{background:#d1fae5;color:#059669}
      .b-no{background:#fef3c7;color:#d97706}
      .b-pending{background:#fef3c7;color:#d97706}
      .b-completed{background:#d1fae5;color:#059669}
      .b-in_progress{background:#dbeafe;color:#2563eb}
      .desc{background:#f8fafc;padding:10px;border-radius:6px;margin-top:5px;border-left:3px solid #0284c7;font-size:12px}
      .footer-bar{display:flex;justify-content:space-between;margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px}
      .footer{margin-top:30px;text-align:center;font-size:9px;color:#999;border-top:1px solid #ccc;padding-top:10px}
    </style>
    <div class="header">
      <h1>OFFICE STORE MANAGEMENT SYSTEM</h1>
      <p>Repair Request Form — Department of Government Information</p>
    </div>
    <div class="req-id">Request ID: OSMS-${String(repair.id).padStart(6,'0')} | Generated: ${new Date().toLocaleDateString()}</div>

    <div class="section">
      <div class="section-title">📦 ITEM INFORMATION</div>
      <div class="grid">
        <div class="item"><div class="lbl">Item Name</div><div class="val">${repair.asset_name||'—'}</div></div>
        <div class="item"><div class="lbl">Model</div><div class="val">${repair.model||'—'}</div></div>
        <div class="item"><div class="lbl">Model Number</div><div class="val">${repair.model_number||'—'}</div></div>
        <div class="item"><div class="lbl">Serial Number</div><div class="val">${repair.serial_number||'—'}</div></div>
        <div class="item"><div class="lbl">Quantity</div><div class="val">${repair.quantity||1}</div></div>
        <div class="item"><div class="lbl">Section / Unit</div><div class="val">${repair.section_unit_name||'—'}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">👤 USER INFORMATION</div>
      <div class="grid">
        <div class="item"><div class="lbl">Current User</div><div class="val">${repair.current_username||'—'}</div></div>
        <div class="item"><div class="lbl">Applicant Position</div><div class="val">${repair.applicant_position||'—'}</div></div>
        <div class="item"><div class="lbl">Department Head</div><div class="val">${repair.department_head||'—'}</div></div>
        <div class="item"><div class="lbl">Handed Over By</div><div class="val">${repair.handed_over_by||'—'}</div></div>
        <div class="item"><div class="lbl">Unit Phone</div><div class="val">${repair.unit_phone||'—'}</div></div>
        <div class="item"><div class="lbl">User Mobile</div><div class="val">${repair.user_mobile||'—'}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📅 MAINTENANCE HISTORY</div>
      <div class="grid">
        <div class="item"><div class="lbl">Previous Maintenance</div><div class="val"><span class="badge ${repair.previous_maintenance==='yes'?'b-yes':'b-no'}">${repair.previous_maintenance==='yes'?'Yes':'No'}</span></div></div>
        <div class="item"><div class="lbl">Handed Over Date</div><div class="val">${formatDate(repair.handed_over_date)||'—'}</div></div>
        <div class="item full"><div class="lbl">Receipt Book & Page Number</div><div class="val">${repair.receipt_book_info||'—'}</div></div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">⚠️ ISSUE DETAILS</div>
      <div class="grid">
        <div class="item full"><div class="lbl">Error / Issue Description</div><div class="desc">${repair.issue_description||'—'}</div></div>
        <div class="item"><div class="lbl">Date of Error</div><div class="val">${formatDate(repair.error_date)||'—'}</div></div>
        <div class="item"><div class="lbl">Previous Similar Error</div><div class="val"><span class="badge ${repair.previous_error==='yes'?'b-yes':'b-no'}">${repair.previous_error==='yes'?'Yes':'No'}</span></div></div>
      </div>
    </div>

    <div class="footer-bar">
      <div><div style="font-size:9px;font-weight:bold;color:#666;text-transform:uppercase">Current Status</div>
        <span class="badge b-${repair.repair_status||'pending'}">${(repair.repair_status||'PENDING').toUpperCase()}</span></div>
      <div style="text-align:right"><div style="font-size:9px;font-weight:bold;color:#666;text-transform:uppercase">Submitted</div>
        <div style="font-size:12px;font-weight:bold">${formatDate(repair.submitted_date)||'—'}</div></div>
    </div>
    <div class="footer">
      <p>Computer-generated document — no signature required.</p>
      <p>OSMS – Office Store Management System | ${new Date().toLocaleString()}</p>
    </div>
  `;

  html2pdf().set({
    margin: [0.5,0.5,0.5,0.5],
    filename: `Repair_Request_OSMS-${String(repair.id).padStart(6,'0')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  }).from(el).save();
};

// ─── Action button variants for modal ────────────────────────────────────────
const ModalActionBtn = ({ onClick, icon: Icon, label, variant = 'ghost' }) => {
  const v = {
    ghost:  'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600',
    cyan:   'text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-700',
    danger: 'text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200 dark:hover:border-red-700',
  }[variant];

  return (
    <button
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-95 ${v}`}
    >
      <Icon />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

// ─── Repair Details Modal ─────────────────────────────────────────────────────
const RepairDetailsModal = ({ repair, onClose, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!repair) return null;

  const printRepair = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Repair #${repair.id}</title><style>
      body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:0 auto}
      .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #0284c7;padding-bottom:10px}
      .header h1{color:#0284c7;font-size:20px}
      .section{margin-bottom:18px}
      .section-title{font-size:14px;font-weight:bold;color:#0284c7;border-bottom:1px solid #ccc;margin-bottom:8px;padding-bottom:4px}
      .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
      .lbl{font-weight:bold;color:#666;font-size:11px;text-transform:uppercase}
      .val{font-size:13px}
      .desc{background:#f8fafc;padding:10px;border-left:3px solid #0284c7;margin-top:4px;font-size:12px}
      @media print{body{padding:0}}
    </style></head><body>
      <div class="header"><h1>OFFICE STORE MANAGEMENT SYSTEM</h1><p>Repair Request — OSMS-${String(repair.id).padStart(6,'0')}</p></div>
      <div class="section"><div class="section-title">ITEM INFORMATION</div><div class="grid">
        <div><div class="lbl">Item Name</div><div class="val">${repair.asset_name||'—'}</div></div>
        <div><div class="lbl">Model</div><div class="val">${repair.model||'—'}</div></div>
        <div><div class="lbl">Serial Number</div><div class="val">${repair.serial_number||'—'}</div></div>
        <div><div class="lbl">Section/Unit</div><div class="val">${repair.section_unit_name||'—'}</div></div>
      </div></div>
      <div class="section"><div class="section-title">USER INFORMATION</div><div class="grid">
        <div><div class="lbl">Current User</div><div class="val">${repair.current_username||'—'}</div></div>
        <div><div class="lbl">Department Head</div><div class="val">${repair.department_head||'—'}</div></div>
        <div><div class="lbl">Handed Over By</div><div class="val">${repair.handed_over_by||'—'}</div></div>
      </div></div>
      <div class="section"><div class="section-title">ISSUE DETAILS</div>
        <div class="lbl">Error Description</div><div class="desc">${repair.issue_description||'—'}</div>
        <div style="margin-top:8px"><div class="lbl">Date of Error</div><div class="val">${formatDate(repair.error_date)||'—'}</div></div>
      </div>
    </body></html>`);
    w.document.close(); w.print(); w.close();
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete(repair.id);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: 'fadeIn 0.2s ease-out both' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── Modal header ── */}
          <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-700/60 flex-shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                  OSMS-{String(repair.id).padStart(6,'0')}
                </span>
                <StatusPill status={repair.repair_status} />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {formatDate(repair.submitted_date)}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight truncate">
                {repair.asset_name || 'Repair Request'}
              </h2>
              {repair.model && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{repair.model}{repair.serial_number ? ` · SN: ${repair.serial_number}` : ''}</p>
              )}
            </div>

            {/* Action toolbar */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <ModalActionBtn onClick={() => generatePDF(repair)} icon={Icons.Download} label="PDF"     variant="cyan"   />
              <ModalActionBtn onClick={printRepair}               icon={Icons.Printer}  label="Print"   variant="ghost"  />
              <ModalActionBtn onClick={() => setConfirmDelete(true)} icon={Icons.Trash} label="Delete"  variant="danger" />
              {/* Divider */}
              <span className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90"
              >
                <Icons.X />
              </button>
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-7 py-6 space-y-7 rr-scrollbar">

            <ModalSection icon={Icons.WrenchSm} title="Item Information" accent="cyan">
              <DetailRow label="Item Name"     value={repair.asset_name}       />
              <DetailRow label="Model"         value={repair.model}            />
              <DetailRow label="Model Number"  value={repair.model_number}  mono />
              <DetailRow label="Serial Number" value={repair.serial_number} mono />
              <DetailRow label="Quantity"      value={repair.quantity || 1}    />
              <DetailRow label="Section / Unit" value={repair.section_unit_name} />
            </ModalSection>

            <ModalSection icon={Icons.User} title="User Information" accent="blue">
              <DetailRow label="Current User"       value={repair.current_username}  />
              <DetailRow label="Applicant Position" value={repair.applicant_position} />
              <DetailRow label="Department Head"    value={repair.department_head}   />
              <DetailRow label="Handed Over By"     value={repair.handed_over_by}    />
              <DetailRow label="Unit Phone"         value={repair.unit_phone}        />
              <DetailRow label="User Mobile"        value={repair.user_mobile}       />
            </ModalSection>

            <ModalSection icon={Icons.Calendar} title="Maintenance History" accent="amber">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Previous Maintenance</p>
                <StatusPill status={repair.previous_maintenance === 'yes' ? 'completed' : 'pending'} />
              </div>
              <DetailRow label="Handed Over Date" value={formatDate(repair.handed_over_date)} />
              <DetailRow label="Receipt Book & Page No." value={repair.receipt_book_info} fullWidth />
            </ModalSection>

            <ModalSection icon={Icons.Alert} title="Issue Details" accent="red">
              <div className="col-span-2 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Error / Issue Description</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 leading-relaxed border border-slate-100 dark:border-slate-700/60">
                  {repair.issue_description || '—'}
                </p>
              </div>
              <DetailRow label="Date of Error" value={formatDate(repair.error_date)} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Previous Similar Error</p>
                <StatusPill status={repair.previous_error === 'yes' ? 'completed' : 'pending'} />
              </div>
            </ModalSection>

            {/* Status footer bar */}
            <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/40">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">Status</p>
                <StatusPill status={repair.repair_status} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Submitted</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(repair.submitted_date)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {confirmDelete && (
        <DeleteConfirmModal
          repairId={repair.id}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
};

// ─── Filter pill (status tab) ─────────────────────────────────────────────────
const FilterPill = ({ label, value, active, dot, onClick }) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold
      transition-all duration-200 whitespace-nowrap active:scale-[0.97] focus:outline-none
      ${active
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
        : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
      }
    `}
  >
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
    {label}
  </button>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const RepairsPage = () => {
  const navigate = useNavigate();

  const [repairs, setRepairs]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [animateIn, setAnimateIn]   = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [selectedRepair, setSelected] = useState(null);
  const [search, setSearch]         = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [stats, setStats]           = useState({});

  const statusTabs = [
    { value: '',            label: 'All',         dot: ''             },
    { value: 'pending',     label: 'Pending',     dot: 'bg-amber-500' },
    { value: 'in_repair',   label: 'In Repair',   dot: 'bg-violet-500'},
    { value: 'in_progress', label: 'In Progress', dot: 'bg-blue-500'  },
    { value: 'completed',   label: 'Completed',   dot: 'bg-emerald-500'},
    { value: 'cancelled',   label: 'Cancelled',   dot: 'bg-red-500'   },
  ];

  useEffect(() => {
    loadRepairs();
    loadStats();
    setTimeout(() => setAnimateIn(true), 80);
  }, [activeStatus]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const loadRepairs = async () => {
    try {
      setLoading(true);
      const response = await repairAPI.getAll({ status: activeStatus });
      if (response.data.success) setRepairs(response.data.data);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await repairAPI.getStats();
      if (response.data.success) setStats(response.data.data);
    } catch {}
  };

  const showError = (msg) => { setError(msg); setTimeout(() => setError(''), 4000); };
  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };

  const handleDeleteRepair = async (repairId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/repairs/${repairId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        await loadRepairs();
        await loadStats();
        setSelected(null);
        showSuccess('Repair request deleted successfully.');
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      showError('Failed to delete repair request. Please try again.');
    }
  };

  // Client-side search filter
  const filtered = repairs.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.asset_name         || '').toLowerCase().includes(q) ||
      (r.model              || '').toLowerCase().includes(q) ||
      (r.serial_number      || '').toLowerCase().includes(q) ||
      (r.section_unit_name  || '').toLowerCase().includes(q) ||
      (r.current_username   || '').toLowerCase().includes(q) ||
      String(r.id).includes(q)
    );
  });

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading && repairs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-100 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading repairs…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-56 -right-56 w-[480px] h-[480px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-blob animation-delay-300" />
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-amber-300/10 dark:bg-amber-600/5 rounded-full blur-3xl animate-blob animation-delay-500" />
      </div>

      {/* ── Navbar ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60 py-3'
            : 'bg-transparent py-4'
        }`}
        style={{ animation: 'slideInDown 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95 transition-all duration-200"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5"><Icons.ArrowLeft /></span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div>
              <h1 className="text-base font-black tracking-tight bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent leading-none">
                Repair Management
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none font-semibold uppercase tracking-wider">
                {repairs.length} {repairs.length === 1 ? 'record' : 'records'} · Track & manage
              </p>
            </div>
          </div>

          {/* New repair request CTA */}
          <button
            onClick={() => navigate('/repair-request')}
            className="group relative overflow-hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/25 hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
            <Icons.Plus />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ease-out ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>

        {/* Toasts */}
        <div className="space-y-2 mb-6">
          {successMsg && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-400 rounded-xl text-sm text-emerald-700 dark:text-emerald-300 font-medium animate-slideInDown">
              <Icons.Check /> {successMsg}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-xl text-sm text-red-700 dark:text-red-300 font-medium animate-slideInDown">
              <Icons.Alert /> {error}
            </div>
          )}
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Repairs" value={stats.total_repairs        || repairs.length || 0} icon={Icons.Wrench} accent="cyan"    delay={40}  />
          <StatCard label="Completed"     value={stats.completed_repairs    || 0}                   icon={Icons.Check}  accent="emerald" delay={80}  />
          <StatCard label="Pending"       value={stats.pending_repairs      || 0}                   icon={Icons.Clock}  accent="amber"   delay={120} />
          <StatCard label="In Progress"   value={stats.in_progress_repairs  || 0}                   icon={Icons.Cog}    accent="violet"  delay={160} />
        </div>

        {/* ── Search & Filter row ── */}
        <div
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm px-5 py-4 mb-4 animate-fadeInUp"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          {/* Search bar */}
          <div className="relative mb-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 pointer-events-none">
              <Icons.Search />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by item, serial, section, user or ID…"
              className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
              >
                <Icons.XSmall />
              </button>
            )}
          </div>

          {/* Status pill tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 flex-shrink-0"><Icons.Filter /></span>
            {statusTabs.map(tab => (
              <FilterPill
                key={tab.value}
                value={tab.value}
                label={tab.label}
                dot={tab.dot}
                active={activeStatus === tab.value}
                onClick={() => setActiveStatus(tab.value)}
              />
            ))}
            <span className="ml-auto text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full flex-shrink-0">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          </div>
        </div>

        {/* ── Table card ── */}
        <div
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden animate-fadeInUp"
          style={{ animationDelay: '240ms', animationFillMode: 'both' }}
        >
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <Icons.Wrench />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700 dark:text-slate-200 text-base">
                  {search || activeStatus ? 'No matching repairs' : 'No repair requests yet'}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  {search || activeStatus
                    ? 'Try clearing your search or status filter'
                    : 'Click "New Request" to log your first repair'}
                </p>
              </div>
              {!search && !activeStatus && (
                <button
                  onClick={() => navigate('/repair-request')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-all"
                >
                  <Icons.Plus /> Create First Request
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/60">
                    {['ID', 'Item / Model', 'Serial #', 'Section / Unit', 'Current User', 'Submitted', 'Status', ''].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((repair) => {
                    const status = STATUS_MAP[repair.repair_status];
                    return (
                      <tr
                        key={repair.id}
                        onClick={() => setSelected(repair)}
                        className="group relative border-b border-slate-50 dark:border-slate-700/30 last:border-0 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10 cursor-pointer transition-colors duration-150"
                      >
                        {/* Left accent on hover */}
                        <td className="px-5 py-4 relative">
                          <span className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${status?.bar || 'bg-cyan-400'}`} />
                          <span className="font-mono text-xs font-black text-slate-400 dark:text-slate-500">
                            #{String(repair.id).padStart(4,'0')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{repair.asset_name || '—'}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{repair.model || 'No model'}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                            {repair.serial_number || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-300 dark:text-slate-600 flex-shrink-0"><Icons.Building /></span>
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                              {repair.section_unit_name || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 dark:text-slate-300 flex-shrink-0">
                              {(repair.current_username || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                              {repair.current_username || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {formatDate(repair.submitted_date)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={repair.repair_status} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="opacity-0 group-hover:opacity-100 transition-all duration-150 text-cyan-500 group-hover:translate-x-0 -translate-x-1">
                            <Icons.Eye />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Table footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-800/40">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Showing <span className="text-slate-600 dark:text-slate-300">{filtered.length}</span> of <span className="text-slate-600 dark:text-slate-300">{repairs.length}</span> repairs
                </p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium uppercase tracking-wider">
                  Click any row to view details
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <RepairDetailsModal repair={selectedRepair} onClose={() => setSelected(null)} onDelete={handleDeleteRepair} />

      <style>{`
        @keyframes slideInDown { from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeInUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn      { from{opacity:0}to{opacity:1} }
        @keyframes slideUp     { from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes blob        { 0%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-50px) scale(1.1)}66%{transform:translate(-20px,20px) scale(0.9)}100%{transform:translate(0,0) scale(1)} }
        .animate-blob        { animation: blob 9s infinite ease-in-out; }
        .animate-fadeInUp    { animation: fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .animate-slideInDown { animation: slideInDown 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .rr-scrollbar::-webkit-scrollbar { width: 4px; }
        .rr-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .rr-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .dark .rr-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
      `}</style>
    </div>
  );
};

export default RepairsPage;