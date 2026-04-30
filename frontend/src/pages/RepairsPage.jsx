import React, { useEffect, useState } from 'react';
import { repairAPI } from '../services/api';
import { getErrorMessage, formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';
import './pages.css';

const RepairsPage = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });

  useEffect(() => {
    loadRepairs();
  }, [filters]);

  const loadRepairs = async () => {
    try {
      setLoading(true);
      const response = await repairAPI.getAll(filters);
      if (response.data.success) {
        setRepairs(response.data.data);
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
        <h1 className="page-title">Repair Jobs</h1>
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
            <option value="pending">Pending</option>
            <option value="in_repair">In Repair</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading Repairs...
        </div>
      ) : (
        <div className="list-container">
          {repairs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔧</div>
              <div className="empty-state-title">No Repairs Found</div>
              <div className="empty-state-message">No repair jobs match your criteria</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Asset Model</th>
                  <th>Serial #</th>
                  <th>Department</th>
                  <th>Issue</th>
                  <th>Submitted Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {repairs.map(repair => (
                  <tr key={repair.id}>
                    <td><strong>{repair.model || '-'}</strong></td>
                    <td>{repair.serial_number || '-'}</td>
                    <td>{repair.dept_name || '-'}</td>
                    <td className="truncate">{repair.issue_description?.substring(0, 30) || '-'}...</td>
                    <td>{formatDate(repair.submitted_date)}</td>
                    <td>${repair.invoice_amount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: getStatusColor(repair.repair_status) + '30',
                          color: getStatusColor(repair.repair_status)
                        }}
                      >
                        {getStatusLabel(repair.repair_status)}
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

export default RepairsPage;
