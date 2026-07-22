import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assetAPI } from '../services/api';
import { getErrorMessage, getStatusLabel, getStatusColor, formatDate } from '../utils/helpers';

const AssetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      try {
        const response = await assetAPI.getById(id);
        setAsset(response.data.data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAsset();
    } else {
      setError('No asset ID provided.');
      setLoading(false);
    }
  }, [id]);

  const statusColor = getStatusColor(asset?.status);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-300">Loading asset details…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/assets')}
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
        >
          ← Back to Assets
        </button>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700 p-6">
            <h1 className="text-xl font-bold text-red-700 dark:text-red-200">Unable to load asset</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Asset Details</p>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white">{asset?.model || 'Unknown asset'}</h1>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Serial Number: {asset?.serial_number || '—'}</p>
                </div>
                <span
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
                >
                  {getStatusLabel(asset?.status)}
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-2">Department</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{asset?.dept_name || 'Unknown'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-2">In Charge</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{asset?.incharge_name || 'Unassigned'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-2">Asset Type</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 capitalize">{asset?.asset_type || 'Unknown'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 mb-2">Received Date</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDate(asset?.received_date) || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Repair History</h2>
                {asset?.repairs?.length > 0 ? (
                  <div className="space-y-4">
                    {asset.repairs.map(repair => (
                      <div key={repair.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                          <p className="font-semibold text-slate-900 dark:text-white">{repair.issue_description || 'No description'}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{formatDate(repair.submitted_date)}</span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          Status: <span className="font-bold text-slate-900 dark:text-white">{getStatusLabel(repair.repair_status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No repair history available for this asset.</p>
                )}
              </div>

              <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Parts & Components</h2>
                {asset?.parts?.length > 0 ? (
                  <ul className="space-y-3">
                    {asset.parts.map(part => (
                      <li key={part.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-100 dark:border-slate-700">
                        <p className="font-semibold text-slate-900 dark:text-white">{part.part_name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{part.specification || 'No specification provided'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Qty: {part.quantity || 1}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No part records found for this asset.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetailPage;
