
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notifyToast } from './ToastProvider';
import {
  clearStoredUser,
  getStoredUser
} from '../api/apiFetch';

export default function StudentDashboardNavbar() {
  const navigate = useNavigate();
  const user = getStoredUser() || {};

  const handleLogout = () => {
    clearStoredUser();
    notifyToast('Logged out successfully', 'success');
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/dashboard"
        >
          <div
            className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: '36px', height: '36px' }}
          >
            <i className="fa-solid fa-graduation-cap"></i>
          </div>

          <span className="fw-bold text-dark fs-5">
            ExamPulse
          </span>
        </Link>

        {/* User Info & Actions */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <div
              className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '38px', height: '38px' }}
            >
              <i className="fa-solid fa-user"></i>
            </div>

            <div className="d-none d-sm-block text-start lh-sm">
              <span
                className="fw-bold text-dark d-block"
                style={{ fontSize: '0.9rem' }}
              >
                {user.username || 'Student'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline-danger btn-sm px-3 fw-semibold"
          >
            <i className="fa-solid fa-right-from-bracket me-1"></i>
            Log Out
          </button>
        </div>
      </div>
    </header>
  );
}
