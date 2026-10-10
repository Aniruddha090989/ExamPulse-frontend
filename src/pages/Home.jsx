import React, { useState } from 'react';

const quizData = {
  'Math 101': [
    { q: "Solve for x: 2x + 6 = 14", options: ["x = 3", "x = 4", "x = 5", "x = 6"], correct: 1 },
    { q: "What is the square root of 144?", options: ["10", "11", "12", "14"], correct: 2 },
    { q: "Simplify: (x^2 * x^3)", options: ["x^5", "x^6", "x^1", "x^8"], correct: 0 }
  ],
  'CS Fundamentals': [
    { q: "Which data structure uses LIFO (Last In First Out)?", options: ["Queue", "Stack", "Array", "Tree"], correct: 1 },
    { q: "What is the binary representation of decimal number 5?", options: ["100", "101", "110", "111"], correct: 1 },
    { q: "Which algorithm complexity is faster for searching?", options: ["O(N)", "O(N^2)", "O(log N)", "O(N log N)"], correct: 2 }
  ],
  'General Aptitude': [
    { q: "Which number completes the series: 2, 4, 8, 16, __?", options: ["24", "30", "32", "64"], correct: 2 },
    { q: "If CAT is coded as 3120, how is DOG coded?", options: ["4157", "41515", "3157", "5168"], correct: 0 },
    { q: "Find the odd one out: Apple, Banana, Carrot, Grape", options: ["Apple", "Banana", "Carrot", "Grape"], correct: 2 }
  ]
};

