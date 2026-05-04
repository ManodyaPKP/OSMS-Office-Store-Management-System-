import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import { Button, Input, Select, Alert } from '../components/UI';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('staff');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Common fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Staff fields
  const [departmentName, setDepartmentName] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [position, setPosition] = useState('');

  // Technician fields
  const [companyName, setCompanyName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [address, setAddress] = useState('');

  // Other fields
  const [idNumber, setIdNumber] = useState('');
  const [registrationNote, setRegistrationNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: email || undefined,
        mobile_number: mobileNumber,
        user_type: userType,
        username,
        password
      };

      // Add role-specific fields
      if (userType === 'staff') {
        payload.department_name = departmentName;
        payload.section_name = sectionName;
        payload.unit_name = unitName;
        payload.position = position;
      } else if (userType === 'technician') {
        payload.company_shop_name = companyName;
        payload.company_phone = companyPhone;
        payload.address = address;
      } else if (userType === 'other') {
        payload.id_number = idNumber;
        payload.registration_note = registrationNote;
      }

      const response = await fetch('http://localhost:5000/api/users/register/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('✅ Registration submitted! Please wait for admin approval before logging in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-600 via-cyan-500 to-cyan-700 flex items-center justify-center p-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-8 py-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-3xl font-bold text-white">Register</h1>
            <p className="text-cyan-100 text-sm mt-2">Create a new account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <Alert variant="danger" icon="⚠️">{error}</Alert>}
            {success && <Alert variant="success" icon="✅">{success}</Alert>}

            {/* Common Fields */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name *"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                />
                <Input
                  label="Last Name *"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Mobile Number *"
                type="tel"
                placeholder="+1234567890"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* User Type Selection */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900">Account Type</h3>
              <Select
                label="User Type *"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                options={[
                  { value: 'staff', label: '👤 Staff Member' },
                  { value: 'technician', label: '🔧 Technician' },
                  { value: 'other', label: '🌐 Other' }
                ]}
                disabled={loading}
              />
            </div>

            {/* Role-Specific Fields */}
            {userType === 'staff' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-900">Staff Details</h3>
                <Input
                  label="Department Name"
                  type="text"
                  placeholder="Finance Department"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Section Name"
                  type="text"
                  placeholder="Accounting Section"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Unit Name"
                  type="text"
                  placeholder="Budget Unit"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Position"
                  type="text"
                  placeholder="Senior Accountant"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {userType === 'technician' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-900">Technician Details</h3>
                <Input
                  label="Company/Shop Name"
                  type="text"
                  placeholder="Tech Solutions Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Company/Shop Phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Address"
                  type="text"
                  placeholder="123 Tech Street, Tech City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {userType === 'other' && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-bold text-slate-900">Additional Information</h3>
                <Input
                  label="ID Number *"
                  type="text"
                  placeholder="ID123456"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="form-field">
                  <label className="label">Registration Note *</label>
                  <textarea
                    className="input"
                    placeholder="Please explain why you want to access this platform..."
                    value={registrationNote}
                    onChange={(e) => setRegistrationNote(e.target.value)}
                    rows="4"
                    required
                    disabled={loading}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Account Credentials */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-bold text-slate-900">Account Credentials</h3>
              <Input
                label="Username *"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <Input
                label="Password *"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : (
                '📝 Register'
              )}
            </Button>

            {/* Footer */}
            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-cyan-600 hover:text-cyan-700">
                Sign in here
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 text-white text-sm">
          <p className="flex items-start gap-2">
            <span className="text-lg">ℹ️</span>
            <span>After registration, your account will be reviewed by administrators before approval.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
