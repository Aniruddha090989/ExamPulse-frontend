// import React, { useState } from 'react';

// export default function Navbar({ onOpenCodeModal, showToast }) {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   return (
//     <nav className="container">
//       <div className="d-flex align-items-center justify-content-between py-3">
//         {/* Logo */}
//         <a href="#" className="d-flex align-items-center gap-2 text-decoration-none">
//           <div className="rounded-3 bg-brand-600 text-white d-flex align-items-center justify-center px-2 py-1 fw-bold fs-5 shadow-sm">
//             <i className="fa-solid fa-graduation-cap me-1"></i>
//           </div>
//           <span className="fs-4 fw-extrabold text-dark tracking-tight">
//             Exam<span className="text-brand-600">Lite</span>
//           </span>
//         </a>

//         {/* Desktop Links */}
//         <div className="d-none d-md-flex align-items-center gap-4 fw-semibold text-secondary small">
//           <a href="#features" className="text-decoration-none text-secondary hover-brand">Features</a>
//           <a href="#how-it-works" className="text-decoration-none text-secondary hover-brand">How It Works</a>
//           <a href="#exams" className="text-decoration-none text-secondary hover-brand">Practice Exams</a>
//           <a href="#preview" className="text-decoration-none text-secondary hover-brand">Dashboard Preview</a>
//           <a href="#security" className="text-decoration-none text-secondary hover-brand">Security</a>
//         </div>

//         {/* Action Buttons */}
//         <div className="d-none d-sm-flex align-items-center gap-2">
//           <button onClick={onOpenCodeModal} className="btn btn-brand-light rounded-3 px-3 py-2 btn-sm fw-semibold d-flex align-items-center gap-2">
//             <i className="fa-solid fa-key"></i>
//             <span>Enter Code</span>
//           </button>
//           <button onClick={() => showToast('Demo Login: Welcome back, Student!')} className="btn btn-link text-decoration-none text-secondary btn-sm fw-semibold">
//             Log In
//           </button>
//           <button onClick={() => showToast('Sign up is open for institutional demos.')} className="btn btn-brand rounded-3 px-3 py-2 btn-sm fw-semibold shadow-sm">
//             Get Started
//           </button>
//         </div>

//         {/* Mobile Toggle Button */}
//         <button 
//           className="btn btn-light d-md-none border-0" 
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//         >
//           <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} fs-5`}></i>
//         </button>
//       </div>

//       {/* Mobile Dropdown Menu */}
//       {mobileMenuOpen && (
//         <div className="d-md-none pb-4 pt-2 border-top">
//           <div className="d-flex flex-column gap-2 mb-3">
//             <a href="#features" className="text-decoration-none text-dark py-1">Features</a>
//             <a href="#how-it-works" className="text-decoration-none text-dark py-1">How It Works</a>
//             <a href="#exams" className="text-decoration-none text-dark py-1">Practice Exams</a>
//             <a href="#preview" className="text-decoration-none text-dark py-1">Dashboard Preview</a>
//             <a href="#security" className="text-decoration-none text-dark py-1">Security</a>
//           </div>
//           <div className="d-flex flex-column gap-2">
//             <button onClick={onOpenCodeModal} className="btn btn-brand-light w-100 fw-semibold">
//               <i className="fa-solid fa-key me-2"></i>Enter Test Code
//             </button>
//             <button onClick={() => showToast('Demo Mode Active')} className="btn btn-brand w-100 fw-semibold">
//               Log In / Register
//             </button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }



import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
      <div className="container">
        
        {/* Logo / Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div 
            className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" 
            style={{ width: '40px', height: '40px' }}
          >
            <i className="fa-solid fa-graduation-cap fs-5"></i>
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold lh-1 text-dark fs-5">ExamPulse</span>
            <span className="text-primary text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '1px' }}>
              Portal
            </span>
          </div>
        </Link>

        {/* Mobile Toggler Button */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent" 
          aria-controls="navbarContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links & Action Buttons */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold text-center">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link ${isActive ? 'text-primary active' : 'text-secondary'}`} 
                to="/"
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => `nav-link ${isActive ? 'text-primary active' : 'text-secondary'}`} 
                to="/exam-selection"
              >
                Available Exams
              </NavLink>
            </li>
            <li className="nav-item">
             
            </li>
            <li className="nav-item">
              <a className="nav-link text-secondary" href="#help">
                Help & Support
              </a>
            </li>
          </ul>

          {/* Right Action Controls */}
          <div className="d-flex flex-column flex-lg-row align-items-center gap-2 mt-3 mt-lg-0">
            {/* Quick Code Entry Button */}
            
            
            {/* Divider (Desktop only) */}
            <div className="vr d-none d-lg-block mx-1"></div>

            {/* Auth Links */}
            <Link to="/login" className="btn btn-link text-decoration-none text-dark fw-semibold btn-sm px-3">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm fw-semibold px-3 py-2 shadow-sm">
              Get Started
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}