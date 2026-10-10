
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';

export default function Result() {
  const { attemptId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  /*
   * GET USER ID
   */
  const getUserId = () => {
    try {
      const storedUser =
        localStorage.getItem('user') ||
        sessionStorage.getItem('user');

      if (!storedUser) {
        return null;
      }

      const user = JSON.parse(storedUser);
      return user.userId;
    } catch (error) {
      console.error('Failed to read logged-in user:', error);
      return null;
    }
  };

  /*
   * FETCH RESULT FROM DATABASE
   */
  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const userId = getUserId();

        if (!userId) {
          throw new Error(
            'User session not found. Please login again.'
          );
        }

        if (!attemptId) {
          throw new Error('Attempt ID is missing.');
        }

        const response = await apiFetch(
          `/api/attempts/${encodeURIComponent(attemptId)}/result?userId=${encodeURIComponent(userId)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Failed to load examination result.'
          );
        }

        setResult(data);
      } catch (error) {
        console.error('Result loading error:', error);

        setErrorMessage(
          error.message ||
          'Failed to load examination result.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [attemptId]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="container py-5 flex-grow-1">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: '60vh' }}
        >
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          ></div>

          <h6 className="fw-semibold">
            Loading your result...
          </h6>

          <small className="text-muted">
            Fetching your examination result
          </small>
        </div>
      </main>
    );
  }

  /*
   * ERROR
   */
  if (errorMessage || !result) {
    return (
      <main className="container py-5 flex-grow-1">
        <div
          className="card border-0 shadow-sm rounded-4 text-center p-5 mx-auto"
          style={{ maxWidth: '600px' }}
        >
          <i
            className="fa-solid fa-circle-exclamation text-danger mb-3"
            style={{ fontSize: '55px' }}
          ></i>

          <h4 className="fw-bold">
            Result Not Available
          </h4>

          <p className="text-muted">
            {errorMessage ||
              'We could not find your examination result.'}
          </p>

          <Link
            to="/dashboard"
            className="btn btn-primary fw-semibold px-4"
          >
            <i className="fa-solid fa-house me-2"></i>
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ACTUAL DATABASE VALUES
   */
  const totalQuestions =
    Number(result.totalQuestions || 0);

  const attemptedQuestions =
    Number(result.attemptedQuestions || 0);

  const correctAnswers =
    Number(result.correctAnswers || 0);

  const wrongAnswers =
    Number(result.wrongAnswers || 0);

  const score =
    Number(result.score || 0);

  const percentage =
    Number(result.percentage || 0);

  const unattemptedQuestions = Math.max(
    0,
    totalQuestions - attemptedQuestions
  );

  /*
   * PASS / FAIL
   */
  const PASSING_PERCENTAGE = 40;
  const passed = percentage >= PASSING_PERCENTAGE;

  /*
   * RESULT PAGE
   */
  return (
    <main
      className="container py-5 flex-grow-1"
      style={{ maxWidth: '850px' }}
    >
      {/* RESULT SCORE CARD */}
      <div
        className={`card border-0 text-white rounded-4 p-4 p-md-5 text-center shadow-lg mb-4 ${
          passed ? 'bg-success' : 'bg-danger'
        }`}
      >
        <span
          className={`badge bg-white fw-bold text-uppercase px-3 py-1 mb-2 mx-auto ${
            passed ? 'text-success' : 'text-danger'
          }`}
          style={{ fontSize: '0.75rem' }}
        >
          {passed
            ? 'Exam Completed'
            : 'Exam Completed - Failed'}
        </span>

        <h2 className="display-6 fw-bold mb-1">
          {passed
            ? 'Congratulations! You Passed'
            : 'Better Luck Next Time'}
        </h2>

        <p className="text-white-50 small mb-4">
          {result.examTitle}
        </p>

        <div className="d-inline-flex bg-white text-dark rounded-4 p-4 shadow px-5 mx-auto">
          <div>
            <span
              className={`display-3 fw-bold ${
                passed ? 'text-success' : 'text-danger'
              }`}
            >
              {percentage.toFixed(0)}%
            </span>

            <span className="d-block text-muted small fw-semibold">
              Score: {score} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* METRICS */}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="card border-1 shadow-sm text-center p-3 h-100">
            <span className="text-success fw-bold fs-4">
              <i className="fa-solid fa-circle-check me-1"></i>
              {correctAnswers}
            </span>

            <small className="text-muted fw-semibold d-block">
              Correct
            </small>
          </div>
        </div>

        <div className="col-4">
          <div className="card border-1 shadow-sm text-center p-3 h-100">
            <span className="text-danger fw-bold fs-4">
              <i className="fa-solid fa-circle-xmark me-1"></i>
              {wrongAnswers}
            </span>

            <small className="text-muted fw-semibold d-block">
              Incorrect
            </small>
          </div>
        </div>

        <div className="col-4">
          <div className="card border-1 shadow-sm text-center p-3 h-100">
            <span className="text-secondary fw-bold fs-4">
              {unattemptedQuestions}
            </span>

            <small className="text-muted fw-semibold d-block">
              Unattempted
            </small>
          </div>
        </div>
      </div>

      {/* PERFORMANCE BREAKDOWN */}
      <div className="card border-1 shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="fw-bold text-dark mb-0">
            <i className="fa-solid fa-chart-bar text-primary me-2"></i>
            Examination Performance
          </h6>
        </div>

        <div className="card-body p-4">
          {/* ATTEMPTED */}
          <div className="mb-4">
            <div className="d-flex justify-content-between small fw-semibold mb-1">
              <span>Attempted Questions</span>
              <span className="text-primary">
                {attemptedQuestions} / {totalQuestions}
              </span>
            </div>

            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-primary"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? (attemptedQuestions / totalQuestions) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>

          {/* CORRECT */}
          <div className="mb-4">
            <div className="d-flex justify-content-between small fw-semibold mb-1">
              <span>Correct Answers</span>
              <span className="text-success">
                {correctAnswers} / {totalQuestions}
              </span>
            </div>

            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-success"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? (correctAnswers / totalQuestions) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>

          {/* WRONG */}
          <div className="mb-4">
            <div className="d-flex justify-content-between small fw-semibold mb-1">
              <span>Incorrect Answers</span>
              <span className="text-danger">
                {wrongAnswers} / {totalQuestions}
              </span>
            </div>

            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-danger"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? (wrongAnswers / totalQuestions) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>

          {/* UNATTEMPTED */}
          <div>
            <div className="d-flex justify-content-between small fw-semibold mb-1">
              <span>Unattempted</span>
              <span className="text-secondary">
                {unattemptedQuestions} / {totalQuestions}
              </span>
            </div>

            <div className="progress" style={{ height: '8px' }}>
              <div
                className="progress-bar bg-secondary"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? (unattemptedQuestions / totalQuestions) * 100
                      : 0
                  }%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT INFORMATION */}
      <div className="card border-1 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row g-3 text-center">
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-light">
                <small className="text-muted d-block mb-1">
                  Total Questions
                </small>

                <strong className="fs-5">
                  {totalQuestions}
                </strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-light">
                <small className="text-muted d-block mb-1">
                  Passing Percentage
                </small>

                <strong className="fs-5">
                  {PASSING_PERCENTAGE}%
                </strong>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-light">
                <small className="text-muted d-block mb-1">
                  Final Status
                </small>

                <strong
                  className={`fs-5 ${
                    passed ? 'text-success' : 'text-danger'
                  }`}
                >
                  {passed ? 'PASSED' : 'FAILED'}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
        <Link
          to="/dashboard"
          className="btn btn-outline-secondary fw-semibold w-100 w-sm-auto"
        >
          <i className="fa-solid fa-house me-2"></i>
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
