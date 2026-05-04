import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departmentAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';

const DepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
      </div>

      {error && <div className="px-5 py-4 rounded-lg mb-5 text-sm border-l-4 bg-red-50 text-red-900 border-l-red-600">{error}</div>}

      {loading ? (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-white rounded-xl gap-5">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <p>Loading Departments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-5 shadow-sm">
          {departments.length === 0 ? (
            <div className="text-center p-10 text-slate-400 text-sm">
              <div className="text-5xl mb-4">📁</div>
              <div className="text-lg font-semibold mb-2 text-slate-500">No Departments Found</div>
              <div className="text-sm">Start by creating a new department</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Department Code</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Department Name</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Head Officer</th>
                    <th className="px-3 py-3 text-left font-semibold text-slate-700">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map(dept => (
                    <tr key={dept.id} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="px-3 py-3"><strong>{dept.code}</strong></td>
                      <td className="px-3 py-3">{dept.name}</td>
                      <td className="px-3 py-3">{dept.head_name || '-'}</td>
                      <td className="px-3 py-3">{dept.address || '-'}</td>
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

export default DepartmentsPage;
