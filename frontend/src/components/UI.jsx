import React from 'react';

export const Card = ({ children, className = '', hover = true }) => (
  <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled = false, className = '', ...props }) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'primary' }) => (
  <span className={`badge-${variant}`}>
    {children}
  </span>
);

export const Alert = ({ children, variant = 'info', icon = '❗' }) => (
  <div className={`alert alert-${variant} animate-slideInDown`}>
    <span className="text-lg">{icon}</span>
    <span>{children}</span>
  </div>
);

export const Input = ({ label, error, ...props }) => (
  <div className="form-field">
    {label && <label className="label">{label}</label>}
    <input className={`input ${error ? 'border-danger-500' : ''}`} {...props} />
    {error && <p className="text-xs text-danger-600">{error}</p>}
  </div>
);

export const Select = ({ label, options, error, ...props }) => (
  <div className="form-field">
    {label && <label className="label">{label}</label>}
    <select className={`input ${error ? 'border-danger-500' : ''}`} {...props}>
      <option value="">Select an option</option>
      {options?.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-danger-600">{error}</p>}
  </div>
);

export const Modal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content w-full max-w-md p-6 animate-slideInUp" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
        </div>
        <div className="mb-6">
          {children}
        </div>
        {actions && (
          <div className="flex gap-3 justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export const Table = ({ columns, data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-striped table-hover">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data?.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="spinner"></div>
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'No data', message = 'Start adding content' }) => (
  <div className="text-center py-12">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
    <p className="text-slate-500">{message}</p>
  </div>
);
