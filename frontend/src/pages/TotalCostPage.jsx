import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../services/api';
import { getErrorMessage, formatCurrency, formatDate } from '../utils/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM — Modern Dashboard Theme
// ═══════════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,700&display=swap');

    :root {
      --bg-deep:      #f5f4f0;
      --bg-surface:   rgba(255,255,255,0.9);
      --bg-raised:    rgba(255,255,255,0.97);
      --bg-overlay:   #ffffff;

      --border-light: rgba(0,0,0,0.07);
      --border-mid:   rgba(0,0,0,0.13);

      --gold:         #e8a020;
      --gold-light:   #fef3c7;
      --gold-dim:     rgba(232,160,32,0.13);
      --cyan:         #0891b2;
      --cyan-dim:     rgba(8,145,178,0.11);
      --emerald:      #059669;
      --emerald-dim:  rgba(5,150,105,0.11);
      --rose:         #e53e3e;
      --rose-dim:     rgba(229,62,62,0.11);
      --purple:       #7c3aed;
      --purple-dim:   rgba(124,58,237,0.11);
      --blue:         #2563eb;
      --blue-dim:     rgba(37,99,235,0.11);
      --warm-brown:   #78350f;

      --text-primary:   #1a1410;
      --text-secondary: #3d3530;
      --text-muted:     #7c6f65;

      --font-display: 'DM Sans', sans-serif;
      --font-serif:   'Fraunces', Georgia, serif;
      --font-mono:    'DM Mono', monospace;

      --shadow-card:   0 1px 4px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.03);
      --shadow-hover:  0 8px 32px -8px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.04);
      --shadow-modal:  0 32px 64px -16px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.06);
      --shadow-lifted: 0 20px 60px -20px rgba(0,0,0,0.18);

      --radius-card: 18px;
      --radius-btn:  10px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .tc-root {
      font-family: var(--font-display);
      background: var(--bg-deep);
      color: var(--text-primary);
      min-height: 100vh;
    }

    /* ── Animated background mesh ── */
    .tc-ambient {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .tc-ambient::before {
      content: '';
      position: absolute;
      width: 900px; height: 900px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(232,160,32,0.07) 0%, transparent 70%);
      top: -200px; right: -200px;
      animation: ambientDrift 18s ease-in-out infinite alternate;
    }
    .tc-ambient::after {
      content: '';
      position: absolute;
      width: 700px; height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(8,145,178,0.06) 0%, transparent 70%);
      bottom: -100px; left: -100px;
      animation: ambientDrift 22s ease-in-out infinite alternate-reverse;
    }
    @keyframes ambientDrift {
      from { transform: translate(0, 0) scale(1); }
      to   { transform: translate(60px, 40px) scale(1.08); }
    }

    /* ── Navigation ── */
    .tc-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(24px) saturate(1.5);
      -webkit-backdrop-filter: blur(24px) saturate(1.5);
      background: rgba(245,244,240,0.88);
      border-bottom: 1px solid var(--border-light);
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .tc-nav.scrolled {
      background: rgba(245,244,240,0.97);
      box-shadow: 0 1px 0 var(--border-light), 0 4px 20px rgba(0,0,0,0.06);
    }
    .tc-nav-inner {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 32px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .tc-nav-brand {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .tc-back-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-btn);
      padding: 8px 15px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      letter-spacing: 0.01em;
    }
    .tc-back-btn:hover {
      background: white;
      border-color: var(--border-mid);
      color: var(--text-secondary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      transform: translateX(-2px);
    }
    .tc-brand-title {
      font-family: var(--font-serif);
      font-size: 19px;
      font-weight: 700;
      font-style: italic;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    .tc-brand-sub {
      font-size: 10px;
      color: var(--text-muted);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-top: 1px;
      font-weight: 500;
    }
    .tc-nav-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Buttons ── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 600;
      border-radius: var(--radius-btn);
      padding: 8px 16px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      border: 1px solid var(--border-light);
      background: white;
      color: var(--text-secondary);
      letter-spacing: 0.01em;
      position: relative;
      overflow: hidden;
    }
    .btn::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.2s;
    }
    .btn:hover {
      background: white;
      border-color: rgba(0,0,0,0.16);
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .btn:hover::after { opacity: 1; }
    .btn:active { transform: translateY(0); }

    .btn-gold {
      background: linear-gradient(135deg, #f0a830 0%, #d4851a 100%);
      border: none;
      color: white;
      box-shadow: 0 2px 10px rgba(232,160,32,0.30), inset 0 1px 0 rgba(255,255,255,0.25);
      text-shadow: 0 1px 2px rgba(0,0,0,0.15);
    }
    .btn-gold:hover {
      background: linear-gradient(135deg, #e8a020 0%, #c47816 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(232,160,32,0.38), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .btn-icon {
      width: 38px; height: 38px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-btn);
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      color: var(--text-muted);
    }
    .btn-icon:hover {
      background: white;
      border-color: var(--border-mid);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transform: scale(1.05);
      color: var(--text-secondary);
    }
    .btn-close {
      width: 32px; height: 32px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      color: var(--text-muted);
    }
    .btn-close:hover {
      background: #f1ede8;
      transform: rotate(90deg);
      color: var(--text-primary);
    }

    /* ── Main Content ── */
    .tc-main {
      position: relative;
      z-index: 1;
      max-width: 1440px;
      margin: 0 auto;
      padding: 36px 32px 88px;
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    .tc-main.visible { opacity: 1; transform: translateY(0); }

    /* ── Staggered child animations ── */
    .tc-main.visible > *:nth-child(1) { animation: fadeSlideUp 0.55s cubic-bezier(0.4,0,0.2,1) both; }
    .tc-main.visible > *:nth-child(2) { animation: fadeSlideUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.08s both; }
    .tc-main.visible > *:nth-child(3) { animation: fadeSlideUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.16s both; }
    .tc-main.visible > *:nth-child(4) { animation: fadeSlideUp 0.55s cubic-bezier(0.4,0,0.2,1) 0.24s both; }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(22px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── KPI Cards Grid ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 36px;
    }
    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 640px)  { .kpi-grid { grid-template-columns: 1fr; } }

    .kpi-card {
      background: white;
      border-radius: var(--radius-card);
      padding: 22px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--border-light);
      transition: all 0.32s cubic-bezier(0.4,0,0.2,1);
      cursor: pointer;
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: var(--card-accent, var(--gold));
      opacity: 0;
      transition: opacity 0.25s;
    }
    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-hover);
      border-color: transparent;
    }
    .kpi-card:hover::before { opacity: 1; }
    .kpi-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .kpi-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .kpi-badge {
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 20px;
      letter-spacing: 0.04em;
    }
    .kpi-badge.gold    { background: var(--gold-dim); color: #b45309; }
    .kpi-badge.cyan    { background: var(--cyan-dim); color: #0e7490; }
    .kpi-badge.emerald { background: var(--emerald-dim); color: #047857; }
    .kpi-badge.rose    { background: var(--rose-dim); color: #c53030; }

    .kpi-main-value {
      font-family: var(--font-serif);
      font-size: 30px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.03em;
      margin-bottom: 4px;
      line-height: 1.1;
    }
    .kpi-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 18px;
    }
    .kpi-mini-chart { height: 80px; margin-top: 8px; }
    .kpi-trend {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 600;
      margin-top: 14px;
      padding: 4px 10px;
      border-radius: 20px;
    }
    .kpi-trend.up   { background: var(--emerald-dim); color: #047857; }
    .kpi-trend.down { background: var(--rose-dim); color: #c53030; }

    /* ── Panel Cards ── */
    .panel {
      background: white;
      border-radius: var(--radius-card);
      border: 1px solid var(--border-light);
      overflow: hidden;
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s;
    }
    .panel:hover { box-shadow: var(--shadow-hover); }
    .panel-header {
      padding: 20px 26px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(248,246,242,0.4));
    }
    .panel-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .panel-title-icon { font-size: 18px; }
    .panel-title-text {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    .panel-body { padding: 26px; }

    /* ── Tabs ── */
    .tc-tabs {
      display: flex;
      gap: 4px;
      background: white;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      padding: 5px;
      margin: 0 auto 28px;
      width: min(100%, 1080px);
      justify-content: center;
      flex-wrap: wrap;
      box-shadow: var(--shadow-card);
    }
    .tc-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      padding: 9px 20px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      background: transparent;
      border: none;
      letter-spacing: 0.01em;
      position: relative;
    }
    .tc-tab:hover {
      background: var(--bg-deep);
      color: var(--text-secondary);
    }
    .tc-tab.active {
      background: var(--bg-deep);
      color: var(--text-primary);
      box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px var(--border-light);
    }
    .tc-tab.active::after {
      content: '';
      position: absolute;
      bottom: 4px; left: 50%;
      transform: translateX(-50%);
      width: 18px; height: 2px;
      background: var(--gold);
      border-radius: 2px;
    }

    /* ── Tables ── */
    .tc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .tc-table thead tr {
      border-bottom: 1px solid var(--border-light);
      background: #faf8f5;
    }
    .tc-table th {
      padding: 13px 20px;
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      text-align: left;
    }
    .tc-table th.right  { text-align: right; }
    .tc-table th.center { text-align: center; }
    .tc-table td {
      padding: 15px 20px;
      color: var(--text-secondary);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      transition: background 0.15s;
    }
    .tc-table td.right  { text-align: right; }
    .tc-table td.center { text-align: center; }
    .tc-table tbody tr {
      transition: background 0.15s;
    }
    .tc-table tbody tr:hover td { background: #faf8f5; }
    .tc-table .strong { color: var(--text-primary); font-weight: 600; }
    .tc-table .mono   { font-family: var(--font-mono); font-size: 12px; }

    /* ── Badges ── */
    .badge {
      display: inline-flex;
      align-items: center;
      font-size: 9.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 20px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .badge-red    { background: var(--rose-dim);  color: #c53030; }
    .badge-yellow { background: var(--gold-dim);  color: #b45309; }
    .badge-green  { background: var(--emerald-dim); color: #047857; }
    .badge-cyan   { background: var(--cyan-dim);  color: #0e7490; }

    /* ── Progress Bar ── */
    .progress-track {
      flex: 1;
      height: 7px;
      background: #ebe8e3;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1s cubic-bezier(0.4,0,0.2,1);
      position: relative;
    }
    .progress-fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
      animation: shimmer 2.5s ease-in-out infinite;
    }
    .progress-fill.red    { background: linear-gradient(90deg, #f87171, #ef4444); }
    .progress-fill.yellow { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .progress-fill.green  { background: linear-gradient(90deg, #34d399, #10b981); }
    @keyframes shimmer {
      0%   { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    /* ── Donut Card ── */
    .donut-card {
      background: white;
      border-radius: var(--radius-card);
      padding: 22px;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-card);
      transition: box-shadow 0.3s;
    }
    .donut-card:hover { box-shadow: var(--shadow-hover); }
    .donut-title {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 18px;
      letter-spacing: -0.01em;
    }

    /* ── Modal ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 500;
      background: rgba(26,20,16,0.45);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      animation: modalFadeIn 0.2s cubic-bezier(0.4,0,0.2,1);
    }
    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-box {
      background: white;
      border-radius: 24px;
      box-shadow: var(--shadow-modal);
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      animation: modalSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1);
      border: 1px solid var(--border-light);
    }
    .modal-box.wide { max-width: 920px; }
    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .modal-header {
      padding: 26px 30px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(to bottom, #faf8f5, white);
    }
    .modal-title {
      font-family: var(--font-serif);
      font-size: 20px;
      font-weight: 700;
      font-style: italic;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .modal-body { padding: 30px; }
    .modal-footer {
      padding: 20px 30px;
      border-top: 1px solid var(--border-light);
      display: flex;
      gap: 12px;
      background: #faf8f5;
    }

    /* ── Form ── */
    .form-group { display: flex; flex-direction: column; gap: 7px; }
    .form-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }
    .form-input {
      background: #faf8f5;
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 12px 16px;
      font-size: 14px;
      font-family: var(--font-display);
      outline: none;
      color: var(--text-primary);
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
    }
    .form-input:focus {
      background: white;
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(232,160,32,0.12), 0 2px 8px rgba(0,0,0,0.04);
    }
    .form-input::placeholder { color: var(--text-muted); opacity: 0.7; }
    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    /* ── Utility ── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
    .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .overflow-x { overflow-x: auto; }
    .btn-full { width: 100%; justify-content: center; }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      gap: 16px;
      color: var(--text-muted);
    }
    .empty-state .icon { font-size: 40px; opacity: 0.5; }
    .empty-state p { font-size: 14px; }

    .stat-mini {
      padding: 18px 20px;
      background: #faf8f5;
      border-radius: 14px;
      border: 1px solid var(--border-light);
      transition: border-color 0.2s;
    }
    .stat-mini:hover { border-color: var(--border-mid); }
    .stat-mini-label {
      font-size: 10.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    .stat-mini-val {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    /* ── Loading ── */
    .tc-loading {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      background: var(--bg-deep);
    }
    .spinner-ring {
      width: 52px; height: 52px;
      border-radius: 50%;
      border: 3px solid rgba(232,160,32,0.15);
      border-top-color: var(--gold);
      animation: spin 0.75s linear infinite;
      box-shadow: 0 0 20px rgba(232,160,32,0.12);
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Error Banner ── */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--rose-dim);
      border: 1px solid rgba(229,62,62,0.18);
      color: #c53030;
      border-radius: 14px;
      padding: 14px 20px;
      margin-bottom: 28px;
      animation: fadeSlideUp 0.3s ease;
      font-size: 13.5px;
      font-weight: 500;
    }

    /* ── Action Row ── */
    .action-row { display: flex; align-items: center; gap: 8px; justify-content: center; }

    /* ── Quick stat tiles ── */
    .quick-stat-tile {
      padding: 16px;
      background: #faf8f5;
      border-radius: 14px;
      border: 1px solid var(--border-light);
      transition: all 0.22s;
    }
    .quick-stat-tile:hover {
      background: white;
      box-shadow: 0 4px 16px rgba(0,0,0,0.07);
    }

    .card-refresh-btn {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      flex-shrink: 0;
    }
    .card-refresh-btn:hover {
      transform: rotate(18deg) scale(1.04);
    }
    .card-refresh-btn.dark {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.86);
    }
    .card-refresh-btn.dark:hover {
      background: rgba(255,255,255,0.14);
      box-shadow: 0 8px 24px rgba(0,0,0,0.16);
    }
    .card-refresh-btn.light {
      background: #f8fafc;
      border-color: var(--border-light);
      color: var(--text-secondary);
    }
    .card-refresh-btn.light:hover {
      background: white;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const Icons = {
  ArrowLeft: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  Dollar: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Calc: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
  Download: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  Refresh: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  Plus: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>,
  Trash: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Edit: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>,
  Eye: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  Alert: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  Building: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  Spinner: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{animation: 'spin 0.8s linear infinite'}}><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{opacity: 0.25}}/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{opacity: 0.75}}/></svg>,
  Close: () => <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>,
  Filter: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>,
  Chart: () => <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
};

const CHART_COLORS = ['#f59e0b', '#06b6d4', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6'];
const RADIAN = Math.PI / 180;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const percentOf = (part, whole) => (Number(whole) > 0 ? (Number(part) / Number(whole)) * 100 : 0);

const renderOuterDonutLabel = ({ cx, cy, midAngle, outerRadius, percent, name, fill }) => {
  const radius = outerRadius + 14;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      style={{ fontSize: 10.5, fontWeight: 700 }}
    >
      {name} {Math.round((percent || 0) * 100)}%
    </text>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// COST COMPOSITION PANEL (Overview — Cost by Type)
// Horizontal bar chart + stat list, replaces the small DonutPanel in the overview
// ═══════════════════════════════════════════════════════════════════════════════

const CostCompositionPanel = ({ data = [], total }) => {
  const chartData = data.map(item => ({
    name: item.cost_type,
    value: Number(item.total_amount) || 0,
    percent: total > 0 ? ((Number(item.total_amount) / total) * 100).toFixed(1) : '0.0',
  }));

  if (chartData.length === 0) {
    return (
      <div className="donut-card" style={{ padding: 24 }}>
        <div className="donut-title" style={{ marginBottom: 24, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: 'rgba(232,160,32,0.12)', padding: '6px 12px', borderRadius: 40, fontSize: 12 }}>📊</span> Cost by Type
        </div>
        <div className="empty-state"><span className="icon">📊</span><p>No cost type data available</p></div>
      </div>
    );
  }

  return (
    <div className="donut-card" style={{ padding: 24 }}>
      <div className="donut-title" style={{ marginBottom: 24, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'rgba(232,160,32,0.12)', padding: '6px 12px', borderRadius: 40, fontSize: 12 }}>📊</span> Cost by Type
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: 200 }}>
          <ResponsiveContainer width="100%" height={Math.max(chartData.length * 42, 120)}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 30, left: 60, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#7c6f65' }} axisLine={false} tickLine={false}
                tickFormatter={v => `LKR ${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#334155' }}
                width={72} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" fill="#e8a020" radius={[0, 8, 8, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          {chartData.slice(0, 5).map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[idx % CHART_COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#334155', textTransform: 'capitalize' }}>{item.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{formatCurrency(item.value)}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{item.percent}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>Total Maintenance Spend</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#e8a020' }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// TOP ASSETS PANEL (Overview — Top Assets by Cost)
// Ranked list with inline progress bars, replaces the small DonutPanel
// ═══════════════════════════════════════════════════════════════════════════════

const TopAssetsPanel = ({ data = [] }) => {
  const topAssets = data.slice(0, 6).map(asset => ({
    name: asset.model || asset.asset_type || 'Unknown',
    cost: Number(asset.total_cost) || 0,
    count: asset.repair_count || 0,
  }));

  const maxCost = Math.max(...topAssets.map(a => a.cost), 1);

  return (
    <div className="donut-card" style={{ padding: 24 }}>
      <div className="donut-title" style={{ marginBottom: 24, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ background: 'rgba(232,160,32,0.12)', padding: '6px 12px', borderRadius: 40, fontSize: 12 }}>🏗️</span> Top Assets by Cost
      </div>
      {topAssets.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <span className="icon">🏗️</span><p>No asset cost data available</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {topAssets.map((asset, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 28, fontSize: 13, fontWeight: 700, color: '#94a3b8', flexShrink: 0 }}>#{idx + 1}</div>
              <div style={{ flex: '0 0 140px', minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{asset.count} repair{asset.count !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(asset.cost / maxCost) * 100}%`, height: '100%', background: CHART_COLORS[idx % CHART_COLORS.length], borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', minWidth: 70, textAlign: 'right' }}>{formatCurrency(asset.cost)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// KPI CARDS WITH DISTINCT CHART STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const KpiDonutCard = ({
  label,
  value,
  subtitle,
  variant,
  totalAllocated,
  totalSpent,
  totalRemaining,
  spendRate,
  onClick,
}) => {
  const allocatedValue = Number(totalAllocated) || 0;
  const spentValue = Number(totalSpent) || 0;
  const remainingValue = Number(totalRemaining) || 0;
  const spendRateValue = Number(spendRate) || 0;
  const spentShare = percentOf(spentValue, allocatedValue);
  const remainingShare = percentOf(remainingValue, allocatedValue);

  if (variant === 'allocated') {
    const splitRemaining = [
      { name: 'Reserve', value: remainingValue * 0.5, color: '#3b82f6' },
      { name: 'Buffer', value: remainingValue * 0.3, color: '#8b5cf6' },
      { name: 'Open', value: remainingValue * 0.2, color: '#f59e0b' },
    ];
    const chartData = [
      { name: 'Spent', value: spentValue, color: '#22c55e' },
      ...splitRemaining,
    ].map((item) => ({ ...item, value: Math.max(item.value, 0) }));

    return (
      <button
        type="button"
        onClick={onClick}
        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#16152c] p-5 text-left shadow-[0_24px_80px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.12),transparent_40%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
            <p className="mt-1 text-sm text-white/60">{subtitle}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/65">
            Portfolio
          </span>
        </div>

        {/* Reduced outerRadius 126→110, innerRadius 78→68 so outer labels stay inside the SVG viewport */}
        <div className="relative mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={68}
                outerRadius={110}
                startAngle={90}
                endAngle={-270}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                label={renderOuterDonutLabel}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="relative mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {chartData.map((entry) => (
            <div key={entry.name} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{entry.name}</div>
              <div className="mt-1 text-sm font-bold text-white">{formatCurrency(entry.value)}</div>
            </div>
          ))}
        </div>
      </button>
    );
  }

  if (variant === 'spentOrbit') {
    const rings = [
      { label: 'Spend rate', value: clamp(spendRateValue, 0, 100), color: '#8b5cf6', track: 'rgba(139,92,246,0.18)', radius: 100, stroke: 16 },
      { label: 'Spent share', value: clamp(spentShare, 0, 100), color: '#f97316', track: 'rgba(249,115,22,0.18)', radius: 78, stroke: 16 },
      { label: 'Remaining', value: clamp(remainingShare, 0, 100), color: '#22d3ee', track: 'rgba(34,211,238,0.16)', radius: 56, stroke: 16 },
    ];

    return (
      <button
        type="button"
        onClick={onClick}
        className="relative overflow-hidden rounded-[28px] bg-[#27354b] p-5 text-left text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_55%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/45">{label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight text-white">{value}</p>
            <p className="mt-1 text-sm text-white/60">{subtitle}</p>
          </div>
          <div className="space-y-1 text-right">
            {rings.map((ring) => (
              <div key={ring.label} className="flex items-center justify-end gap-2 text-[11px] font-semibold text-white/70">
                <span className="text-white/40">{ring.label}</span>
                <span style={{ color: ring.color }}>{ring.value.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-center gap-6">
          <div className="pointer-events-none flex flex-col items-center text-center mr-4">
            <div className="text-5xl font-black tracking-tight text-white">{spendRateValue.toFixed(0)}%</div>
            <div className="mt-2 text-lg font-medium text-white/70">{formatCurrency(spentValue)} spent</div>
          </div>

          <svg viewBox="0 0 260 260" className="h-72 w-72">
            {rings.map((ring) => {
              const circumference = 2 * Math.PI * ring.radius;
              const offset = circumference - (clamp(ring.value, 0, 100) / 100) * circumference;
              return (
                <g key={ring.label}>
                  <circle
                    cx="130"
                    cy="130"
                    r={ring.radius}
                    fill="none"
                    stroke={ring.track}
                    strokeWidth={ring.stroke}
                  />
                  <circle
                    cx="130"
                    cy="130"
                    r={ring.radius}
                    fill="none"
                    stroke={ring.color}
                    strokeWidth={ring.stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={offset}
                    transform="rotate(-90 130 130)"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </button>
    );
  }

  if (variant === 'remainingSemi') {
    // Teal shades for filled segments, near-invisible for empty
    const tealShades = [
      '#0891b2','#0ea5e9','#22d3ee','#38bdf8','#67e8f9',
      '#a5f3fc','#cffafe','#e0f9ff','#ecfdff','#f0feff','#f5feff','#f9ffff',
    ];
    const segments = Array.from({ length: 12 }, (_, i) => {
      const filled = i < Math.round(clamp(remainingShare / 100, 0, 1) * 12);
      return {
        name: `S${i + 1}`,
        value: 1,
        color: filled ? (tealShades[i] || '#22d3ee') : 'rgba(255,255,255,0.07)',
      };
    });

    return (
      <div
        onClick={onClick}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          background: 'linear-gradient(135deg, #0d2137 0%, #0f2d4a 100%)',
          padding: 20,
          color: 'white',
          boxShadow: '0 24px 80px rgba(15,23,42,0.35)',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.08)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Ambient gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at top right, rgba(34,211,238,0.15), transparent 45%), radial-gradient(circle at bottom left, rgba(8,145,178,0.10), transparent 42%)',
        }} />

        {/* ── Header ── */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)' }}>{label}</p>
            <p style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1 }}>{value}</p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.60)' }}>{subtitle}</p>
          </div>
          <span style={{
            flexShrink: 0, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(34,211,238,0.12)', padding: '4px 12px', fontSize: 10,
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.24em',
            color: 'rgba(34,211,238,0.85)', whiteSpace: 'nowrap',
          }}>Remaining focus</span>
        </div>

        {/* ── Semicircle chart ── */}
        {/* Container h=196px: innerRadius=72 → open mouth from y=124 to y=196 (72px tall) */}
        <div style={{ position: 'relative', marginTop: 20, height: 196 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={72}
                outerRadius={112}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {segments.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom stats ── */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
          {[
            { lbl: 'Spent',     val: spentValue },
            { lbl: 'Allocated', val: allocatedValue },
          ].map(item => (
            <div key={item.lbl} style={{
              borderRadius: 16, border: '1px solid rgba(255,255,255,0.09)',
              background: 'rgba(255,255,255,0.05)', padding: '14px 16px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.40)' }}>{item.lbl}</div>
              <div style={{ marginTop: 6, fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: 'white' }}>{formatCurrency(item.val)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── SPEND RATE — dark indigo gauge ────────────────────────────────────────
  // Uses pure inline styles (no responsive Tailwind grid) to guarantee correct
  // layout on all screen sizes and avoid the "BufferLKR" concatenation bug.
  const [gaugeHovered, setGaugeHovered] = useState(false);
  const gaugeData = [
    { name: 'Used',      value: clamp(spendRateValue, 0, 100),       color: '#22c55e' },
    { name: 'Available', value: clamp(100 - spendRateValue, 0, 100), color: 'rgba(255,255,255,0.09)' },
  ];

  const legendItems = [
    { label: 'Used',      val: `${spendRateValue.toFixed(0)}%`,                     dot: '#22c55e' },
    { label: 'Available', val: `${Math.max(100 - spendRateValue, 0).toFixed(0)}%`,  dot: '#3b82f6' },
    { label: 'Buffer',    val: formatCurrency(remainingValue),                       dot: '#f59e0b' },
  ];

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 28,
        background: 'linear-gradient(135deg, #1b1f35 0%, #242847 100%)',
        padding: 20, color: 'white',
        boxShadow: '0 24px 80px rgba(15,23,42,0.35)',
        cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Ambient gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at top right, rgba(139,92,246,0.15), transparent 45%), radial-gradient(circle at bottom left, rgba(59,130,246,0.10), transparent 42%)',
      }} />

      {/* ── Header ── */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}
        onMouseEnter={() => setGaugeHovered(true)}
        onMouseLeave={() => setGaugeHovered(false)}
      >
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)' }}>{label}</p>
          <p style={{ margin: '8px 0 0', fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', color: 'white', lineHeight: 1.1 }}>{value}</p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.60)' }}>{subtitle}</p>
        </div>
        <span style={{
          flexShrink: 0, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.06)', padding: '4px 12px',
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.24em', color: 'rgba(255,255,255,0.60)', whiteSpace: 'nowrap',
        }}>Monthly</span>
      </div>

      {/* ── Gauge + Legend row ── */}
      {/* Container h=196px: innerRadius=72 → open mouth from y=124 to y=196 */}
      <div style={{ position: 'relative', marginTop: 20, display: 'flex', alignItems: 'center', gap: 18 }}>

        {/* Gauge */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', height: 196 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={72}
                outerRadius={112}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {gaugeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered label inside the arch opening */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 8,
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.04em', color: 'white', lineHeight: 1.1 }}>{spendRateValue.toFixed(1)}%</div>
            <div style={{ marginTop: 2, fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>Spend rate</div>
          </div>
        </div>

        {/* Hover tooltip — appears over white section on hover */}
        {gaugeHovered && (
          <div style={{
            position: 'absolute', right: 16, top: 100, flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: 10,
            backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
            padding: '12px 16px', zIndex: 10,
          }}>
            {legendItems.map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.90)', whiteSpace: 'nowrap' }}>{item.label}:</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: 'white', whiteSpace: 'nowrap' }}>{item.val}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Panel = ({ title, iconEmoji = '📊', children, action }) => (
  <div className="panel">
    <div className="panel-header">
      <div className="panel-title">
        <span className="panel-title-icon">{iconEmoji}</span>
        <span className="panel-title-text">{title}</span>
      </div>
      {action}
    </div>
    <div className="panel-body">{children}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// DONUT PANEL (KEPT FOR POTENTIAL FUTURE USE BUT NOT USED IN MAIN TABS)
// ═══════════════════════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════════════════════
// COST TYPE DETAILS MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const CostTypeModal = ({ isOpen, onClose, costType, entries, onEdit, onDelete }) => {
  if (!isOpen || !costType) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ textTransform: 'capitalize' }}>{costType.cost_type} Cost Details</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{entries.length} entries</div>
          </div>
          <button className="btn-close" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-body">
          <div className="three-col" style={{ marginBottom: 24 }}>
            <div className="stat-mini"><div className="stat-mini-label">Count</div><div className="stat-mini-val">{costType.count || 0}</div></div>
            <div className="stat-mini"><div className="stat-mini-label">Total</div><div className="stat-mini-val" style={{ color: '#047857' }}>{formatCurrency(costType.total_amount || 0)}</div></div>
            <div className="stat-mini"><div className="stat-mini-label">Average</div><div className="stat-mini-val" style={{ color: '#b45309' }}>{formatCurrency(costType.avg_amount || 0)}</div></div>
          </div>
          <div className="overflow-x">
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Date</th><th>Asset</th>
                  <th className="right">Amount</th><th>Supplier</th><th className="center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(e => (
                  <tr key={e.id}>
                    <td className="mono">{formatDate(e.cost_date)}</td>
                    <td>
                      <div className="strong" style={{ fontSize: 12 }}>{e.model || e.asset_name || 'N/A'}</div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{e.serial_number || '—'}</div>
                    </td>
                    <td className="right strong mono">{formatCurrency(e.amount)}</td>
                    <td>{e.supplier_name || '—'}</td>
                    <td className="center">
                      <div className="action-row">
                        <button className="btn" style={{ padding: '4px 12px' }} onClick={() => onEdit(e)}>Edit</button>
                        <button className="btn" style={{ padding: '4px 12px', color: '#dc2626' }} onClick={() => onDelete(e)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CALCULATOR MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const CalcModal = ({ isOpen, onClose }) => {
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState(10);
  const [fee, setFee] = useState(5);
  const [disc, setDisc] = useState(0);

  if (!isOpen) return null;

  const base = parseFloat(amount) || 0;
  const taxAmt = base * tax / 100;
  const feeAmt = base * fee / 100;
  const discAmt = base * disc / 100;
  const total = base + taxAmt + feeAmt - discAmt;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Cost Calculator</span>
          <button className="btn-close" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Base Amount (LKR)</label>
            <input className="form-input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tax %</label>
              <input className="form-input" type="number" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Fee %</label>
              <input className="form-input" type="number" value={fee} onChange={e => setFee(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Discount %</label>
            <input className="form-input" type="number" value={disc} onChange={e => setDisc(parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ marginTop: 8, background: '#f8fafc', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Base Amount</span>
              <span style={{ fontWeight: 600 }}>{formatCurrency(base)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Tax ({tax}%)</span>
              <span style={{ fontWeight: 600, color: '#0891b2' }}>{formatCurrency(taxAmt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Fee ({fee}%)</span>
              <span style={{ fontWeight: 600, color: '#0891b2' }}>{formatCurrency(feeAmt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Discount ({disc}%)</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>-{formatCurrency(discAmt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, marginTop: 6, borderTop: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#d97706' }}>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-gold btn-full" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const DeleteModal = ({ isOpen, onClose, onConfirm, cost }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Delete Entry</span>
          <button className="btn-close" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 13, color: '#334155', marginBottom: 20 }}>
            This cost entry will be permanently removed. This action cannot be undone.
          </p>
          {cost && (
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Amount</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(cost.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Type</span>
                <span style={{ textTransform: 'capitalize' }}>{cost.cost_type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>Date</span>
                <span>{formatDate(cost.cost_date)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold btn-full" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADD / EDIT COST MODAL
// ═══════════════════════════════════════════════════════════════════════════════

const CostModal = ({ isOpen, onClose, onSave, cost, assets }) => {
  const blank = { assetId: '', costType: 'assessment', amount: '', costDate: new Date().toISOString().split('T')[0], description: '', invoiceNumber: '', supplierName: '' };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cost) {
      const m = assets.find(a => a.id === cost.asset_id || a.id === cost.id);
      setForm({
        assetId: m ? m.id : '',
        costType: cost.cost_type || 'assessment',
        amount: cost.amount || '',
        costDate: cost.cost_date ? new Date(cost.cost_date).toISOString().split('T')[0] : blank.costDate,
        description: cost.description || '',
        invoiceNumber: cost.invoice_number || '',
        supplierName: cost.supplier_name || ''
      });
    } else {
      setForm({
        ...blank,
        assetId: assets.length > 0 ? assets[0].id : ''
      });
    }
  }, [cost, isOpen, assets]);

  const handleSave = async () => {
    if (!form.assetId || !form.amount) { alert('Please fill required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        assetId: Number(form.assetId),
        costType: form.costType,
        amount: form.amount,
        costDate: form.costDate,
        description: form.description || null,
        invoiceNumber: form.invoiceNumber || null,
        supplierName: form.supplierName || null
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally { setSaving(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{cost ? 'Edit Cost Entry' : 'New Cost Entry'}</span>
          <button className="btn-close" onClick={onClose}><Icons.Close /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Asset *</label>
            <select className="form-input" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })}>
              <option value="" disabled>{assets.length > 0 ? 'Select a registered asset' : 'No registered assets available'}</option>
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {`${a.model} - ${a.serial_number || ''} (${a.asset_type || ''})`.trim()}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Cost Type *</label>
              <input list="ctl" className="form-input" value={form.costType} onChange={e => setForm({ ...form, costType: e.target.value })} />
              <datalist id="ctl">
                {['assessment', 'invoice', 'parts', 'labor', 'other'].map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (LKR) *</label>
              <input type="number" step="0.01" className="form-input" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input type="date" className="form-input" value={form.costDate} onChange={e => setForm({ ...form, costDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Invoice #</label>
              <input type="text" className="form-input" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="INV-001" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <input type="text" className="form-input" value={form.supplierName} onChange={e => setForm({ ...form, supplierName: e.target.value })} placeholder="Supplier name" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} style={{ resize: 'none' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Additional notes..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-gold btn-full" onClick={handleSave} disabled={saving}>
            {saving ? <Icons.Spinner /> : (cost ? 'Save Changes' : 'Add Entry')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const TotalCostPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [summary, setSummary] = useState({ budget: {}, costsByType: [], monthlyTrend: [] });
  const [assetCosts, setAssetCosts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [savingBudget, setSavingBudget] = useState(false);
  const [budgetMessage, setBudgetMessage] = useState('');

  const [showCalc, setShowCalc] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selCost, setSelCost] = useState(null);

  const normalizeBudgetItems = (items = [], costRows = [], statuses = {}) => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item) => ({
        ...item,
        allocated_budget: Number(item.allocated_budget) || 0,
        spent_budget: Number(item.spent_budget) || 0,
        fiscal_year: item.fiscal_year || new Date().getFullYear(),
        status: statuses[item.id] || item.status || 'Pending'
      }));
    }

    return (Array.isArray(costRows) ? costRows : []).map((row, index) => ({
      id: `local-${index + 1}`,
      dept_id: row.dept_id || null,
      department_name: row.department_name || row.asset_type || row.model || `Item ${index + 1}`,
      allocated_budget: Number(row.total_cost) || 0,
      spent_budget: Number(row.total_cost) || 0,
      fiscal_year: new Date().getFullYear(),
      notes: '',
      status: 'Pending'
    }));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [sumR, acR, assR, budgetR, historyR] = await Promise.all([
        api.get('/costs/summary'),
        api.get('/costs/by-asset'),
        api.get('/assets'),
        api.get('/costs/budget-items'),
        api.get('/costs/history'),
      ]);
      const nextSummary = sumR.data.data || {};
      const nextAssetCosts = acR.data.data || [];
      const nextAssets = assR.data.data || [];
      const nextBudgetItems = normalizeBudgetItems(budgetR.data?.data || [], nextAssetCosts, statusMap);
      const nextStatuses = {};
      nextBudgetItems.forEach((item) => {
        nextStatuses[item.id] = statusMap[item.id] || item.status || 'Pending';
      });

      setSummary(nextSummary);
      setAssetCosts(nextAssetCosts);
      setAssets(nextAssets);
      setBudgetItems(nextBudgetItems);
      setHistoryEntries(historyR.data?.data || []);
      setStatusMap(nextStatuses);
    } catch (err) {
      setError(getErrorMessage(err));
      setTimeout(() => setError(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (id, field, value) => {
    setBudgetItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: field === 'allocated_budget' || field === 'spent_budget' || field === 'fiscal_year' ? (value === '' ? '' : Number(value)) : value } : item));
  };

  const handleStatusChange = (id, value) => {
    setStatusMap((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveBudget = async () => {
    try {
      setSavingBudget(true);
      setBudgetMessage('');
      for (const item of budgetItems) {
        const payload = {
          dept_id: item.dept_id,
          allocated_budget: Number(item.allocated_budget) || 0,
          spent_budget: Number(item.spent_budget) || 0,
          fiscal_year: Number(item.fiscal_year) || new Date().getFullYear(),
          notes: item.notes || ''
        };

        if (String(item.id).startsWith('local-')) {
          await api.post('/costs/budget', payload);
        } else {
          await api.put(`/costs/budget/${item.id}`, payload);
        }
      }

      await loadData();
      setBudgetMessage('Budget updates saved successfully.');
    } catch (err) {
      setBudgetMessage(getErrorMessage(err));
    } finally {
      setSavingBudget(false);
    }
  };

  const handleAdd = async (payload) => {
    const r = await api.post('/costs/add', payload);
    if (r.data.success) { await loadData(); setShowAdd(false); }
  };
  const handleUpdate = async (payload) => {
    const r = await api.put(`/costs/${selCost.id}`, payload);
    if (r.data.success) { await loadData(); setShowEdit(false); setSelCost(null); }
  };
  const handleDelete = async () => {
    if (!selCost) return;
    const r = await api.delete(`/costs/${selCost.id}`);
    if (r.data.success) { await loadData(); setShowDelete(false); setSelCost(null); }
  };

  const generatePDF = async () => {
    const el = document.getElementById('report-content');
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#f8fafc', useCORS: true });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 10;
      const pw2 = pw - m * 2;
      const ih = (canvas.height * pw2) / canvas.width;
      let left = ih, pos = m;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', m, pos, pw2, ih);
      left -= ph - m;
      while (left > 0) { pos = left - ih + m; pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png'), 'PNG', m, pos, pw2, ih); left -= ph - m; }
      pdf.save(`cost-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch { setError('PDF generation failed'); }
  };

  useEffect(() => { loadData(); setTimeout(() => setVisible(true), 100); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const budget = summary.budget || {};
  const monthlyTrend = summary.monthlyTrend || [];

  // SAFE NUMBER CONVERSIONS - FIXED!
  const totalAllocated = Number(budget.total_allocated) || 0;
  const totalSpent = Number(budget.total_spent) || 0;
  const totalRemaining = Number(budget.total_remaining) || 0;
  const spendRate = Number(budget.spend_percentage) || 0;

  const monthlyTrendChartData = useMemo(() => {
    const source = Array.isArray(monthlyTrend) ? monthlyTrend : [];
    const monthMap = new Map(source.map((item) => [String(item.month), item]));
    const items = [];
    const today = new Date();

    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key);
      const actualSpend = Number(entry?.total_cost || 0);
      items.push({
        month: key,
        label: date.toLocaleString('en', { month: 'short', year: 'numeric' }),
        actualSpend,
        plannedSpend: totalAllocated / 12,
        transactions: Number(entry?.transaction_count || 0)
      });
    }

    return items;
  }, [monthlyTrend, totalAllocated]);

  const assetRows = (assetCosts || []).map((item) => {
    const matchedBudget = budgetItems.find((budgetItem) => {
      const sameDepartment = budgetItem.department_name && item.department_name && budgetItem.department_name.toLowerCase() === item.department_name.toLowerCase();
      return sameDepartment || budgetItem.dept_id === item.dept_id;
    });

    return {
      ...item,
      total_amount_spent: Number(item.total_cost) || 0,
      allocated_amount: Number(matchedBudget?.allocated_budget) || 0,
      status: statusMap[matchedBudget?.id] || matchedBudget?.status || 'Pending'
    };
  });

  const historyRows = (Array.isArray(historyEntries) ? historyEntries : []).map((entry, index) => ({
    id: entry.id || `history-${index}`,
    label: entry.change_date || entry.month || entry.report_date || `Report ${index + 1}`,
    details: entry.notes || entry.description || entry.month_name || 'Budget report updated',
    amount: Number(entry.total_spent || entry.spent_budget || entry.amount || entry.total_cost || 0),
    status: entry.status || (Number(entry.total_spent || entry.spent_budget || entry.amount || 0) > 0 ? 'Pending' : 'Approved')
  }));

  if (loading) return (
    <div className="tc-root tc-loading">
      <GlobalStyles />
      <div className="spinner-ring" />
      <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#7c6f65', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>Loading Cost Data</div>
    </div>
  );

  return (
    <div className="tc-root">
      <GlobalStyles />
      <div className="tc-ambient" />

      {/* Navbar */}
      <nav className={`tc-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="tc-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button className="tc-back-btn" onClick={() => navigate('/')}>
              <Icons.ArrowLeft /> Dashboard
            </button>
            <div>
              <div className="tc-brand-title">Cost Intelligence</div>
              <div className="tc-brand-sub">Maintenance Spend · Analytics · Reporting</div>
            </div>
          </div>
          <div className="tc-nav-actions">
            <button className="btn" onClick={() => setShowCalc(true)}>
              <Icons.Calc /> Calculator
            </button>
            <button className="btn" onClick={generatePDF}>
              <Icons.Download /> PDF
            </button>
            <button className="btn btn-gold" onClick={() => setShowAdd(true)}>
              <Icons.Plus /> Add Cost
            </button>
            <button className="btn-icon" onClick={loadData}><Icons.Refresh /></button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`tc-main ${visible ? 'visible' : ''}`}>
        {error && (
          <div className="error-banner">
            <Icons.Alert /> {error}
          </div>
        )}

        <div id="report-content">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <KpiDonutCard
              label="TOTAL ALLOCATED"
              value={formatCurrency(totalAllocated)}
              subtitle="Annual budget"
              variant="allocated"
              totalAllocated={totalAllocated}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
            />
            <KpiDonutCard
              label="TOTAL SPENT"
              value={formatCurrency(totalSpent)}
              subtitle="YTD expenses"
              variant="spentOrbit"
              totalAllocated={totalAllocated}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
              spendRate={spendRate}
            />
            <KpiDonutCard
              label="REMAINING"
              value={formatCurrency(totalRemaining)}
              subtitle="Available budget"
              variant="remainingSemi"
              totalAllocated={totalAllocated}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
            />
            <KpiDonutCard
              label="SPEND RATE"
              value={`${spendRate.toFixed(1)}%`}
              subtitle="of budget used"
              variant="spendRateGauge"
              totalAllocated={totalAllocated}
              totalSpent={totalSpent}
              totalRemaining={totalRemaining}
              spendRate={spendRate}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Panel title="Monthly Spend Trend" iconEmoji="📈">
              {monthlyTrendChartData.length > 0 ? (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="budgetTrendArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#e8a020" stopOpacity={0.24} />
                          <stop offset="100%" stopColor="#e8a020" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ebe8e3" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7c6f65', fontFamily: 'DM Sans, sans-serif' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#7c6f65', fontFamily: 'DM Sans, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip contentStyle={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontFamily: 'DM Sans, sans-serif', fontSize: 12 }} />
                      <Area type="monotone" dataKey="actualSpend" stroke="#e8a020" fill="url(#budgetTrendArea)" strokeWidth={2.5} dot={{ fill: '#e8a020', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#e8a020' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="empty-state"><span className="icon">📊</span><p>No trend data available</p></div>
              )}
            </Panel>

            <Panel title="Budget Planning & Approval Workspace" iconEmoji="📝" action={
              <button className="btn btn-gold" onClick={handleSaveBudget} disabled={savingBudget}>
                {savingBudget ? <Icons.Spinner /> : 'Save Budget Updates'}
              </button>
            }>
              {budgetMessage && (
                <div className="success-banner" style={{ marginBottom: 12 }}>{budgetMessage}</div>
              )}
              {budgetItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {budgetItems.map((item) => (
                    <div key={item.id} style={{ padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">Item / Department</label>
                          <div className="form-input" style={{ minHeight: 44, display: 'flex', alignItems: 'center' }}>
                            {item.department_name || item.item_name || 'Budget Item'}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Annual Budget Plan Details</label>
                          <textarea className="form-input" rows={3} value={item.notes || ''} onChange={(e) => handleBudgetChange(item.id, 'notes', e.target.value)} placeholder="Enter budget plan notes and scope" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Amount Allocated</label>
                          <input type="number" step="0.01" className="form-input" value={item.allocated_budget ?? ''} onChange={(e) => handleBudgetChange(item.id, 'allocated_budget', e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Amount Spent So Far</label>
                          <input type="number" step="0.01" className="form-input" value={item.spent_budget ?? ''} onChange={(e) => handleBudgetChange(item.id, 'spent_budget', e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Status</label>
                          <select className="form-input" value={statusMap[item.id] || 'Pending'} onChange={(e) => handleStatusChange(item.id, e.target.value)}>
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Decline">Decline</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Fiscal Year</label>
                          <input type="number" className="form-input" value={item.fiscal_year || ''} onChange={(e) => handleBudgetChange(item.id, 'fiscal_year', e.target.value)} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: '#64748b', fontSize: 12, flexWrap: 'wrap' }}>
                        <span>Remaining: {formatCurrency(Math.max(0, Number(item.allocated_budget || 0) - Number(item.spent_budget || 0)))}</span>
                        <span>Approval status: {statusMap[item.id] || item.status || 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="icon">📝</span>
                  <p>No budget items available yet</p>
                  <button className="btn btn-gold" onClick={() => setShowAdd(true)}>Create Budget Entry</button>
                </div>
              )}
            </Panel>

            <Panel title="Cost by Asset" iconEmoji="🏗️" action={
              <button className="btn btn-icon" onClick={loadData}><Icons.Refresh /></button>
            }>
              {assetRows.length > 0 ? (
                <div className="overflow-x">
                  <table className="tc-table">
                    <thead>
                      <tr>
                        <th>Asset / Item</th>
                        <th className="right">Total Amount Spent</th>
                        <th className="right">Allocated Amount</th>
                        <th className="center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetRows.map((asset) => (
                        <tr key={asset.id}>
                          <td>
                            <div className="strong">{asset.model || asset.asset_type || asset.item_name || 'Asset'}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>{asset.serial_number || asset.department_name || '—'}</div>
                          </td>
                          <td className="right strong mono">{formatCurrency(asset.total_amount_spent)}</td>
                          <td className="right mono">{formatCurrency(asset.allocated_amount)}</td>
                          <td className="center">
                            <span className={`badge ${asset.status === 'Approved' ? 'badge-green' : asset.status === 'Decline' ? 'badge-red' : 'badge-yellow'}`}>
                              {asset.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="icon">🏗️</span>
                  <p>No asset cost data available</p>
                  <button className="btn btn-gold" onClick={() => setShowAdd(true)}>Add First Entry</button>
                </div>
              )}
            </Panel>

            <Panel title="Budget Report History" iconEmoji="🗂️" action={
              <button className="btn" onClick={() => setShowAdd(true)}>Add Cost Entry</button>
            }>
              {historyRows.length > 0 ? (
                <div className="overflow-x">
                  <table className="tc-table">
                    <thead>
                      <tr>
                        <th>Report</th>
                        <th>Details</th>
                        <th className="right">Amount</th>
                        <th className="center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((item) => (
                        <tr key={item.id}>
                          <td className="mono">{item.label}</td>
                          <td>{item.details}</td>
                          <td className="right strong mono">{formatCurrency(item.amount)}</td>
                          <td className="center">
                            <span className={`badge ${item.status === 'Approved' ? 'badge-green' : item.status === 'Decline' ? 'badge-red' : 'badge-yellow'}`}>{item.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <span className="icon">🗂️</span>
                  <p>No historical budget reports yet</p>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CalcModal isOpen={showCalc} onClose={() => setShowCalc(false)} />
      <CostModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSave={handleAdd} assets={assets} />
      <CostModal isOpen={showEdit} onClose={() => { setShowEdit(false); setSelCost(null); }} onSave={handleUpdate} cost={selCost} assets={assets} />
      <DeleteModal isOpen={showDelete} onClose={() => { setShowDelete(false); setSelCost(null); }} onConfirm={handleDelete} cost={selCost} />
    </div>
  );
};

export default TotalCostPage;