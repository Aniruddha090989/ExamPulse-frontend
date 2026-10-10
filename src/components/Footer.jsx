// import React from 'react';

// export default function Footer({ showToast }) {
//   return (
//     <footer className="bg-white border-top mt-auto py-5">
//       <div className="container">
//         <div className="row g-4 mb-4 text-secondary small">
//           <div className="col-12 col-md-4">
//             <div className="d-flex align-items-center gap-2 mb-2">
//               <div className="rounded-2 bg-brand-600 text-white px-2 py-1 fw-bold fs-6">
//                 <i className="fa-solid fa-graduation-cap"></i>
//               </div>
//               <span className="fs-5 fw-bold text-dark">ExamLite</span>
//             </div>
//             <p className="mb-0">Simple, clean, and reliable online testing platform for students and educators.</p>
//           </div>

//           <div className="col-6 col-md-2">
//             <h6 className="fw-bold text-dark text-uppercase tracking-wider fs-7 mb-3">Quick Links</h6>
//             <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
//               <li><a href="#features" className="text-decoration-none text-secondary">Features</a></li>
//               <li><a href="#how-it-works" className="text-decoration-none text-secondary">How It Works</a></li>
//               <li><a href="#exams" className="text-decoration-none text-secondary">Practice Tests</a></li>
//               <li><a href="#security" className="text-decoration-none text-secondary">Security</a></li>
//             </ul>
//           </div>

//           <div className="col-6 col-md-3">
//             <h6 className="fw-bold text-dark text-uppercase tracking-wider fs-7 mb-3">Support & Help</h6>
//             <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
//               <li><button onClick={() => showToast('Support Center: 24/7 Live Chat active')} className="btn btn-link p-0 text-decoration-none text-secondary text-start border-0">Help Center</button></li>
//               <li><button onClick={() => showToast('System Check: Browser optimal')} className="btn btn-link p-0 text-decoration-none text-secondary text-start border-0">System Compatibility Check</button></li>
//               <li><button onClick={() => showToast('Privacy Policy: All data encrypted')} className="btn btn-link p-0 text-decoration-none text-secondary text-start border-0">Privacy Policy</button></li>
//             </ul>
//           </div>

//           <div className="col-12 col-md-3">
//             <h6 className="fw-bold text-dark text-uppercase tracking-wider fs-7 mb-3">Contact</h6>
//             <p className="mb-1"><i className="fa-regular fa-envelope me-2"></i> support@examlite.com</p>
//             <p className="mb-3"><i className="fa-solid fa-phone me-2"></i> +1 (800) 555-EXAM</p>
//             <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-semibold">
//               <i className="fa-solid fa-circle text-success me-1 fs-8"></i> All Systems Operational
//             </span>
//           </div>
//         </div>

//         <div className="pt-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 small text-secondary">
//           <p className="mb-0">&copy; 2026 ExamLite Platform. All rights reserved.</p>
//           <div className="d-flex gap-3 fs-6">
//             <a href="#" className="text-secondary"><i className="fa-brands fa-twitter"></i></a>
//             <a href="#" className="text-secondary"><i className="fa-brands fa-github"></i></a>
//             <a href="#" className="text-secondary"><i className="fa-brands fa-linkedin"></i></a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }



import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-secondary pt-5 pb-4 border-top border-secondary border-opacity-25 mt-auto">
      <div className="container">
        
        {/* Top Grid Section */}
        <div className="row g-4 mb-5">
          
          {/* Brand & Status Column */}
          <div className="col-lg-5 col-md-12">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div 
                className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" 
                style={{ width: '36px', height: '36px' }}
              >
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <span className="fw-bold text-white fs-5">ExamPulse</span>
            </div>
            <p className="small text-secondary-subtle mb-3 pe-lg-5">
              Next-generation online examination platform equipped with AI proctoring, automated evaluation, and real-time performance analytics.
            </p>
            <span className="badge bg-secondary bg-opacity-25 border border-secondary text-light fw-normal py-2 px-3 rounded-pill">
              <span className="d-inline-block bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></span>
              All Systems Operational
            </span>
          </div>

          {/* Links Column 1: Platform */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Platform</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><Link to="/exam-selection" className="text-secondary text-decoration-none">Online Exams</Link></li>
              <li><a href="#proctoring" className="text-secondary text-decoration-none">AI Proctoring</a></li>
              <li><Link to="/question-management" className="text-secondary text-decoration-none">Question Bank</Link></li>
              <li><a href="#grading" className="text-secondary text-decoration-none">Automated Grading</a></li>
            </ul>
          </div>

          {/* Links Column 2: Solutions */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Solutions</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><a href="#universities" className="text-secondary text-decoration-none">Universities</a></li>
              <li><a href="#schools" className="text-secondary text-decoration-none">K-12 Schools</a></li>
              <li><a href="#corporate" className="text-secondary text-decoration-none">Corporate Tests</a></li>
              <li><Link to="/dashboard" className="text-secondary text-decoration-none">Student Portal</Link></li>
            </ul>
          </div>

          {/* Links Column 3: Support & Legal */}
          <div className="col-6 col-md-3">
            <h6 className="text-white fw-bold text-uppercase small tracking-wider mb-3">Support & Legal</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2">
              <li><a href="#help" className="text-secondary text-decoration-none">Help Center</a></li>
              <li><a href="#hardware-check" className="text-secondary text-decoration-none">System Hardware Check</a></li>
              <li><a href="#privacy" className="text-secondary text-decoration-none">Privacy Policy</a></li>
              <li><a href="#terms" className="text-secondary text-decoration-none">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar Section */}
        <div className="pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <p className="mb-0 text-secondary-subtle small">© 2026 ExamPulse Inc. All rights reserved.</p>
          
          {/* Social Media Icons */}
          <div className="d-flex gap-3 text-secondary">
            <a href="https://x.com" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="Twitter">
              <i className="fa-brands fa-x-twitter fs-6"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="GitHub">
              <i className="fa-brands fa-github fs-6"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin fs-6"></i>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}