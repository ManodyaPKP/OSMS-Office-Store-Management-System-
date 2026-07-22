import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDataRefresh } from '../context/DataRefreshContext';
import api from '../services/api';
import { getErrorMessage, formatCurrency, formatDate, getStatusLabel } from '../utils/helpers';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ============================================
// ICONS
// ============================================
const Icons = {
  ArrowLeft: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Building: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6a2 2 0 012 2v6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5l4 4L12 16l-4 1 1-4 8.5-9.5z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 11v6M14 11v6M3 7h18M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  ),
};

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ label, value, icon: Icon, accent, delay = 0, onClick, actionLabel = 'Manage' }) => {
  const accentMap = {
    cyan: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
    emerald: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    amber: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
    violet: 'border-violet-500 bg-violet-50 dark:bg-violet-900/20',
    red: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    blue: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
  };

  return (
    <div
      className={`group relative overflow-hidden bg-white dark:bg-slate-800/80 border-l-4 ${accentMap[accent]} rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out animate-fadeInUp`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-white shadow-md ${accentMap[accent]} flex-shrink-0`}>
            <Icon />
          </div>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-1`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// SECTION CARD COMPONENT
// ============================================
const SectionCard = ({ title, icon: Icon, children, delay = 0, action }) => (
  <div
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-300 animate-fadeInUp"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
  >
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
      <div className="flex items-center gap-2">
        <span className="text-cyan-500">{Icon && <Icon />}</span>
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{title}</h2>
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// ============================================
// DUPLICATE ALERT CARD
// ============================================
const DuplicateAlert = ({ duplicate }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
            <h3 className="font-bold text-red-800 dark:text-red-300">
              Duplicate Asset Detected: {duplicate.model || 'Unknown'}
            </h3>
            <span className="px-2 py-0.5 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full text-xs font-bold">
              {duplicate.duplicate_count} copies
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            <strong>Serial Number:</strong> {duplicate.serial_number}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">
            First registered: {formatDate(duplicate.first_registered)} | Last registered: {formatDate(duplicate.last_registered)}
          </p>
          {expanded && (
            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
              <p className="text-xs text-red-700 dark:text-red-300">
                <strong>Asset IDs:</strong> {duplicate.asset_ids}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                <strong>Statuses:</strong> {duplicate.statuses}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                <strong>In Charge:</strong> {duplicate.incharge_names}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-semibold"
        >
          {expanded ? 'Show Less' : 'Show Details'}
        </button>
      </div>
    </div>
  );
};

// ============================================
// ASSET EDIT MODAL
// ============================================
const AssetEditModal = ({ isOpen, onClose, onSave, asset }) => {
  const [formData, setFormData] = useState({
    inchargeName: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData({
        inchargeName: asset.incharge_name || '',
        status: asset.status || 'active'
      });
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Asset</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              Model
            </label>
            <input
              value={asset.model || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              In Charge Name
            </label>
            <input
              value={formData.inchargeName}
              onChange={(e) => setFormData({ ...formData, inchargeName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="active">active</option>
              <option value="under_repair">under_repair</option>
              <option value="repaired">Completed</option>
              <option value="condemned">condemned</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
            {loading ? <Icons.Spinner /> : 'Update Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ASSET DELETE CONFIRMATION MODAL
// ============================================
const AssetDeleteConfirmModal = ({ isOpen, onClose, onConfirm, asset }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <Icons.Alert />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Asset</h2>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white">{asset.model || 'this asset'}</span>? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:shadow-lg transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const TotalAssetsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { triggerRefresh } = useDataRefresh();
  const isUpdatingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [assetStats, setAssetStats] = useState({
    total_assets: 0,
    active_assets: 0,
    under_repair: 0,
    repaired: 0,
    condemned: 0,
    asset_types: 0
  });
  const [allAssets, setAllAssets] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [trendingAssets, setTrendingAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState({
    deptId: '',
    assignedTo: '',
    locationDescription: '',
    notes: ''
  });
  const [locationHistory, setLocationHistory] = useState([]);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Initial animation
  useEffect(() => {
    setTimeout(() => setAnimateIn(true), 80);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAssetData();
  }, []);

  const fetchAssetData = async () => {
    try {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled([
        api.get('/asset-analysis/summary'),
        api.get('/asset-analysis/all-with-details'),
        api.get('/asset-analysis/duplicates'),
        api.get('/asset-analysis/trending/by-repair-count')
      ]);

      const [summaryResult, allAssetsResult, duplicatesResult, trendingResult] = results;

      if (summaryResult.status === 'fulfilled') {
        const summaryData = summaryResult.value.data?.data?.stats || summaryResult.value.data?.stats || {};
        setAssetStats({
          total_assets: summaryData.total_assets || 0,
          active_assets: summaryData.active_assets || 0,
          under_repair: summaryData.under_repair || 0,
          repaired: summaryData.repaired || 0,
          condemned: summaryData.condemned || 0,
          asset_types: summaryData.asset_types || 0
        });
      } else {
        console.error('Asset summary request failed:', summaryResult.reason);
        throw summaryResult.reason;
      }

      if (allAssetsResult.status === 'fulfilled') {
        setAllAssets(allAssetsResult.value.data?.data || []);
      } else {
        console.error('All assets request failed:', allAssetsResult.reason);
        throw allAssetsResult.reason;
      }

      if (duplicatesResult.status === 'fulfilled') {
        setDuplicates(duplicatesResult.value.data?.data || []);
      } else {
        console.error('Duplicates request failed:', duplicatesResult.reason);
        throw duplicatesResult.reason;
      }

      if (trendingResult.status === 'fulfilled') {
        setTrendingAssets(trendingResult.value.data?.data || []);
      } else {
        console.error('Trending request failed:', trendingResult.reason);
        throw trendingResult.reason;
      }
    } catch (err) {
      console.error('Error fetching asset data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetDetails = async (assetId) => {
    try {
      const [detailsRes, locationRes] = await Promise.all([
        api.get(`/asset-analysis/${assetId}/repair-analysis`),
        api.get(`/asset-analysis/${assetId}/location-history`)
      ]);
      setAssetDetails(detailsRes.data?.data || null);
      setLocationHistory(locationRes.data?.data?.locationHistory || []);
    } catch (err) {
      console.error('Error fetching asset details:', err);
    }
  };

  const updateLocation = async () => {
    if (!locationData.deptId || !locationData.assignedTo) {
      setError('Please fill in Department and Assigned To fields');
      return;
    }

    try {
      await api.post(`/asset-analysis/${selectedAsset.id}/location-update`, locationData);
      setShowLocationModal(false);
      setLocationData({ deptId: '', assignedTo: '', locationDescription: '', notes: '' });
      fetchAssetData();
      if (selectedAsset) fetchAssetDetails(selectedAsset.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateAsset = async (formData) => {
    if (!selectedAsset) return;
    if (isUpdatingRef.current) {
      console.warn('Update already in progress, ignoring duplicate request');
      return;
    }

    isUpdatingRef.current = true;
    try {
      console.log('🔄 Updating asset with:', {
        id: selectedAsset.id,
        incharge_name: formData.inchargeName,
        status: formData.status
      });

      const response = await api.put(`/assets/${selectedAsset.id}`, {
        incharge_name: formData.inchargeName,
        status: formData.status
      });

      console.log('✅ Asset update response:', response.data);

      const updatedAsset = response.data?.data || {
        ...selectedAsset,
        incharge_name: formData.inchargeName,
        status: formData.status
      };

      setAllAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.id === selectedAsset.id ? { ...asset, ...updatedAsset } : asset
        )
      );

      setSelectedAsset((current) =>
        current?.id === selectedAsset.id ? { ...current, ...updatedAsset } : current
      );

      // Invalidate essential asset-related queries only to avoid cascading refetch loops
      console.log('🔄 Invalidating queries...');
      await queryClient.invalidateQueries({ queryKey: ['assets', 'stats'] });
      await queryClient.invalidateQueries({ queryKey: ['asset-analysis', 'summary'] });

      console.log('✅ Queries invalidated');

      // Trigger global refresh to notify Dashboard and other components
      console.log('🔔 Triggering global refresh for Dashboard...');
      triggerRefresh();

      setShowEditModal(false);
      setAssetDetails(null);

      // Refetch local asset data
      console.log('🔄 Fetching asset data...');
      await fetchAssetData();
      console.log('✅ Asset data fetched');
    } catch (err) {
      console.error('❌ Error updating asset:', err);
      setError(getErrorMessage(err));
    } finally {
      isUpdatingRef.current = false;
    }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;

    try {
      await api.delete(`/assets/${selectedAsset.id}`);
      setShowDeleteModal(false);
      setSelectedAsset(null);
      setAssetDetails(null);
      fetchAssetData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const generatePDFReport = async () => {
    const element = document.getElementById('assets-report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        scrollY: -window.scrollY
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = pageHeight - margin * 2;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, position, printableWidth, imgHeight);
        heightLeft -= printableHeight;
      }

      pdf.save(`assets-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError('Failed to generate PDF');
    }
  };

  const tabs = [
    { id: 'all', label: 'All Assets', icon: Icons.Building },
    { id: 'duplicates', label: 'Duplicates', icon: Icons.Alert },
    { id: 'trending', label: 'Trending', icon: Icons.Alert },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-200 dark:border-cyan-900" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse tracking-wider uppercase">
            Loading asset data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden>
        <div className="absolute -top-56 -right-56 w-[480px] h-[480px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '300ms' }} />
        <div className="absolute -bottom-48 right-1/4 w-[360px] h-[360px] bg-amber-300/10 dark:bg-amber-600/5 rounded-full blur-3xl animate-blob" style={{ animationDelay: '500ms' }} />
      </div>

      {/* Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-out ${
          scrolled
            ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60 py-3'
            : 'bg-transparent py-4'
        }`}
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
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent leading-none">
                Total Assets
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">
                Inventory & asset analysis
              </p>
            </div>
          </div>
          <button
            onClick={generatePDFReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all"
          >
            <Icons.Download />
            PDF Report
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-500 ease-out ${
          animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 rounded-xl text-sm text-red-700 dark:text-red-300 font-medium animate-slideInDown">
            <Icons.Alert /> {error}
          </div>
        )}

        {/* Report Content for PDF */}
        <div id="assets-report-content">
          {/* Stats Cards - Total Assets Summary */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black tracking-tight bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  Total Assets Summary
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Inventory & asset status</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setTimeout(() => {
                    document.getElementById('assets-report-content')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all"
              >
                View All Assets
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard
                label="Total Assets"
                value={assetStats.total_assets}
                icon={Icons.Building}
                accent="cyan"
                delay={40}
                onClick={() => {
                  setActiveTab('all');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                actionLabel="Manage All"
              />
              <StatCard
                label="Active"
                value={assetStats.active_assets}
                icon={Icons.Building}
                accent="emerald"
                delay={80}
                onClick={() => {
                  setActiveTab('all');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                actionLabel="View All"
              />
              <StatCard
                label="Under Repair"
                value={assetStats.under_repair}
                icon={Icons.Alert}
                accent="amber"
                delay={120}
                onClick={() => {
                  setActiveTab('all');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                actionLabel="View All"
              />
              <StatCard
                label="Completed"
                value={assetStats.repaired}
                icon={Icons.Building}
                accent="blue"
                delay={160}
                onClick={() => {
                  setActiveTab('all');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                actionLabel="View All"
              />
              <StatCard
                label="Condemned"
                value={assetStats.condemned}
                icon={Icons.Alert}
                accent="red"
                delay={200}
                onClick={() => {
                  setActiveTab('all');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
                actionLabel="View All"
              />
              <StatCard
                label="Duplicates"
                value={duplicates.length}
                icon={Icons.Alert}
                accent="violet"
                delay={240}
                onClick={() => setActiveTab('duplicates')}
                actionLabel="View"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon />
                {tab.label}
                {tab.id === 'duplicates' && duplicates.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {duplicates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* All Assets Tab */}
          {activeTab === 'all' && (
            <SectionCard title="Asset Inventory" icon={Icons.Building} delay={280} action={
              <button onClick={fetchAssetData} className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1">
                <Icons.Refresh /> Refresh
              </button>
            }>
              {allAssets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Model</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Serial #</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Department</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Repairs</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Total Cost</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Status</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {allAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{asset.model || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{asset.serial_number || '—'}</td>
                          <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-400">{asset.asset_type}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{asset.department_name || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              (asset.repair_count || 0) > 5 ? 'bg-red-100 text-red-700' :
                              (asset.repair_count || 0) > 3 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {asset.repair_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(asset.total_repair_cost || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                              asset.status === 'active' ? 'bg-green-100 text-green-700' :
                              asset.status === 'under_repair' ? 'bg-yellow-100 text-yellow-700' :
                              asset.status === 'repaired' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getStatusLabel(asset.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                fetchAssetDetails(asset.id);
                              }}
                              className="p-1 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
                              title="View Details"
                            >
                              <Icons.Eye />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowEditModal(true);
                              }}
                              className="p-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 ml-2"
                              title="Edit"
                            >
                              <Icons.Edit />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 ml-2"
                              title="Delete"
                            >
                              <Icons.Trash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <span className="text-5xl">📦</span>
                  <p className="text-sm font-semibold">No assets found</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Duplicates Tab */}
          {activeTab === 'duplicates' && (
            <SectionCard title="Duplicate Assets" icon={Icons.Alert} delay={280}>
              {duplicates.length > 0 ? (
                <div className="space-y-4">
                  {duplicates.map((dup, idx) => (
                    <DuplicateAlert key={idx} duplicate={dup} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <span className="text-5xl">✅</span>
                  <p className="text-sm font-semibold">No duplicate assets found!</p>
                  <p className="text-xs">All assets have unique serial numbers.</p>
                </div>
              )}
            </SectionCard>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <SectionCard title="Problem Assets (By Repair Count)" icon={Icons.Alert} delay={280}>
              {trendingAssets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Model</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Serial #</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Repairs</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Total Cost</th>
                        <th className="px-4 py-3 text-center font-semibold text-slate-700 dark:text-slate-300">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {trendingAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{asset.model || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{asset.serial_number || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                              (asset.repair_count || 0) > 5 ? 'bg-red-100 text-red-700' :
                              (asset.repair_count || 0) > 3 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {asset.repair_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(asset.total_cost || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                              asset.priority_level === 'URGENT - Replace Recommended' ? 'bg-red-100 text-red-700 animate-pulse' :
                              asset.priority_level === 'Warning - Monitor Closely' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {asset.priority_level || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <span className="text-5xl">🏆</span>
                  <p className="text-sm font-semibold">No trending assets found</p>
                  <p className="text-xs">Assets with repairs will appear here.</p>
                </div>
              )}
            </SectionCard>
          )}
        </div>
      </main>

      {/* Asset Details Modal */}
      {selectedAsset && assetDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setSelectedAsset(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedAsset.model}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Serial: {selectedAsset.serial_number || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  Delete
                </button>
                <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-600">
                  <Icons.X />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Analysis Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Repairs</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{assetDetails.analysis?.totalRepairs || 0}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Cost</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(assetDetails.analysis?.totalRepairCost || 0)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Average Cost</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(assetDetails.analysis?.averageRepairCost || 0)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Recommendation</p>
                  <p className={`text-sm font-bold ${
                    assetDetails.analysis?.recommendation?.includes('Replace') ? 'text-red-600' :
                    assetDetails.analysis?.recommendation?.includes('Consider') ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {assetDetails.analysis?.recommendation || 'Monitor'}
                  </p>
                </div>
              </div>

              {/* Recommendation Reason */}
              {assetDetails.analysis?.recommendationReason && (
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <p className="text-sm text-cyan-700 dark:text-cyan-300">{assetDetails.analysis.recommendationReason}</p>
                </div>
              )}

              {/* Location History */}
              {locationHistory.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Location History</h3>
                  <div className="space-y-2">
                    {locationHistory.map(loc => (
                      <div key={loc.id} className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{loc.assigned_to || 'Unassigned'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{loc.department_name}</p>
                            {loc.location_description && (
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{loc.location_description}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            loc.location_status === 'Current Location' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {loc.location_status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          From: {formatDate(loc.assignment_date)} {loc.release_date && `To: ${formatDate(loc.release_date)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Location Button */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
              >
                <Icons.MapPin /> Update Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Update Modal */}
      {showLocationModal && selectedAsset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4" onClick={() => setShowLocationModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Asset Location</h2>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-600">
                <Icons.X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Department ID *
                </label>
                <input
                  type="text"
                  value={locationData.deptId}
                  onChange={(e) => setLocationData({ ...locationData, deptId: e.target.value })}
                  placeholder="Enter department ID"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Assigned To *
                </label>
                <input
                  type="text"
                  value={locationData.assignedTo}
                  onChange={(e) => setLocationData({ ...locationData, assignedTo: e.target.value })}
                  placeholder="Person name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Location Description
                </label>
                <input
                  type="text"
                  value={locationData.locationDescription}
                  onChange={(e) => setLocationData({ ...locationData, locationDescription: e.target.value })}
                  placeholder="e.g., Room 101, Building A"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={locationData.notes}
                  onChange={(e) => setLocationData({ ...locationData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowLocationModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                Cancel
              </button>
              <button onClick={updateLocation} className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <AssetEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateAsset}
        asset={selectedAsset}
      />

      <AssetDeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAsset}
        asset={selectedAsset}
      />
    </div>
  );
};

export default TotalAssetsPage;