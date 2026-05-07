import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { repairAPI, assetAPI, authAPI } from '../services/api';
import { getErrorMessage, formatDate, getStatusLabel } from '../utils/helpers';
import { Card, Badge, Alert, LoadingSpinner, EmptyState, Button } from '../components/UI';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

let pendingCountRefreshInterval = null;

const Dashboard = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    loadDashboardData();
    loadProfilePicture();
    
    // Load pending count for admins
    if (hasRole(['admin'])) {
      loadPendingCount();
      pendingCountRefreshInterval = setInterval(loadPendingCount, 15000);
    }
    
    return () => {
      if (pendingCountRefreshInterval) {
        clearInterval(pendingCountRefreshInterval);
      }
    };
  }, [hasRole]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const requests = [
        repairAPI.getStats(),
        assetAPI.getStats(),
        repairAPI.getAll({ status: '' })
      ];

      // Add pending registrations for admin users
      if (hasRole(['admin'])) {
        requests.push(authAPI.getPendingRegistrations());
      }

      const results = await Promise.all(requests);
      
      if (results[0].data.success) {
        setStats(results[0].data.data);
      }
      if (results[1].data.success) {
        setAssets(results[1].data.data);
      }
      if (results[2].data.success) {
        setRepairs(results[2].data.data.slice(0, 8));
      }
      if (hasRole(['admin']) && results[3] && results[3].data.success) {
        setPendingRegistrations(results[3].data.data.slice(0, 5));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadProfilePicture = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = user?.id;
      if (!userId) return;
      
      const response = await fetch(`http://localhost:5000/api/users/profile/picture/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setProfilePictureUrl(url);
      }
    } catch (err) {
      console.error('Error loading profile picture:', err);
    }
  };

  const loadPendingCount = async () => {
    try {
      const response = await authAPI.getPendingRegistrations();
      if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
        setPendingCount(response.data.data.length);
      }
    } catch (error) {
      console.debug('Failed to load pending count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const StatCard = ({ icon, label, value }) => (
    <Card hover>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600">{label}</p>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <LoadingSpinner />
      </div>
    );
  }

  const repairStatusData = stats ? [
    { name: 'Completed', value: stats.completed_repairs || 0, color: '#10b981' },
    { name: 'Pending', value: stats.pending_repairs || 0, color: '#f59e0b' },
    { name: 'In Progress', value: stats.in_progress_repairs || 0, color: '#3b82f6' }
  ].filter(item => item.value > 0) : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Profile Button - Shows User's Name instead of "Profile" */}
            <button 
              onClick={() => navigate('/profile')} 
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-300 rounded-lg hover:shadow-md transition-all hover:border-cyan-400"
              title="My Profile"
            >
              {profilePictureUrl ? (
                <img 
                  src={profilePictureUrl} 
                  alt="Profile" 
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <span className="text-lg">👤</span>
              )}
              <span className="text-sm font-semibold text-cyan-900">
                {user?.full_name || user?.username || 'User'}
              </span>
            </button>

            {hasRole(['admin']) && (
              <a 
                href="/approvals" 
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg hover:shadow-md transition-all hover:border-amber-400"
                title="View pending registration approvals"
              >
                <span className="text-lg">📋</span>
                <span className="text-sm font-semibold text-amber-900">
                  {pendingCount > 0 ? `${pendingCount} Pending` : 'Approvals'}
                </span>
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </a>
            )}
            
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <Alert variant="danger" icon="⚠️">{error}</Alert>}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard icon="🔧" label="Total Repairs" value={stats?.total_repairs || 0} />
          <StatCard icon="✅" label="Completed" value={stats?.completed_repairs || 0} />
          <StatCard icon="⏳" label="Pending" value={stats?.pending_repairs || 0} />
          <StatCard icon="⚙️" label="In Progress" value={stats?.in_progress_repairs || 0} />
          <StatCard icon="💰" label="Total Cost" value={`$${(stats?.total_invoice_cost || 0).toFixed(0)}`} />
          <StatCard icon="🖥️" label="Total Assets" value={assets?.total_assets || 0} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Repair Status</h3>
            {repairStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={repairStatusData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value">
                    {repairStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No data" />
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-6">Cost Breakdown</h3>
            {stats && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Assessment', value: stats.total_assessment_cost || 0 },
                  { name: 'Invoice', value: stats.total_invoice_cost || 0 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0284c7" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        {/* Admin: Registration Approvals Section */}
        {hasRole(['admin']) && (
          <Card className="mb-8 border-l-4 border-cyan-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pending Registration Approvals</h3>
                  <p className="text-sm text-slate-600">New user registration requests</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/approvals')} 
                className="btn-primary text-sm"
              >
                View All →
              </button>
            </div>

            {pendingRegistrations.length > 0 ? (
              <div className="space-y-4">
                {pendingRegistrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-cyan-400 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {reg.user_type === 'staff' ? '👤' : reg.user_type === 'technician' ? '🔧' : '🌐'}
                        </span>
                        <h4 className="font-semibold text-slate-900">{reg.first_name} {reg.last_name}</h4>
                        <Badge variant="warning" size="sm">{
                          reg.user_type === 'staff' ? 'Staff' : 
                          reg.user_type === 'technician' ? 'Technician' : 'Other'
                        }</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {reg.department_name || reg.company_shop_name || 'N/A'} • {reg.email}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 text-right mr-4">
                      {formatDate(reg.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="✅" title="All Approved!" message="No pending registrations to review" />
            )}
          </Card>
        )}

        {/* Recent Repairs */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Recent Repairs</h3>
            <button onClick={() => navigate('/repairs')} className="btn-primary text-sm">
              View All →
            </button>
          </div>
          
          {repairs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Asset</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Issue</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair) => (
                    <tr key={repair.id} className="border-b border-slate-200 hover:bg-cyan-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-700">#{repair.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{repair.asset_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 line-clamp-1">{repair.issue || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={repair.status === 'completed' ? 'success' : repair.status === 'pending' ? 'warning' : 'info'}>
                          {getStatusLabel(repair.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{formatDate(repair.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon="📋" title="No repairs" message="No repair records found" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;