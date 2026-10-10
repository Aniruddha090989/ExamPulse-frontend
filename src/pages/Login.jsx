
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  apiFetch,
  clearStoredUser,
} from '../api/apiFetch';
import { notifyToast } from '../components/ToastProvider';

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); // 'student' | 'examiner'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error('The server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Incorrect Credentials');
        }
        throw new Error(data.message || 'Unable to log in. Please try again.');
      }

      // Check whether the account belongs to the selected portal.
      if (
        (role === 'student' && data.role !== 'STUDENT') ||
        (role === 'examiner' && data.role !== 'ADMIN')
      ) {
        throw new Error('Incorrect Credentials');
      }

      // Ensure the backend returned a JWT.
      if (!data.token) {
        throw new Error(
          'Login response did not contain an authentication token.'
        );
      }

      // Remove previous account data to prevent stale sessions.
      clearStoredUser();

      // Store the complete authentication response only once.
      const storage = formData.rememberMe
        ? localStorage
        : sessionStorage;

      storage.setItem('user', JSON.stringify(data));

      // Navigate according to the backend role.
      if (data.role === 'ADMIN') {
        navigate('/examiner-dashboard');
      } else if (data.role === 'STUDENT') {
        navigate('/dashboard');
      } else {
        clearStoredUser();
        throw new Error('Unknown user role');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.message || 'Unable to log in. Please try again.';
      notifyToast(message, message === 'Incorrect Credentials' ? 'error' : 'error');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">

          <div className="row g-0">

            {/* LEFT PANEL: DARK BRANDING WORKSPACE */}
            <div
              className="col-lg-5 text-white p-4 p-md-5 d-flex flex-column justify-content-between"
              style={{ backgroundColor: '#1e2329' }}
            >
              <div>

                {/* Brand Logo */}
                <Link
                  to="/"
                  className="d-flex align-items-center gap-2 text-decoration-none mb-4"
                >
                  <div
                    className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: '38px', height: '38px' }}
                  >
                    <i className="fa-solid fa-graduation-cap fs-5"></i>
                  </div>

                  <div className="d-flex flex-column">
                    <span className="fw-bold lh-1 text-white fs-5">
                      ExamPulse
                    </span>

                    <span
                      className="text-primary text-uppercase fw-bold"
                      style={{
                        fontSize: '0.65rem',
                        letterSpacing: '1px',
                      }}
                    >
                      PORTAL
                    </span>
                  </div>
                </Link>

                {/* Headline */}
                <h4 className="fw-bold text-white mb-2">
                  Welcome Back!
                </h4>

                <p className="text-secondary-subtle small mb-4">
                  Sign in to access your assessment workspace and track
                  performance analytics.
                </p>

                {/* Feature Highlights */}
                <div className="d-flex flex-column gap-3">

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="bg-primary bg-opacity-25 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{
                        width: '32px',
                        height: '32px',
                      }}
                    >
                      <i className="fa-solid fa-shield-halved fs-6"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-semibold text-white small">
                        AI-Powered Security
                      </h6>

                      <small
                        className="text-secondary-subtle"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Real-time automated proctoring
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="bg-success bg-opacity-25 text-success rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{
                        width: '32px',
                        height: '32px',
                      }}
                    >
                      <i className="fa-solid fa-bolt fs-6"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-semibold text-white small">
                        Instant Grade Analytics
                      </h6>

                      <small
                        className="text-secondary-subtle"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Automated scoring &amp; feedback
                      </small>
                    </div>
                  </div>

                </div>
              </div>

              {/* Panel Footer */}
              <div className="pt-4 border-top border-secondary border-opacity-25 mt-4">
                <p
                  className="mb-0 text-secondary-subtle small"
                  style={{ fontSize: '0.75rem' }}
                >
                  © 2026 ExamPulse Inc. Encrypted Session.
                </p>
              </div>
            </div>

            {/* RIGHT PANEL: FORM CONTROLS */}
            <div className="col-lg-7 bg-white p-4 p-md-5">

              {/* Header Title & Badge */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">
                  Sign In to Account
                </h5>

                
              </div>

              {/* Role Selector Tabs */}
              <div className="bg-light p-1 rounded-3 d-flex mb-4">

                <button
                  type="button"
                  className={`btn btn-sm flex-fill fw-bold rounded-2 transition-all ${
                    role === 'student'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted border-0'
                  }`}

                  
                  
                  onClick={() => setRole('student')}
                >
                  <i className="fa-solid fa-user-graduate me-1"></i>
                  Student Portal
                </button>

                <button
                  type="button"
                  className={`btn btn-sm flex-fill fw-bold rounded-2 transition-all ${
                    role === 'examiner'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted border-0'
                  }`}
                  onClick={() => setRole('examiner')}
                >
                  <i className="fa-solid fa-user-tie me-1"></i>
                  Examiner Portal
                </button>

              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>

                {/* Email Field */}
                <div className="mb-3">

                  <label className="form-label small fw-semibold text-dark">
                    Email Address
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="fa-solid fa-envelope"></i>
                    </span>

                    <input
                      type="email"
                      name="email"
                      className="form-control border-start-0 ps-0"
                      placeholder={
                        role === 'examiner'
                          ? 'paulsourav@exampulse.edu'
                          : 'ahamedimroz@university.edu'
                      }
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                    />

                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-3">

                  <div className="d-flex justify-content-between align-items-center mb-1">

                    <label className="form-label small fw-semibold text-dark mb-0">
                      Password
                    </label>

                    <a
                      href="#forgot"
                      className="text-primary text-decoration-none small fw-semibold"
                    >
                      Forgot password?
                    </a>

                  </div>

                  <div className="input-group">

                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="fa-solid fa-lock"></i>
                    </span>

                    <input
                      type="password"
                      name="password"
                      className="form-control border-start-0 ps-0"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      required
                    />

                  </div>
                </div>

                {/* Checkbox */}
                <div className="mb-4">

                  <div className="form-check">

                    <input
                      type="checkbox"
                      name="rememberMe"
                      className="form-check-input"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                    />

                    <label
                      className="form-check-label small text-muted"
                      htmlFor="rememberMe"
                    >
                      Keep me signed in
                    </label>

                  </div>

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary fw-bold w-100 py-2 shadow-sm mb-3"
                >
                  Sign In as{' '}
                  {role === 'examiner' ? 'Examiner' : 'Student'}

                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>

              </form>

              

              

              {/* Sign Up Redirect */}
              <p className="text-center text-muted small mb-0">

                Don't have an account yet?{' '}

                <Link
                  to="/signup"
                  className="text-primary text-decoration-none fw-semibold"
                >
                  Create Account
                </Link>

              </p>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
