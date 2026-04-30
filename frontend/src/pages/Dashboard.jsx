import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { repairAPI, assetAPI, departmentAPI } from '../services/api';
import { getErrorMessage, formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [repairStats, assetStats, repairsList] = await Promise.all([
        repairAPI.getStats(),
        assetAPI.getStats(),
        repairAPI.getAll({ status: '' })
      ]);

      if (repairStats.data.success) {
        setStats(repairStats.data.data);
      }

      if (assetStats.data.success) {
        setAssets(assetStats.data.data);
      }

      if (repairsList.data.success) {
        setRepairs(repairsList.data.data.slice(0, 8)); // Last 8 repairs
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Prepare chart data for repair status
  const repairStatusData = stats ? [
    { name: 'Completed', value: stats.completed_repairs || 0, color: '#10b981' },
    { name: 'Pending', value: stats.pending_repairs || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.in_progress_repairs || 0, color: '#3b82f6' }
  ].filter(item => item.value > 0) : [];

  // Prepare chart data for cost breakdown
  const costData = stats ? [
    {
      category: 'Assessment',
      cost: stats.total_assessment_cost || 0
    },
    {
      category: 'Invoice',
      cost: stats.total_invoice_cost || 0
    }
  ] : [];

  const totalRepairs = stats?.total_repairs || 0;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to OSMS - Office Store Management System</p>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <p className="user-name">{user?.full_name || 'User'}</p>
              <p className="user-role">{user?.role || 'User'}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Dashboard...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card metric-primary">
              <div className="metric-icon">🔧</div>
              <div className="metric-content">
                <p className="metric-value">{stats?.total_repairs || 0}</p>
                <p className="metric-label">Total Repairs</p>
              </div>
            </div>

            <div className="metric-card metric-success">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <p className="metric-value">{stats?.completed_repairs || 0}</p>
                <p className="metric-label">Completed</p>
              </div>
            </div>

            <div className="metric-card metric-warning">
              <div className="metric-icon">⏳</div>
              <div className="metric-content">
                <p className="metric-value">{stats?.pending_repairs || 0}</p>
                <p className="metric-label">Pending</p>
              </div>
            </div>

            <div className="metric-card metric-info">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <p className="metric-value">${(stats?.total_invoice_cost || 0).toFixed(0)}</p>
                <p className="metric-label">Total Cost</p>
              </div>
            </div>

            <div className="metric-card metric-secondary">
              <div className="metric-icon">🖥️</div>
              <div className="metric-content">
                <p className="metric-value">{assets?.total_assets || 0}</p>
                <p className="metric-label">Total Assets</p>
              </div>
            </div>

            <div className="metric-card metric-danger">
              <div className="metric-icon">⚠️</div>
              <div className="metric-content">
                <p className="metric-value">{assets?.under_repair_count || 0}</p>
                <p className="metric-label">Under Repair</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Repair Status Distribution</h3>
              </div>
              {repairStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repairStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {repairStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">No repair data available</p>
              )}
            </div>

            <div className="chart-container">
              <div className="chart-header">
                <h3>Cost Breakdown</h3>
              </div>
              {costData.some(item => item.cost > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="no-data">No cost data available</p>
              )}
            </div>
          </div>

          {/* Recent Repairs */}
          <div className="recent-section">
            <div className="section-header">
              <h3>Recent Repair Jobs</h3>
              <a href="/repairs" className="view-all-link">View All →</a>
            </div>
            
            {repairs.length > 0 ? (
              <div className="repairs-table-wrapper">
                <table className="repairs-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Serial #</th>
                      <th>Issue</th>
                      <th>Submitted</th>
                      <th>Cost</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repairs.map(repair => (
                      <tr key={repair.id}>
                        <td className="font-bold">{repair.model || '-'}</td>
                        <td>{repair.serial_number || '-'}</td>
                        <td className="text-truncate">{repair.issue_description?.substring(0, 35) || '-'}...</td>
                        <td>{formatDate(repair.submitted_date)}</td>
                        <td className="text-right">${repair.invoice_amount?.toFixed(2) || '0.00'}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusColor(repair.repair_status) + '20',
                              color: getStatusColor(repair.repair_status),
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {getStatusLabel(repair.repair_status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent repairs</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="quick-links-section">
            <h3>Quick Actions</h3>
            <div className="quick-links-grid">
              <a href="/assets" className="quick-link">
                <span className="quick-link-icon">🖥️</span>
                <span className="quick-link-text">View Assets</span>
              </a>
              <a href="/departments" className="quick-link">
                <span className="quick-link-icon">🏢</span>
                <span className="quick-link-text">Departments</span>
              </a>
              <a href="/repairs" className="quick-link">
                <span className="quick-link-icon">🔧</span>
                <span className="quick-link-text">Repairs</span>
              </a>
              <a href="/" className="quick-link">
                <span className="quick-link-icon">📊</span>
                <span className="quick-link-text">Reports</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

