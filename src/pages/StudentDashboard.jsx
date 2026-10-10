import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getStoredUser } from '../api/apiFetch';

export default function Dashboard({ showToast }) {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stores whether each exam was already attempted
  const [attemptStatus, setAttemptStatus] = useState({});

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    const user = getStoredUser();

    if (!user) {
      setError('User is not logged in.');
      setLoading(false);
      return;
    }

    if (!user.userId) {
      setError('Unable to identify the logged-in user. Please log in again.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const response = await apiFetch(
          `/api/student/dashboard`
        );

        if (!response.ok) {
          throw new Error('Failed to load dashboard');
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setDashboard(data);

        // =====================================================
        // CHECK WHICH EXAMS WERE ALREADY ATTEMPTED
        // =====================================================

        const status = {};

        await Promise.all(
          (data.exams || []).map(async (exam) => {
            try {
              const response = await apiFetch(
                `/api/attempts/check?examId=${encodeURIComponent(
                  exam.examId
                )}&userId=${encodeURIComponent(user.userId)}`
              );

              if (!response.ok) {
                return;
              }

              const result = await response.json();

              status[exam.examId] = {
                attempted: result.attempted === true,
                attemptId: result.attemptId || null,
              };
            } catch (error) {
              console.error(
                `Failed to check exam ${exam.examId}:`,
                error
              );
            }
          })
        );

        if (!cancelled) {
          setAttemptStatus(status);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError('Unable to load dashboard data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // START / VIEW EXAM
  // =========================================================

  const handleStartExam = (exam) => {
    const status = attemptStatus[exam.examId];

    // Already attempted
    if (status?.attempted && status?.attemptId) {
      navigate(`/result/${status.attemptId}`);
      return;
    }

    // Not attempted
    navigate(`/instructions/${exam.examId}`);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateTime) => {
    if (!dateTime) {
      return 'Not scheduled';
    }

    return new Date(dateTime).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // =========================================================
  // CHECK LIVE EXAM
  // =========================================================

  const isLive = (exam) => {
    const now = new Date();

    const start = exam.startTime
      ? new Date(exam.startTime)
      : null;

    const end = exam.endTime
      ? new Date(exam.endTime)
      : null;

    return (
      (!start || now >= start) &&
      (!end || now <= end)
    );
  };

  // =========================================================
  // CHECK UPCOMING EXAM
  // =========================================================

  const isUpcoming = (exam) => {
    if (!exam.startTime) {
      return false;
    }

    return new Date() < new Date(exam.startTime);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="container py-5 flex-grow-1">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          />

          <p className="text-muted mt-3">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="container py-5 flex-grow-1">
        <div className="alert alert-danger">
          {error}
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return null;
  }

  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (
    <main className="container py-4 flex-grow-1">
      {/* WELCOME HERO BANNER */}

      <div className="card bg-primary text-white border-0 rounded-4 p-4 mb-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-white text-primary fw-bold mb-2 text-uppercase">
              Student Portal
            </span>

            <h2 className="fw-bold mb-1">
              Welcome back, {dashboard.username}!
            </h2>

            <p className="mb-0 text-white-50">
              {dashboard.activeExams > 0
                ? `You have ${dashboard.activeExams} exam${
                    dashboard.activeExams > 1 ? 's' : ''
                  } currently available.`
                : 'You have no active exams right now.'}
            </p>
          </div>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}

      <div className="row g-3 mb-4">
        {/* EXAMS TAKEN */}

        <div className="col-6 col-md-3">
          <div className="card border-1 shadow-sm p-3 card-hover">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary-subtle text-primary p-3 rounded-3">
                <i className="fa-solid fa-file-circle-check fs-4" />
              </div>

              <div>
                <h4 className="fw-bold mb-0">
                  {dashboard.examsTaken}
                </h4>

                <small className="text-muted">
                  Exams Taken
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* AVERAGE SCORE */}

        <div className="col-6 col-md-3">
          <div className="card border-1 shadow-sm p-3 card-hover">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success-subtle text-success p-3 rounded-3">
                <i className="fa-solid fa-chart-line fs-4" />
              </div>

              <div>
                <h4 className="fw-bold mb-0">
                  {dashboard.averagePercentage}%
                </h4>

                <small className="text-muted">
                  Average Score
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIVE EXAMS */}

        <div className="col-6 col-md-3">
          <div className="card border-1 shadow-sm p-3 card-hover">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-warning-subtle text-warning-emphasis p-3 rounded-3">
                <i className="fa-regular fa-clock fs-4" />
              </div>

              <div>
                <h4 className="fw-bold mb-0">
                  {String(dashboard.activeExams).padStart(2, '0')}
                </h4>

                <small className="text-muted">
                  Active Today
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTIONS ATTEMPTED */}

        <div className="col-6 col-md-3">
          <div className="card border-1 shadow-sm p-3 card-hover">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-info-subtle text-info p-3 rounded-3">
                <i className="fa-solid fa-list-check fs-4" />
              </div>

              <div>
                <h4 className="fw-bold mb-0">
                  {dashboard.attemptedQuestions}
                </h4>

                <small className="text-muted">
                  Questions Attempted
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN EXAM SCHEDULE & RECENT RESULTS */}

      <div className="row g-4">
        {/* ACTIVE EXAMS */}

        <div className="col-lg-8">
          <div className="card border-1 shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fa-solid fa-calendar-check text-primary me-2" />
                Active &amp; Assigned Exams
              </h5>
            </div>

            <div className="list-group list-group-flush">
              {dashboard.exams.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No exams available.
                </div>
              ) : (
                dashboard.exams.map((exam) => {
                  const live = isLive(exam);
                  const upcoming = isUpcoming(exam);

                  const attempted =
                    attemptStatus[exam.examId]?.attempted;

                  return (
                    <div
                      key={exam.examId}
                      className={`list-group-item p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 ${
                        upcoming ? 'bg-light' : ''
                      }`}
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          {live && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              Live Now
                            </span>
                          )}

                          {upcoming && (
                            <span className="badge bg-secondary-subtle text-secondary border">
                              Upcoming
                            </span>
                          )}

                          {!live && !upcoming && (
                            <span className="badge bg-success-subtle text-success border">
                              Available
                            </span>
                          )}

                          <span className="text-muted small">
                            {exam.subjectName}
                          </span>
                        </div>

                        <h6 className="fw-bold text-dark mb-1">
                          {exam.title}
                        </h6>

                        <p className="text-muted small mb-0">
                          <i className="fa-regular fa-clock me-1" />
                          {exam.durationMinutes} Mins
                          {' • '}
                          {exam.totalQuestions} Questions
                        </p>

                        <p className="text-muted small mb-0 mt-1">
                          <i className="fa-regular fa-calendar me-1" />
                          {exam.startTime
                            ? formatDate(exam.startTime)
                            : 'Available anytime'}
                        </p>
                      </div>

                      {live ? (
                        <button
                          onClick={() => handleStartExam(exam)}
                          className={`btn ${
                            attempted ? 'btn-success' : 'btn-primary'
                          } fw-bold text-nowrap px-4 py-2`}
                        >
                          {attempted ? 'View Result' : 'Start Exam'}

                          <i
                            className={`fa-solid ${
                              attempted ? 'fa-eye' : 'fa-arrow-right'
                            } ms-1`}
                          />
                        </button>
                      ) : upcoming ? (
                        <button
                          className="btn btn-outline-secondary fw-semibold text-nowrap px-4 py-2"
                          disabled
                        >
                          Not Ready Yet
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartExam(exam)}
                          className="btn btn-primary fw-bold text-nowrap px-4 py-2"
                        >
                          {attempted ? 'View Result' : 'Start Exam'}

                          <i
                            className={`fa-solid ${
                              attempted ? 'fa-eye' : 'fa-arrow-right'
                            } ms-1`}
                          />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RECENT RESULTS */}

        <div className="col-lg-4">
          <div className="card border-1 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="fa-solid fa-square-poll-vertical text-success me-2" />
                Recent Results
              </h5>
            </div>

            <div className="card-body p-3">
              {dashboard.recentResults.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No results available yet.
                </div>
              ) : (
                dashboard.recentResults.map((result) => (
                  <div
                    key={result.resultId}
                    className="p-3 bg-light rounded-3 d-flex justify-content-between align-items-center mb-2"
                  >
                    <div>
                      <h6 className="fw-bold text-dark mb-0">
                        {result.examTitle}
                      </h6>

                      <small className="text-muted">
                        Completed{' '}
                        {result.submittedAt
                          ? new Date(
                              result.submittedAt
                            ).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </small>
                    </div>

                    <button
                      onClick={() =>
                        showToast(
                          `Opening ${result.examTitle} result details...`
                        )
                      }
                      className="btn btn-link fw-bold text-success text-decoration-none p-0 border-0"
                    >
                      {result.percentage}%

                      <i className="fa-solid fa-chevron-right ms-1 text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}