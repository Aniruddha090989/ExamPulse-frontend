import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CreateExamModal from '../components/CreateExamModal';
import { apiFetch } from '../api/apiFetch';
import ConfirmDialog from '../components/ConfirmDialog';
import { notifyToast } from '../components/ToastProvider';

export default function ExaminerDashboard() {
  // CREATE / EDIT EXAM
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [editExam, setEditExam] = useState(null);

  // DASHBOARD DATA
  const [dashboard, setDashboard] = useState({
    managedSubjects: 0,
    totalQuestions: 0,
    activeExams: 0,
    evaluatedStudents: 0,
    exams: [],
  });

  const [loading, setLoading] = useState(true);

  // SUBJECT CREATION
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    subjectName: '',
    category: '',
  });
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectMessage, setSubjectMessage] = useState('');

  // STUDENT RESULTS
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState('');

  // DELETE EXAM
  const [deletingExamId, setDeletingExamId] = useState(null);
  const [examPendingDelete, setExamPendingDelete] = useState(null);

  // FETCH DASHBOARD
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await apiFetch('/api/examiner-dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch examiner dashboard');
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading examiner dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchDashboard();
  }, []);

  // FETCH EXAMS
  const fetchExams = async () => {
    try {
      const response = await apiFetch('/api/examiner-dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch examinations');
      }

      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading examinations:', error);
    }
  };

  // VIEW STUDENT RESULTS
  const handleViewStudentResults = async (exam) => {
    setSelectedExam(exam);
    setShowResultsModal(true);
    setResultsLoading(true);
    setResultsError('');
    setStudentResults([]);

    try {
      const response = await apiFetch(
        `/api/examiner-dashboard/exams/${exam.examId}/results`
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || 'Failed to fetch student results'
        );
      }

      const data = await response.json();
      setStudentResults(data);
    } catch (error) {
      console.error('Error loading student results:', error);

      setResultsError(
        'Unable to load student results. Please try again.'
      );
    } finally {
      setResultsLoading(false);
    }
  };

  // CLOSE RESULTS MODAL
  const closeResultsModal = () => {
    setShowResultsModal(false);
    setSelectedExam(null);
    setStudentResults([]);
    setResultsError('');
  };

  // DELETE EXAM
  const handleDeleteExam = (exam) => setExamPendingDelete(exam);

  const confirmDeleteExam = async () => {
    const exam = examPendingDelete;
    if (!exam) return;

    try {
      setDeletingExamId(exam.examId);

      const response = await apiFetch(
        `/api/exams/${exam.examId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to delete examination.';

        try {
          const errorText = await response.text();

          if (errorText) {
            errorMessage = errorText;
          }
        } catch {
          // Ignore response parsing errors.
        }

        throw new Error(errorMessage);
      }

      // Remove the exam from the current dashboard state.
      setDashboard((prev) => ({
        ...prev,
        exams: prev.exams.filter(
          (item) => item.examId !== exam.examId
        ),
      }));

      // Close the results modal if this exam was selected.
      if (
        selectedExam &&
        selectedExam.examId === exam.examId
      ) {
        closeResultsModal();
      }

      notifyToast('Examination deleted successfully.', 'success');
      setExamPendingDelete(null);

      // Refresh dashboard counters.
      await fetchDashboard();
    } catch (error) {
      console.error('Error deleting examination:', error);

      notifyToast(error.message || 'Failed to delete examination.', 'error');
    } finally {
      setDeletingExamId(null);
    }
  };

  // SUBJECT FORM CHANGE
  const handleSubjectChange = (e) => {
    setSubjectForm({
      ...subjectForm,
      [e.target.name]: e.target.value,
    });
  };

  // CREATE SUBJECT
  const handleCreateSubject = async (e) => {
    e.preventDefault();

    if (!subjectForm.subjectName.trim()) {
      setSubjectMessage('Subject name is required.');
      return;
    }

    try {
      setSubjectLoading(true);
      setSubjectMessage('');

      const response = await apiFetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectName: subjectForm.subjectName.trim(),
          category: subjectForm.category.trim(),
          totalQuestions: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || 'Failed to create subject'
        );
      }

      const newSubject = await response.json();

      console.log('Subject created:', newSubject);

      setSubjectForm({
        subjectName: '',
        category: '',
      });

      setShowSubjectForm(false);
      setSubjectMessage('');

      await fetchDashboard();

      alert('Subject created successfully.');
    } catch (error) {
      console.error('Error creating subject:', error);

      setSubjectMessage(
        'Failed to create subject. Subject name may already exist.'
      );
    } finally {
      setSubjectLoading(false);
    }
  };

  // FORMAT DATE / TIME
  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return '-';
    }

    return new Date(dateTime).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  // EXAM STATUS STYLE
  const getStatusClass = (status) => {
    switch (status) {
      case 'Live / Active':
        return 'badge bg-success-subtle text-success border border-success-subtle';

      case 'Scheduled':
        return 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle';

      case 'Completed':
        return 'badge bg-info-subtle text-info border border-info-subtle';

      default:
        return 'badge bg-secondary-subtle text-secondary border';
    }
  };

  // RENDER
  return (
    <>
      {/* CREATE SUBJECT MODAL */}
      {showSubjectForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="fa-solid fa-book me-2 text-primary"></i>
                  Create New Subject
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowSubjectForm(false);
                    setSubjectMessage('');
                  }}
                ></button>
              </div>

              <form onSubmit={handleCreateSubject}>
                <div
                  className="modal-body"
                  style={{
                    maxHeight: '70vh',
                    overflowY: 'auto',
                  }}
                >
                  {subjectMessage && (
                    <div className="alert alert-danger py-2">
                      {subjectMessage}
                    </div>
                  )}

                  {/* SUBJECT NAME */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Subject Name
                    </label>

                    <input
                      type="text"
                      name="subjectName"
                      className="form-control"
                      placeholder="e.g. Java Programming"
                      value={subjectForm.subjectName}
                      onChange={handleSubjectChange}
                      required
                    />
                  </div>

                  {/* CATEGORY */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Category
                    </label>

                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      placeholder="e.g. Programming"
                      value={subjectForm.category}
                      onChange={handleSubjectChange}
                    />
                  </div>

                  <div className="alert alert-light border small mb-0">
                    <i className="fa-solid fa-circle-info text-primary me-2"></i>
                    New subjects start with{' '}
                    <strong>0 questions</strong>.
                    <br />
                    The question count will increase when questions
                    are added.
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowSubjectForm(false);
                      setSubjectMessage('');
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold"
                    disabled={subjectLoading}
                  >
                    {subjectLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus me-1"></i>
                        Create Subject
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT RESULTS MODAL */}
      {showResultsModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold">
                    <i className="fa-solid fa-chart-pie text-primary me-2"></i>
                    Student Results
                  </h5>

                  {selectedExam && (
                    <div className="text-muted small mt-1">
                      <strong>{selectedExam.title}</strong>
                      <span className="ms-2">
                        EXAM-{selectedExam.examId}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeResultsModal}
                ></button>
              </div>

              <div className="modal-body">
                {/* LOADING */}
                {resultsLoading && (
                  <div className="text-center py-5">
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    >
                      <span className="visually-hidden">
                        Loading...
                      </span>
                    </div>

                    <p className="mt-3 text-muted">
                      Loading student results...
                    </p>
                  </div>
                )}

                {/* ERROR */}
                {!resultsLoading && resultsError && (
                  <div className="alert alert-danger">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>
                    {resultsError}
                  </div>
                )}

                {/* NO RESULTS */}
                {!resultsLoading &&
                  !resultsError &&
                  studentResults.length === 0 && (
                    <div className="text-center py-5">
                      <div
                        className="text-muted"
                        style={{
                          fontSize: '48px',
                        }}
                      >
                        <i className="fa-solid fa-clipboard-x"></i>
                      </div>

                      <h5 className="mt-3 fw-bold">
                        No Student Results
                      </h5>

                      <p className="text-muted mb-0">
                        No student has submitted this examination
                        yet.
                      </p>
                    </div>
                  )}

                {/* RESULTS TABLE */}
                {!resultsLoading &&
                  !resultsError &&
                  studentResults.length > 0 && (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>#</th>
                            <th>Student</th>
                            <th>Email</th>
                            <th className="text-center">
                              Attempted
                            </th>
                            <th className="text-center">
                              Correct
                            </th>
                            <th className="text-center">
                              Wrong
                            </th>
                            <th className="text-center">Score</th>
                            <th className="text-center">
                              Percentage
                            </th>
                            <th>Submitted</th>
                          </tr>
                        </thead>

                        <tbody>
                          {studentResults.map((result, index) => (
                            <tr key={result.resultId}>
                              <td className="fw-semibold">
                                {index + 1}
                              </td>

                              <td>
                                <div className="d-flex align-items-center">
                                  <div
                                    className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                    style={{
                                      width: '38px',
                                      height: '38px',
                                    }}
                                  >
                                    <i className="fa-solid fa-user"></i>
                                  </div>

                                  <div>
                                    <div className="fw-semibold">
                                      {result.studentUsername}
                                    </div>

                                    <small className="text-muted">
                                      ID: {result.studentId}
                                    </small>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <span className="small">
                                  {result.studentEmail}
                                </span>
                              </td>

                              <td className="text-center">
                                <span className="fw-semibold">
                                  {result.attemptedQuestions}/
                                  {result.totalQuestions}
                                </span>
                              </td>

                              <td className="text-center">
                                <span className="badge bg-success">
                                  {result.correctAnswers}
                                </span>
                              </td>

                              <td className="text-center">
                                <span className="badge bg-danger">
                                  {result.wrongAnswers}
                                </span>
                              </td>

                              <td className="text-center">
                                <strong>{result.score}</strong>
                              </td>

                              <td className="text-center">
                                <span
                                  className={
                                    Number(result.percentage) >= 40
                                      ? 'badge bg-success'
                                      : 'badge bg-danger'
                                  }
                                >
                                  {result.percentage}%
                                </span>
                              </td>

                              <td>
                                <small className="text-muted">
                                  {formatDateTime(result.submittedAt)}
                                </small>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>

              <div className="modal-footer">
                {studentResults.length > 0 && (
                  <div className="me-auto text-muted small">
                    <i className="fa-solid fa-users me-1"></i>
                    {studentResults.length}{' '}
                    {studentResults.length === 1
                      ? 'student'
                      : 'students'}{' '}
                    evaluated
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeResultsModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <main className="container-fluid px-lg-4 py-4 flex-grow-1">
        {/* WELCOME & QUICK ACTIONS */}
        <div className="row align-items-center mb-4 g-3">
          <div className="col-md-6">
            <h3 className="fw-bold text-dark mb-1">
              Examiner Control Center
            </h3>

            <p className="text-muted small mb-0">
              Manage course subjects, construct question
              repositories, and publish examinations.
            </p>
          </div>
        </div>

        {/* METRICS */}
        <div className="row g-3 mb-4">
          {/* MANAGED SUBJECTS */}
          <div className="col-sm-6 col-xl-3">
            <div className="card border-1 shadow-sm p-3 hover-lift">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">
                    Managed Subjects
                  </span>

                  <h3 className="fw-bold text-dark my-1">
                    {loading ? '...' : dashboard.managedSubjects}
                  </h3>

                  <small className="text-muted">
                    Subjects in database
                  </small>
                </div>

                <div className="bg-primary-subtle text-primary p-3 rounded-3 fs-3">
                  <i className="fa-solid fa-book-open"></i>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL QUESTIONS */}
          <div className="col-sm-6 col-xl-3">
            <div className="card border-1 shadow-sm p-3 hover-lift">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">
                    Total Questions
                  </span>

                  <h3 className="fw-bold text-dark my-1">
                    {loading ? '...' : dashboard.totalQuestions}
                  </h3>

                  <small className="text-muted">
                    Questions in question bank
                  </small>
                </div>

                <div className="bg-success-subtle text-success p-3 rounded-3 fs-3">
                  <i className="fa-solid fa-clipboard-question"></i>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVE EXAMS */}
          <div className="col-sm-6 col-xl-3">
            <div className="card border-1 shadow-sm p-3 hover-lift">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">
                    Active Exams
                  </span>

                  <h3 className="fw-bold text-dark my-1">
                    {loading ? '...' : dashboard.activeExams}
                  </h3>

                  <small className="text-muted">
                    Currently active
                  </small>
                </div>

                <div className="bg-warning-subtle text-warning-emphasis p-3 rounded-3 fs-3">
                  <i className="fa-solid fa-stopwatch"></i>
                </div>
              </div>
            </div>
          </div>

          {/* EVALUATED STUDENTS */}
          <div className="col-sm-6 col-xl-3">
            <div className="card border-1 shadow-sm p-3 hover-lift">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">
                    Evaluated Students
                  </span>

                  <h3 className="fw-bold text-dark my-1">
                    {loading ? '...' : dashboard.evaluatedStudents}
                  </h3>

                  <small className="text-muted">
                    Students with results
                  </small>
                </div>

                <div className="bg-info-subtle text-info p-3 rounded-3 fs-3">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="row g-4">
          {/* CREATED EXAMINATIONS */}
          <div className="col-lg-8">
            <div className="card border-1 shadow-sm">
              {/* HEADER */}
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">
                  <i className="fa-solid fa-list-check text-primary me-2"></i>
                  Created Examinations &amp; Status
                </h6>

                <button
                  className="btn btn-sm btn-primary fw-semibold"
                  onClick={() => {
                    setEditExam(null);
                    setShowCreateExam(true);
                  }}
                >
                  <i className="fa-solid fa-plus me-1"></i>
                  Create Exam
                </button>
              </div>

              {/* TABLE */}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Exam Title &amp; Code</th>
                      <th>Subject</th>
                      <th>Questions</th>
                      <th>Duration</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="small">
                    {/* LOADING */}
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          <div
                            className="spinner-border spinner-border-sm text-primary me-2"
                            role="status"
                          ></div>
                          Loading examinations...
                        </td>
                      </tr>
                    ) : dashboard.exams.length === 0 ? (
                      /* NO EXAMS */
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-5 text-muted"
                        >
                          <i
                            className="fa-solid fa-folder-open mb-2"
                            style={{
                              fontSize: '32px',
                            }}
                          ></i>

                          <div>No examinations found.</div>
                        </td>
                      </tr>
                    ) : (
                      /* EXAMS */
                      dashboard.exams.map((exam) => (
                        <tr key={exam.examId}>
                          {/* TITLE */}
                          <td>
                            <span className="fw-bold d-block text-dark">
                              {exam.title}
                            </span>

                            <span className="text-muted font-monospace">
                              EXAM-{exam.examId}
                            </span>
                          </td>

                          {/* SUBJECT */}
                          <td>{exam.subjectName}</td>

                          {/* QUESTIONS */}
                          <td>
                            {exam.totalQuestions} MCQs
                          </td>

                          {/* DURATION */}
                          <td>
                            {exam.durationMinutes} Mins
                          </td>

                          {/* STATUS */}
                          <td>
                            <span
                              className={getStatusClass(exam.status)}
                            >
                              {exam.status}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="text-end">
                            {/* EDIT */}
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              title="Edit Exam"
                              disabled={
                                deletingExamId === exam.examId
                              }
                              onClick={() => {
                                setEditExam(exam);
                                setShowCreateExam(true);
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>

                            {/* VIEW STUDENT RESULTS */}
                            <button
                              className="btn btn-sm btn-outline-info me-1"
                              title="View Student Results"
                              disabled={
                                deletingExamId === exam.examId
                              }
                              onClick={() =>
                                handleViewStudentResults(exam)
                              }
                            >
                              <i className="fa-solid fa-chart-pie"></i>
                            </button>

                            {/* DELETE EXAM */}
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Exam"
                              disabled={
                                deletingExamId === exam.examId
                              }
                              onClick={() =>
                                handleDeleteExam(exam)
                              }
                            >
                              {deletingExamId === exam.examId ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                <i className="fa-solid fa-trash"></i>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* QUICK NAVIGATION */}
          <div className="col-lg-4">
            <div className="card border-1 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold text-dark mb-0">
                  <i className="fa-solid fa-bolt text-warning me-2"></i>
                  Quick Navigation
                </h6>
              </div>

              <div className="card-body p-3 d-flex flex-column gap-2">
                {/* QUESTION REPOSITORY */}
                <Link
                  to="/question-management"
                  className="p-3 bg-light rounded-3 text-decoration-none d-flex align-items-center justify-content-between hover-lift"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary text-white rounded-3 p-2">
                      <i className="fa-solid fa-database"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-bold text-dark">
                        Question Repository
                      </h6>

                      <small className="text-muted">
                        Add, update &amp; delete items
                      </small>
                    </div>
                  </div>

                  <i className="fa-solid fa-chevron-right text-muted"></i>
                </Link>

                {/* SUBJECT CATALOG */}
                <Link
                  to="/subject-management"
                  className="p-3 bg-light rounded-3 text-decoration-none d-flex align-items-center justify-content-between hover-lift"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-success text-white rounded-3 p-2">
                      <i className="fa-solid fa-book"></i>
                    </div>

                    <div>
                      <h6 className="mb-0 fw-bold text-dark">
                        Subject Catalog
                      </h6>

                      <small className="text-muted">
                        Manage courses &amp; modules
                      </small>
                    </div>
                  </div>

                  <i className="fa-solid fa-chevron-right text-muted"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ConfirmDialog
          show={Boolean(examPendingDelete)}
          title="Delete examination?"
          message={examPendingDelete ? `Are you sure you want to delete "${examPendingDelete.title}"?\n\nThis will permanently delete the examination, student attempts, results, and exam-question associations.\n\nThe questions themselves will NOT be deleted from the question bank.` : ''}
          loading={Boolean(examPendingDelete && deletingExamId === examPendingDelete.examId)}
          onCancel={() => setExamPendingDelete(null)}
          onConfirm={confirmDeleteExam}
        />

        {/* CREATE / EDIT EXAM MODAL */}
        <CreateExamModal
          show={showCreateExam}
          editExam={editExam}
          onClose={() => {
            setShowCreateExam(false);
            setEditExam(null);
          }}
          onCreated={() => {
            fetchDashboard();
            setEditExam(null);
          }}
        />
      </main>
    </>
  );
}