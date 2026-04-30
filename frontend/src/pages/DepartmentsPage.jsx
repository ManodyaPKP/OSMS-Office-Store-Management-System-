import React, { useEffect, useState } from 'react';
import { departmentAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import './pages.css';

const DepartmentsPage = () => {
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
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Departments</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading Departments...
        </div>
      ) : (
        <div className="list-container">
          {departments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <div className="empty-state-title">No Departments Found</div>
              <div className="empty-state-message">Start by creating a new department</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Department Code</th>
                  <th>Department Name</th>
                  <th>Head Officer</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dept => (
                  <tr key={dept.id}>
                    <td><strong>{dept.code}</strong></td>
                    <td>{dept.name}</td>
                    <td>{dept.head_name || '-'}</td>
                    <td>{dept.address || '-'}</td>
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

export default DepartmentsPage;
