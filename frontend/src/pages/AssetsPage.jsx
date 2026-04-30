import React, { useEffect, useState } from 'react';
import { assetAPI } from '../services/api';
import { getErrorMessage, getStatusLabel, getStatusColor } from '../utils/helpers';
import './pages.css';

const AssetsPage = () => {
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
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Assets</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="list-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="form-select"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="under_repair">Under Repair</option>
            <option value="repaired">Repaired</option>
            <option value="condemned">Condemned</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Type:</label>
          <select
            name="asset_type"
            value={filters.asset_type}
            onChange={handleFilterChange}
            className="form-select"
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
        <div className="loading">
          <div className="spinner"></div>
          Loading Assets...
        </div>
      ) : (
        <div className="list-container">
          {assets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🖥️</div>
              <div className="empty-state-title">No Assets Found</div>
              <div className="empty-state-message">No assets match your criteria</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Department</th>
                  <th>In Charge</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td><strong>{asset.serial_number || '-'}</strong></td>
                    <td>{asset.model}</td>
                    <td>{asset.asset_type}</td>
                    <td>{asset.dept_name || '-'}</td>
                    <td>{asset.incharge_name || '-'}</td>
                    <td>
                      <span
                        className="badge"
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
          )}
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