export default function Home({ showToast, codeModalOpen, setCodeModalOpen }) {
  const [examCode, setExamCode] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [portalRole, setPortalRole] = useState('student');

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [currentQuizKey, setCurrentQuizKey] = useState('Math 101');
  const [currentQuizTitle, setCurrentQuizTitle] = useState('Mathematics 101');
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Exam Code Formatting
  const handleCodeChange = (e) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length > 2 && !val.includes('-')) {
      val = val.substring(0, 2) + '-' + val.substring(2);
    }
    setExamCode(val);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (!examCode) return;
    setCodeModalOpen(true);
  };

  const startPracticeQuiz = (title, key) => {
    setCurrentQuizTitle(title);
    setCurrentQuizKey(key);
    setCurrentQIdx(0);
    setSelectedOpt(null);
    setUserAnswers([]);
    setQuizFinished(false);
    setQuizModalOpen(true);
  };

  const handleNextQuestion = () => {
    if (selectedOpt === null) {
      showToast("Please select an answer option first.");
      return;
    }
    const updatedAnswers = [...userAnswers, selectedOpt];
    setUserAnswers(updatedAnswers);
    setSelectedOpt(null);

    const questions = quizData[currentQuizKey] || quizData['Math 101'];
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      let correctCount = 0;
      updatedAnswers.forEach((ans, idx) => {
        if (ans === questions[idx].correct) correctCount++;
      });
      const pct = Math.round((correctCount / questions.length) * 100);
      setFinalScore(pct);
      setQuizFinished(true);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="position-relative py-5 overflow-hidden bg-gradient-light">
        <div className="hero-bg-accent"></div>
        <div className="container position-relative z-1 py-md-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7 text-center text-lg-start">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-brand-50 border border-brand-200 text-brand-700 fw-semibold small mb-3">
                <span className="spinner-grow spinner-grow-sm text-primary" role="status"></span>
                <span>Trusted by 500+ Schools & Universities</span>
              </div>

              <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-3">
                Online Exams Made <span className="gradient-text">Simpler, Faster</span> & Secure.
              </h1>

              <p className="lead text-secondary mb-4 max-w-2xl">
                ExamLite delivers distraction-free test taking for students and automated, anti-cheat assessments for educators. No complex setup needed.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mb-5">
                <a
  href="#exams"
  className="btn rounded-3 px-4 py-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 text-decoration-none"
  style={{
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    color: '#ffffff'
  }}
>
                  <span>Browse Practice Exams</span>
                  <i className="fa-solid fa-arrow-right fs-7"></i>
                </a>
                
              </div>

              {/* Trust Stats */}
              <div className="row border-top pt-4 text-secondary text-center text-lg-start">
                <div className="col-4">
                  <h3 className="fw-bold text-dark mb-0 fs-4">99.9%</h3>
                  <p className="small mb-0">Uptime Guarantee</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold text-dark mb-0 fs-4">1.2M+</h3>
                  <p className="small mb-0">Tests Completed</p>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold text-dark mb-0 fs-4">Instant</h3>
                  <p className="small mb-0">AI Auto-Grading</p>
                </div>
              </div>
            </div>

            {/* Hero Quick Join Card */}
            <div className="col-lg-5">
              <div className="card border-0 rounded-4 shadow-lg p-4 position-relative pulse-subtle bg-white">
                <span className="position-absolute top-0 end-0 translate-middle-y me-4 badge bg-success rounded-pill px-3 py-2 text-uppercase tracking-wider fw-bold">
                  Live Room Active
                </span>

                <div className="mb-4">
                  <div className="rounded-3 bg-brand-50 text-brand-600 d-inline-flex align-items-center justify-content-center p-3 fs-4 mb-2 fw-bold">
                    <i className="fa-solid fa-door-open"></i>
                  </div>
                  <h4 className="fw-bold text-dark mb-1">Quick Exam Entrance</h4>
                  <p className="small text-secondary mb-0">Have a test pin from your instructor? Enter it below to begin.</p>
                </div>

                

                <div className="mt-4 pt-3 border-top d-flex align-items-center justify-content-between small text-secondary">
                  <span className="text-success fw-medium">
                    <i className="fa-solid fa-shield-halved me-1"></i> Proctoring Ready
                  </span>
                  <span>No installation required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-5 bg-white border-top border-bottom">
        <div className="container py-md-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-brand-600 fs-7 fw-bold text-uppercase tracking-widest">3-Step Process</span>
            <h2 className="fw-extrabold text-dark mt-1">How ExamLite Works</h2>
            <p className="text-secondary">Simple and straightforward for both students and proctors.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light rounded-4 p-4 text-center">
                <div
                    className="rounded-4 text-white fs-4 fw-bold d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                    style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: '#2563eb'
                    }}
                  >
                    01
                  </div>
                <h5 className="fw-bold text-dark">Enter Code or Select Test</h5>
                <p className="small text-secondary mb-0">Enter your 6-digit exam access pin provided by your instructor or choose a practice test.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light rounded-4 p-4 text-center">
                <div className="rounded-4 bg-indigo text-white fs-4 fw-bold d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow" style={{ width: '56px', height: '56px', backgroundColor: '#4f46e5' }}>
                  02
                </div>
                <h5 className="fw-bold text-dark">System & Identity Check</h5>
                <p className="small text-secondary mb-0">A quick 10-second automated check ensures your webcam, browser, and internet connection are optimal.</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 bg-light rounded-4 p-4 text-center">
                <div className="rounded-4 bg-success text-white fs-4 fw-bold d-inline-flex align-items-center justify-content-center mx-auto mb-3 shadow" style={{ width: '56px', height: '56px' }}>
                  03
                </div>
                <h5 className="fw-bold text-dark">Start Exam & Get Results</h5>
                <p className="small text-secondary mb-0">Answer questions in a clean, distraction-free environment and view instant automated scoring upon submission.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practice Exams Bank */}
      <section id="exams" className="py-5 bg-light">
        <div className="container py-md-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
            <div>
              <span className="text-brand-600 fs-7 fw-bold text-uppercase tracking-widest">Practice Bank</span>
              <h2 className="fw-extrabold text-dark mb-1">Featured Practice Tests</h2>
              <p className="text-secondary mb-0">Test your knowledge with these instant self-assessment quizzes.</p>
            </div>

            <div className="btn-group">
              <button onClick={() => setActiveTab('all')} className={`btn btn-sm ${activeTab === 'all' ? 'btn-brand' : 'btn-outline-secondary bg-white'}`}>All Tests</button>
              <button onClick={() => setActiveTab('stem')} className={`btn btn-sm ${activeTab === 'stem' ? 'btn-brand' : 'btn-outline-secondary bg-white'}`}>STEM</button>
              <button onClick={() => setActiveTab('aptitude')} className={`btn btn-sm ${activeTab === 'aptitude' ? 'btn-brand' : 'btn-outline-secondary bg-white'}`}>Aptitude</button>
            </div>
          </div>

          <div className="row g-4">
            {(activeTab === 'all' || activeTab === 'stem') && (
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 rounded-4 p-4 shadow-sm bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">Mathematics</span>
                      <span className="small text-secondary"><i className="fa-regular fa-clock me-1"></i> 15 Mins</span>
                    </div>
                    <h5 className="fw-bold text-dark">Mathematics 101: Basic Algebra</h5>
                    <p className="small text-secondary mt-2">Evaluation of fundamental quadratic equations, simple polynomials, and basic sequence logic.</p>
                  </div>
                  <div className="pt-3 border-top mt-4">
                    <div className="d-flex justify-content-between small text-secondary mb-3">
                      <span><i className="fa-regular fa-file-lines me-1"></i> 3 Questions</span>
                      <span className="text-success"><i className="fa-solid fa-check-circle me-1"></i> Auto-Graded</span>
                    </div>
                    <button onClick={() => startPracticeQuiz('Mathematics 101: Basic Algebra', 'Math 101')} className="btn btn-dark w-100 py-2 rounded-3 btn-sm fw-semibold d-flex align-items-center justify-content-center gap-2">
                      <span>Start Practice</span>
                      <i className="fa-solid fa-play fs-8"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'stem') && (
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 rounded-4 p-4 shadow-sm bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-indigo-subtle text-indigo border px-2 py-1" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Computer Science</span>
                      <span className="small text-secondary"><i className="fa-regular fa-clock me-1"></i> 20 Mins</span>
                    </div>
                    <h5 className="fw-bold text-dark">Computer Science Fundamentals</h5>
                    <p className="small text-secondary mt-2">Introductory computer concepts including data structures, logic gates, and basic algorithms.</p>
                  </div>
                  <div className="pt-3 border-top mt-4">
                    <div className="d-flex justify-content-between small text-secondary mb-3">
                      <span><i className="fa-regular fa-file-lines me-1"></i> 3 Questions</span>
                      <span className="text-success"><i className="fa-solid fa-check-circle me-1"></i> Auto-Graded</span>
                    </div>
                    <button onClick={() => startPracticeQuiz('Computer Science Fundamentals', 'CS Fundamentals')} className="btn btn-dark w-100 py-2 rounded-3 btn-sm fw-semibold d-flex align-items-center justify-content-center gap-2">
                      <span>Start Practice</span>
                      <i className="fa-solid fa-play fs-8"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'aptitude') && (
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 rounded-4 p-4 shadow-sm bg-white d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">General Aptitude</span>
                      <span className="small text-secondary"><i className="fa-regular fa-clock me-1"></i> 10 Mins</span>
                    </div>
                    <h5 className="fw-bold text-dark">General Reasoning & Logic</h5>
                    <p className="small text-secondary mt-2">Quick problem solving, pattern recognition, and logical deduction diagnostic test.</p>
                  </div>
                  <div className="pt-3 border-top mt-4">
                    <div className="d-flex justify-content-between small text-secondary mb-3">
                      <span><i className="fa-regular fa-file-lines me-1"></i> 3 Questions</span>
                      <span className="text-success"><i className="fa-solid fa-check-circle me-1"></i> Auto-Graded</span>
                    </div>
                    <button onClick={() => startPracticeQuiz('General Reasoning & Logic', 'General Aptitude')} className="btn btn-dark w-100 py-2 rounded-3 btn-sm fw-semibold d-flex align-items-center justify-content-center gap-2">
                      <span>Start Practice</span>
                      <i className="fa-solid fa-play fs-8"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Portal Views Switcher */}
      <section id="preview" className="py-5 bg-white border-top">
        <div className="container py-md-4">
          <div className="text-center max-w-2xl mx-auto mb-4">
            <span className="text-brand-600 fs-7 fw-bold text-uppercase tracking-widest">Portal Previews</span>
            <h2 className="fw-extrabold text-dark mt-1">Designed for Both Sides of the Desk</h2>
            <p className="text-secondary">Switch between the student environment and teacher proctor dashboard.</p>

            <div className="bg-light p-1 rounded-3 d-inline-flex border mt-3">
              <button 
                onClick={() => setPortalRole('student')} 
                className={`btn btn-sm fw-bold rounded-2 px-3 py-2 ${portalRole === 'student' ? 'bg-white shadow-sm text-primary' : 'text-secondary'}`}
              >
                <i className="fa-solid fa-user-graduate me-2"></i>Student Dashboard
              </button>
              <button 
                onClick={() => setPortalRole('teacher')} 
                className={`btn btn-sm fw-bold rounded-2 px-3 py-2 ${portalRole === 'teacher' ? 'bg-white shadow-sm text-primary' : 'text-secondary'}`}
              >
                <i className="fa-solid fa-chalkboard-user me-2"></i>Examiner / Teacher View
              </button>
            </div>
          </div>

          {/* Dark Mockup Container */}
     <div
          className="card rounded-4 p-4 text-white shadow-lg border-0 max-w-5xl mx-auto"
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #475569'
          }}
        >
          {/* Browser / Portal Header */}
          <div className="d-flex justify-content-between align-items-center pb-3 border-bottom border-secondary border-opacity-50 mb-4 small text-light">

            <div className="d-flex align-items-center gap-2">

              <span
                className="bg-danger rounded-circle d-inline-block"
                style={{
                  width: '10px',
                  height: '10px'
                }}
              ></span>

              <span
                className="bg-warning rounded-circle d-inline-block"
                style={{
                  width: '10px',
                  height: '10px'
                }}
              ></span>

              <span
                className="bg-success rounded-circle d-inline-block"
                style={{
                  width: '10px',
                  height: '10px'
                }}
              ></span>

              <span className="font-monospace ms-2 text-light opacity-75">
                portal.examlite.com/dashboard
              </span>

            </div>

            <span className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50">
              Role: {portalRole === 'student' ? 'Student View' : 'Examiner View'}
            </span>

          </div>


          {/* =========================
              STUDENT PORTAL
              ========================= */}
          {portalRole === 'student' ? (

            <div className="row g-3">

              {/* Next Scheduled Test */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <span className="fs-8 fw-bold text-info text-uppercase tracking-wider">
                    Next Scheduled Test
                  </span>

                  <h6 className="fw-bold text-white mt-1">
                    Physics 201 - Midterm
                  </h6>

                  <p className="small text-light opacity-75 mb-3">
                    <i className="fa-regular fa-calendar me-1"></i>
                    Tomorrow, 10:00 AM
                  </p>

                  <div className="pt-2 border-top border-light border-opacity-25 d-flex justify-content-between align-items-center">

                    <span className="small text-success">
                      <i className="fa-solid fa-check me-1"></i>
                      Registered
                    </span>

                    <button
                      onClick={() => showToast('System pre-check verified!')}
                      className="btn btn-primary btn-sm fs-8 py-1"
                    >
                      Test Device
                    </button>

                  </div>

                </div>

              </div>


              {/* System Hardware Check */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <span className="fs-8 fw-bold text-success text-uppercase tracking-wider">
                    System Hardware Check
                  </span>

                  <div className="mt-2 d-flex flex-column gap-2 small">

                    <div className="d-flex justify-content-between">

                      <span className="text-white">
                        <i className="fa-solid fa-video text-success me-2"></i>
                        Webcam & Mic
                      </span>

                      <span className="text-success fw-bold">
                        Ready
                      </span>

                    </div>


                    <div className="d-flex justify-content-between">

                      <span className="text-white">
                        <i className="fa-solid fa-wifi text-success me-2"></i>
                        Speed Check
                      </span>

                      <span className="text-success fw-bold">
                        42 Mbps
                      </span>

                    </div>


                    <div className="d-flex justify-content-between">

                      <span className="text-white">
                        <i className="fa-solid fa-window-maximize text-success me-2"></i>
                        Secure Browser
                      </span>

                      <span className="text-success fw-bold">
                        Supported
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* Recent Results */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <span className="fs-8 fw-bold text-warning text-uppercase tracking-wider">
                    Recent Results
                  </span>

                  <div className="d-flex justify-content-between align-items-center mt-2">

                    <div>

                      <h6 className="fw-bold text-white mb-0">
                        Calculus Quiz #4
                      </h6>

                      <span className="small text-light opacity-75">
                        Submitted 2 days ago
                      </span>

                    </div>

                    <div className="text-end">

                      <span className="fs-3 fw-bold text-success">
                        94%
                      </span>

                      <p className="fs-8 text-light opacity-75 mb-0">
                        Grade A
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          ) : (

            /* =========================
              TEACHER / EXAMINER PORTAL
              ========================= */

            <div className="row g-3">

              {/* Exam Management */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <span className="fs-8 fw-bold text-info text-uppercase tracking-wider">
                    Exam Management
                  </span>

                  <h6 className="fw-bold text-white mt-1">
                    Create New Examination
                  </h6>

                  <p className="small text-light opacity-75 mb-3">
                    Configure questions, set lockdown settings, and generate code.
                  </p>

                  <button
                    onClick={() => showToast('Exam Builder Modal Opened')}
                    className="btn btn-primary btn-sm w-100 fw-semibold"
                  >
                    <i className="fa-solid fa-plus me-1"></i>
                    Create Exam
                  </button>

                </div>

              </div>


              {/* Active Room */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <div className="d-flex justify-content-between align-items-center">

                    <span className="fs-8 fw-bold text-warning text-uppercase tracking-wider">
                      Active Room Proctored
                    </span>

                    <span
                      className="spinner-grow spinner-grow-sm text-success"
                      role="status"
                    ></span>

                  </div>

                  <h6 className="fw-bold text-white mt-1">
                    CS-101 Final Exam
                  </h6>

                  <div className="d-flex justify-content-between small text-light opacity-75 mt-3">

                    <span>
                      Active:
                      <strong className="text-white ms-1">
                        42/45
                      </strong>
                    </span>

                    <span className="text-warning">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                      1 Flag
                    </span>

                  </div>

                </div>

              </div>


              {/* Automated Grading */}
              <div className="col-md-4">

                <div
                  className="rounded-3 p-3 h-100"
                  style={{
                    backgroundColor: '#334155',
                    border: '1px solid #475569'
                  }}
                >

                  <span className="fs-8 fw-bold text-info text-uppercase tracking-wider">
                    Automated Grading
                  </span>

                  <h6 className="fw-bold text-white mt-1">
                    Class Average: 84%
                  </h6>

                  <p className="small text-light opacity-75 mb-2">
                    38 papers graded instantly upon submission.
                  </p>

                  <button
                    onClick={() => showToast('Exporting CSV Gradebook...')}
                    className="btn btn-link p-0 text-info small fw-semibold text-decoration-none"
                  >
                    Export Gradebook (CSV) &rarr;
                  </button>

                </div>

              </div>

            </div>

          )}

        </div>
        </div>
      </section>

      {/* Anti-Cheat & Security Highlights */}
      <section id="security" className="py-5 bg-light border-top">
        <div className="container py-md-4">
          <div className="text-center max-w-2xl mx-auto mb-5">
            <span className="text-brand-600 fs-7 fw-bold text-uppercase tracking-widest">Security & Integrity</span>
            <h2 className="fw-extrabold text-dark mt-1">Built-in Integrity & Security</h2>
            <p className="text-secondary">Comprehensive tools to keep examinations fair, reliable, and authentic.</p>
          </div>

          <div className="row g-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card h-100 border-0 rounded-4 p-4 bg-white shadow-sm">
                <div className="rounded-3 bg-brand-50 text-brand-600 d-inline-flex align-items-center justify-content-center p-3 fs-4 mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fa-solid fa-lock"></i>
                </div>
                <h6 className="fw-bold text-dark">Browser Lockdown</h6>
                <p className="small text-secondary mb-0">Prevents opening external tabs, copying/pasting questions, or using secondary screens during test taking.</p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card h-100 border-0 rounded-4 p-4 bg-white shadow-sm">
                <div className="rounded-3 bg-indigo-subtle text-indigo d-inline-flex align-items-center justify-content-center p-3 fs-4 mb-3" style={{ width: '48px', height: '48px', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
                  <i className="fa-solid fa-robot"></i>
                </div>
                <h6 className="fw-bold text-dark">AI Proctoring</h6>
                <p className="small text-secondary mb-0">Smart automated detection flags suspicious gaze shifts, multiple faces, or background noise gently.</p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card h-100 border-0 rounded-4 p-4 bg-white shadow-sm">
                <div className="rounded-3 bg-warning-subtle text-warning-emphasis d-inline-flex align-items-center justify-content-center p-3 fs-4 mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fa-solid fa-hourglass-half"></i>
                </div>
                <h6 className="fw-bold text-dark">Smart Time Limits</h6>
                <p className="small text-secondary mb-0">Question-level or exam-level countdown timers with auto-submit protection when time expires.</p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card h-100 border-0 rounded-4 p-4 bg-white shadow-sm">
                <div className="rounded-3 bg-success-subtle text-success d-inline-flex align-items-center justify-content-center p-3 fs-4 mb-3" style={{ width: '48px', height: '48px' }}>
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <h6 className="fw-bold text-dark">Instant AI Grading</h6>
                <p className="small text-secondary mb-0">Multiple choice and short text responses are graded automatically, giving instant feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Pre-Check Modal */}
      {codeModalOpen && (
        <div className="modal show d-block tab-index-1 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setCodeModalOpen(false)}></button>
              </div>
              <div className="modal-body text-center pt-0">
                <div className="rounded-circle bg-brand-50 text-brand-600 d-inline-flex align-items-center justify-content-center p-3 fs-3 mb-3">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <h5 className="fw-bold text-dark">Entering Room: <span className="text-brand-600 font-monospace">{examCode || 'EX-101'}</span></h5>
                <p className="small text-secondary mb-4">Performing quick system compatibility check...</p>

                <div className="bg-light p-3 rounded-3 text-start small mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span><i className="fa-solid fa-desktop text-brand-600 me-2"></i>Screen & Browser Check</span>
                    <span className="text-success fw-bold"><i className="fa-solid fa-circle-check me-1"></i>Passed</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span><i className="fa-solid fa-wifi text-brand-600 me-2"></i>Network Latency</span>
                    <span className="text-success fw-bold"><i className="fa-solid fa-circle-check me-1"></i>18ms (Fast)</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span><i className="fa-solid fa-user-shield text-brand-600 me-2"></i>Anti-Cheat Session ID</span>
                    <span className="text-success fw-bold"><i className="fa-solid fa-circle-check me-1"></i>Verified</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button onClick={() => setCodeModalOpen(false)} className="btn btn-light w-50 py-2 rounded-3 text-secondary fw-semibold">Cancel</button>
                  <button 
                    onClick={() => {
                      setCodeModalOpen(false);
                      startPracticeQuiz(`Official Test (${examCode || 'EX-101'})`, 'Math 101');
                    }} 
                    className="btn btn-brand w-50 py-2 rounded-3 fw-semibold"
                  >
                    Start Test Now &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quiz Simulator Modal */}
      {quizModalOpen && (
        <div className="modal show d-block tab-index-1 bg-dark bg-opacity-50" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
              <div className="modal-header border-bottom pb-3 mb-3">
                <div>
                  <span className="badge bg-brand-50 text-brand-700 text-uppercase me-2">Practice Test</span>
                  <h5 className="modal-title fw-bold text-dark d-inline">{currentQuizTitle}</h5>
                </div>
                <span className="badge bg-light text-dark font-monospace fs-6 px-3 py-2 border">
                  <i className="fa-regular fa-clock text-brand-600 me-1"></i>04:59
                </span>
              </div>

              {!quizFinished ? (
                <div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Question {currentQIdx + 1} of {(quizData[currentQuizKey] || quizData['Math 101']).length}</span>
                    <span>Single Choice</span>
                  </div>

                  <h6 className="fw-bold text-dark fs-5 mb-4">
                    {(quizData[currentQuizKey] || quizData['Math 101'])[currentQIdx].q}
                  </h6>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {(quizData[currentQuizKey] || quizData['Math 101'])[currentQIdx].options.map((opt, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setSelectedOpt(i)}
                        className={`btn text-start p-3 rounded-3 option-btn d-flex justify-content-between align-items-center ${selectedOpt === i ? 'selected border-primary bg-primary-subtle' : ''}`}
                      >
                        <span className="fw-medium text-dark">{opt}</span>
                        <div className={`rounded-circle border ${selectedOpt === i ? 'bg-primary border-primary' : ''}`} style={{ width: '16px', height: '16px' }}></div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <button onClick={() => setQuizModalOpen(false)} className="btn btn-link text-secondary text-decoration-none p-0">Quit Test</button>
                    <button onClick={handleNextQuestion} className="btn btn-brand px-4 py-2 rounded-3 fw-semibold">
                      Submit & Next &rarr;
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center p-3 fs-1 mb-3">
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <h4 className="fw-bold text-dark">Practice Completed!</h4>
                  <p className="small text-secondary mb-4">Instant AI Grading Report Generated</p>

                  <div className="card bg-light border rounded-3 p-3 max-w-xs mx-auto mb-4">
                    <span className="small text-secondary text-uppercase fw-bold">Your Score</span>
                    <h1 className="fw-extrabold text-brand-600 mb-0">{finalScore}%</h1>
                    <span className="small text-success fw-medium mt-1"><i className="fa-solid fa-check-circle me-1"></i> Excellent Understanding</span>
                  </div>

                  <button onClick={() => setQuizModalOpen(false)} className="btn btn-dark px-4 py-2 rounded-3 fw-semibold">
                    Close Practice Window
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}