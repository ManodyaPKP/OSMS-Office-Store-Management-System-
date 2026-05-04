import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetAPI } from '../services/api';
import { getErrorMessage, getStatusLabel, getStatusColor } from '../utils/helpers';

const AssetsPage = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    asset_type: ''
  });

  useEffect(() => {
    loadAssets();
  }, [filters]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetAPI.getAll(filters);
      if (response.data.success) {
        setAssets(response.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex-1 p-5">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Assets</h1>
      </div>

      {error && <div className="px-5 py-4 rounded-lg mb-5 text-sm border-l-4 bg-red-50 text-red-900 border-l-red-600">{error}</div>}

      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="flex gap-2 items-center">
          <label className="text-xs font-medium text-slate-600">Status:</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-slate-300 rounded-md text-xs"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="under_repair">Under Repair</option>
            <option value="repaired">Repaired</option>
            <option value="condemned">Condemned</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <label className="text-xs font-medium text-slate-600">Type:</label>
          <select
            name="asset_type"
            value={filters.asset_type}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-slate-300 rounded-md text-xs"
          >
            <option value="">All</option>
            <option value="laptop">Laptop</option>
            <option value="desktop">Desktop</option>
            <option value="printer">Printer</option>
            <option value="monitor">Monitor</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-xl gap-5">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p>Loading Assets...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-5 shadow-sm">
          {assets.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-sm">
              <div className="text-5xl mb-4">🖥️</div>
              <div className="text-lg font-semibold mb-2 text-slate-500">No Assets Found</div>
              <div className="text-sm">No assets match your criteria</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Serial Number</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Model</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Type</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Department</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">In Charge</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map(asset => (
                    <tr key={asset.id} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="px-3 py-3"><strong>{asset.serial_number || '-'}</strong></td>
                      <td className="px-3 py-3">{asset.model}</td>
                      <td className="px-3 py-3">{asset.asset_type}</td>
                      <td className="px-3 py-3">{asset.dept_name || '-'}</td>
                      <td className="px-3 py-3">{asset.incharge_name || '-'}</td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(asset.status) + '30',
                            color: getStatusColor(asset.status)
                          }}
                        >
                          {getStatusLabel(asset.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
