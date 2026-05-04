import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairAPI } from '../services/api';
import { getErrorMessage, formatDate, getStatusLabel, getStatusColor } from '../utils/helpers';

const RepairsPage = () => {
  const navigate = useNavigate();
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
    <div className="flex-1 p-5">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Repair Jobs</h1>
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
            <option value="pending">Pending</option>
            <option value="in_repair">In Repair</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-xl gap-5">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p>Loading Repairs...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-5 shadow-sm">
          {repairs.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-sm">
              <div className="text-5xl mb-4">🔧</div>
              <div className="text-lg font-semibold mb-2 text-slate-500">No Repairs Found</div>
              <div className="text-sm">No repair jobs match your criteria</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Asset Model</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Serial #</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Department</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Issue</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Submitted Date</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Cost</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map(repair => (
                    <tr key={repair.id} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="px-3 py-3"><strong>{repair.model || '-'}</strong></td>
                      <td className="px-3 py-3">{repair.serial_number || '-'}</td>
                      <td className="px-3 py-3">{repair.dept_name || '-'}</td>
                      <td className="px-3 py-3 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{repair.issue_description?.substring(0, 30) || '-'}...</td>
                      <td className="px-3 py-3">{formatDate(repair.submitted_date)}</td>
                      <td className="px-3 py-3">${repair.invoice_amount?.toFixed(2) || '0.00'}</td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepairsPage;
