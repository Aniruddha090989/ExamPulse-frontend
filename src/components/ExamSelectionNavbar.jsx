import React from 'react';
import { Link } from 'react-router-dom';

export default function ExamSelectionNavbar() {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <span className="fw-bold text-dark fs-5">ExamPulse</span>
        </Link>
        <Link to="/dashboard" className="btn btn-outline-primary btn-sm fw-semibold">
          <i className="fa-solid fa-user me-1"></i> Student Dashboard
        </Link>
      </div>
    </header>
  );
}