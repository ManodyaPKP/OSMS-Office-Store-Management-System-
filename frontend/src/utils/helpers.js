// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const d = new Date(dateTime);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Status badge colors
export const getStatusColor = (status) => {
  const colors = {
    active: '#10b981',
    under_repair: '#f59e0b',
    repaired: '#3b82f6',
    condemned: '#ef4444',
    pending: '#6b7280',
    in_repair: '#f59e0b',
    completed: '#10b981',
    approved: '#10b981',
    rejected: '#ef4444',
    post_repair: '#3b82f6',
    return: '#10b981',
    pro05_request: '#f59e0b',
    final_decision: '#3b82f6'
  };
  return colors[status] || '#6b7280';
};

// Status badge labels
export const getStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    under_repair: 'Under Repair',
    repaired: 'Repaired',
    condemned: 'Condemned',
    pending: 'Pending',
    in_repair: 'In Progress',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
    post_repair: 'Post-Repair',
    return: 'Return',
    pro05_request: 'PRO 05 Request',
    final_decision: 'Final Decision'
  };
  return labels[status] || status;
};

// Currency formatting
export const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Validation helpers
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Error message helper
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An error occurred. Please try again.';
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Storage error:', e);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};
