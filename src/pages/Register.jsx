
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
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

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      const response = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: 'STUDENT',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.message || 'Registration failed');
        return;
      }

      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);

      alert(
        'Cannot connect to server. Please try again later.'
      );
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5 px-3">
      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="row g-0">

            {/* LEFT PANEL: BRANDING */}
            <div
              className="col-lg-5 text-white p-4 p-md-5 d-flex flex-column justify-content-between"
              style={{ backgroundColor: '#1e2329' }}
            >
              <div>
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

                <h4 className="fw-bold text-white mb-2">
                  Join ExamPulse
                </h4>

                <p className="text-secondary-subtle small mb-4">
                  Create an account to access online exams,
                  track learning, and view your results.
                </p>

                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="bg-primary bg-opacity-25 text-primary rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="fa-solid fa-circle-check fs-6"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-semibold text-white small">
                        Secure Registration
                      </h6>

                      <small
                        className="text-secondary-subtle"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Create your personal student account
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="bg-info bg-opacity-25 text-info rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="fa-solid fa-layer-group fs-6"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-semibold text-white small">
                        Student Portal
                      </h6>

                      <small
                        className="text-secondary-subtle"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Access available examinations
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="bg-success bg-opacity-25 text-success rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="fa-solid fa-chart-line fs-6"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-semibold text-white small">
                        Track Your Progress
                      </h6>

                      <small
                        className="text-secondary-subtle"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Review your examination results
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-top border-secondary border-opacity-25 mt-4">
                <p
                  className="mb-0 text-secondary-subtle small"
                  style={{ fontSize: '0.75rem' }}
                >
                  © 2026 ExamPulse Inc. Secure Registration.
                </p>
              </div>
            </div>

            {/* RIGHT PANEL: REGISTRATION FORM */}
            <div className="col-lg-7 bg-white p-4 p-md-5">

              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0">
                  Create Your Account
                </h5>

                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small fw-semibold">
                  Student Registration
                </span>
              </div>

              <div className="bg-light p-3 rounded-3 d-flex align-items-center gap-3 mb-4">
                <div
                  className="bg-white text-primary shadow-sm rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '42px', height: '42px' }}
                >
                  <i className="fa-solid fa-user-graduate fs-5"></i>
                </div>

                <div>
                  <div className="fw-bold text-dark">
                    Student Account
                  </div>

                  <small className="text-muted">
                    Examiner accounts are provided by administrator.
                  </small>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* FULL NAME */}
                <div className="mb-3">
                  <label
                    htmlFor="fullName"
                    className="form-label small fw-semibold text-dark mb-1"
                  >
                    Full Name
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="fa-solid fa-user"></i>
                    </span>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      className="form-control border-start-0 ps-0"
                      placeholder="Sourav Paul"
                      value={formData.fullName}
                      onChange={handleChange}
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                  <label
                    htmlFor="email"
                    className="form-label small fw-semibold text-dark mb-1"
                  >
                    Email Address
                  </label>

                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <i className="fa-solid fa-envelope"></i>
                    </span>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="form-control border-start-0 ps-0"
                      placeholder="paulsourav@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      maxLength={254}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORDS */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="password"
                      className="form-label small fw-semibold text-dark mb-1"
                    >
                      Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="fa-solid fa-lock"></i>
                      </span>

                      <input
                        id="password"
                        type="password"
                        name="password"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>

                    <small className="text-muted">
                      Use at least 8 characters.
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label
                      htmlFor="confirmPassword"
                      className="form-label small fw-semibold text-dark mb-1"
                    >
                      Confirm Password
                    </label>

                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="fa-solid fa-key"></i>
                      </span>

                      <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        className="form-control border-start-0 ps-0"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* TERMS */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      className="form-check-input"
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                    />

                    <label
                      className="form-check-label small text-muted"
                      htmlFor="agreeTerms"
                    >
                      I agree to the{' '}
                      <a
                        href="#terms"
                        className="text-primary text-decoration-none"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="#privacy"
                        className="text-primary text-decoration-none"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn btn-primary fw-bold w-100 py-2 shadow-sm mb-3"
                >
                  Create Account
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </form>

              {/* SIGN IN */}
              <p className="text-center text-muted small mb-0 mt-4">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary text-decoration-none fw-semibold"
                >
                  Sign In
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
