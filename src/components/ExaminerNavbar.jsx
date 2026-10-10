
import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { notifyToast } from './ToastProvider';
import { clearStoredUser, getStoredUser } from '../api/apiFetch';

export default function ExaminerNavbar() {
  const navigate = useNavigate();
  const user = getStoredUser() || {};

  const handleLogout = () => {
    clearStoredUser();
    notifyToast('Logged out successfully', 'success');
    navigate('/', { replace: true });
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container-fluid px-lg-4">
        <Link
          className="navbar-brand d-flex align-items-center gap-2"
          to="/examiner-dashboard"
        >
          <div
            className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px' }}
          >
            <i className="fa-solid fa-user-tie fs-5"></i>
          </div>

          <div className="d-flex flex-column">
            <span className="fw-bold lh-1 text-white fs-5">
              ExamPulse
            </span>

            <span
              className="text-primary text-uppercase fw-bold"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '1px'
              }}
            >
              Examiner Portal
            </span>
          </div>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#examinerNavbar"
          aria-controls="examinerNavbar"
          aria-expanded="false"
          aria-label="Toggle examiner navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="examinerNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 fw-medium">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? 'text-white active'
                      : 'text-secondary-subtle'
                  }`
                }
                to="/examiner-dashboard"
              >
                <i className="fa-solid fa-chart-line me-1"></i>
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? 'text-white active'
                      : 'text-secondary-subtle'
                  }`
                }
                to="/subject-management"
              >
                <i className="fa-solid fa-book me-1"></i>
                Subjects
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? 'text-white active'
                      : 'text-secondary-subtle'
                  }`
                }
                to="/question-management"
              >
                <i className="fa-solid fa-database me-1"></i>
                Question Bank
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 text-white">
              <div
                className="bg-warning text-dark fw-bold rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="fa-solid fa-user-tie"></i>
              </div>

              <div className="lh-sm">
                <span
                  className="fw-bold d-block"
                  style={{ fontSize: '0.88rem' }}
                >
                  {user.username || 'Examiner'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm fw-semibold"
            >
              <i className="fa-solid fa-right-from-bracket me-1"></i>
              Exit Portal
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
