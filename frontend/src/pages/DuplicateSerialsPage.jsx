import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetAnalysisAPI } from '../services/api';

const Icons = {
  ArrowLeft: () => (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Bell: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Alert: () => (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  )
};

const DuplicateSerialsPage = () => {
  const navigate = useNavigate();
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDuplicates = async () => {
      try {
        setLoading(true);
        const response = await assetAnalysisAPI.getDuplicates();
        if (response?.data?.success) {
          setDuplicates(response.data.data || []);
        } else {
          setError('Unable to load duplicate serial data.');
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Unable to load duplicate serial data.');
      } finally {
        setLoading(false);
      }
    };

    loadDuplicates();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <Icons.ArrowLeft />
            Back to Dashboard
          </button>
          <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
            Duplicate serial review
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-600 dark:text-cyan-400">Duplicate serial numbers</p>
              <h1 className="mt-2 text-2xl font-black">Serial number duplication tracker</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                This section highlights when the same serial number appears multiple times and shows the registration dates for each duplicate instance.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <Icons.Bell />
                {duplicates.length} serial group(s) with duplicates
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Loading duplicate records...
            </div>
          ) : duplicates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 py-16 text-center dark:border-emerald-800 dark:bg-emerald-950/10">
              <div className="mb-3 rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                <Icons.Bell />
              </div>
              <h2 className="text-lg font-black">No duplicate serial numbers detected</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                All tracked asset serial numbers are currently unique.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicates.map((item) => {
                const isCritical = item.duplicate_count >= 5;
                return (
                  <div
                    key={`${item.serial_number}-${item.model}`}
                    className={`rounded-2xl border p-5 ${isCritical ? 'border-red-300 bg-red-50/80 dark:border-red-900/40 dark:bg-red-950/20' : 'border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/20'}`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black">{item.serial_number}</h2>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${isCritical ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                            {item.duplicate_count} duplicate(s)
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Model: {item.model || 'Unspecified model'}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          Registered between {item.first_registered ? new Date(item.first_registered).toLocaleDateString() : 'N/A'} and {item.last_registered ? new Date(item.last_registered).toLocaleDateString() : 'N/A'}.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="mb-2 flex items-center gap-2 font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                          <Icons.Alert />
                          Registration dates
                        </div>
                        <div className="space-y-1 text-slate-600 dark:text-slate-300">
                          {(item.registration_dates || '').split(', ').filter(Boolean).map((date) => (
                            <div key={date} className="text-sm">• {date}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuplicateSerialsPage;
