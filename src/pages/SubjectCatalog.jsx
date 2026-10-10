import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';
import ConfirmDialog from '../components/ConfirmDialog';
import { notifyToast } from '../components/ToastProvider';

export default function SubjectCatalog() {
  // SUBJECTS
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ADD SUBJECT
  const [showAddModal, setShowAddModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    subjectName: '',
    category: '',
  });
  const [addingSubject, setAddingSubject] = useState(false);
  const [addError, setAddError] = useState('');

  // DELETE SUBJECT
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);
  const [subjectPendingDelete, setSubjectPendingDelete] = useState(null);

  // FETCH SUBJECTS
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiFetch('/api/subjects');

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Unable to load subjects from the database.');
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    fetchSubjects();
  }, []);

  // ADD SUBJECT FORM CHANGE
  const handleSubjectChange = (e) => {
    setSubjectForm({
      ...subjectForm,
      [e.target.name]: e.target.value,
    });
  };

  // OPEN ADD SUBJECT MODAL
  const openAddModal = () => {
    setSubjectForm({
      subjectName: '',
      category: '',
    });

    setAddError('');
    setShowAddModal(true);
  };

  // CLOSE ADD SUBJECT MODAL
  const closeAddModal = () => {
    if (addingSubject) {
      return;
    }

    setShowAddModal(false);
    setAddError('');
  };

  // ADD SUBJECT
  const handleAddSubject = async (e) => {
    e.preventDefault();

    if (!subjectForm.subjectName.trim()) {
      setAddError('Subject name is required.');
      return;
    }

    try {
      setAddingSubject(true);
      setAddError('');

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

      setShowAddModal(false);
      setAddError('');

      await fetchSubjects();

      alert('Subject created successfully.');
    } catch (error) {
      console.error('Error creating subject:', error);

      setAddError(
        'Failed to create subject. Subject name may already exist.'
      );
    } finally {
      setAddingSubject(false);
    }
  };

  // DELETE SUBJECT
  const handleDeleteSubject = (subject) => setSubjectPendingDelete(subject);

  const confirmDeleteSubject = async () => {
    const subject = subjectPendingDelete;
    if (!subject) return;

    try {
      setDeletingSubjectId(subject.subjectId);

      const response = await apiFetch(
        `/api/subjects/${subject.subjectId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        let message = 'Failed to delete subject.';

        try {
          const errorText = await response.text();

          if (errorText) {
            message = errorText;
          }
        } catch {
          // Ignore parsing error.
        }

        throw new Error(message);
      }

      // Refresh database data.
      await fetchSubjects();
      setSubjectPendingDelete(null);
      notifyToast('Subject deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting subject:', error);

      notifyToast(error.message || 'Failed to delete subject.', 'error');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  // FILTER SUBJECTS
  const filteredSubjects = subjects.filter((subject) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      subject.subjectName?.toLowerCase().includes(search) ||
      subject.category?.toLowerCase().includes(search)
    );
  });

  // TOTAL QUESTIONS
  const totalQuestions = subjects.reduce(
    (total, subject) =>
      total + Number(subject.totalQuestions || 0),
    0
  );

  // CATEGORIES
  const categoryCount = new Set(
    subjects
      .map((subject) => subject.category)
      .filter(Boolean)
  ).size;

  // RENDER
  return (
    <main className="container-fluid px-lg-4 py-4 flex-grow-1">
      <ConfirmDialog
        show={Boolean(subjectPendingDelete)}
        title="Delete subject?"
        message={subjectPendingDelete ? `Are you sure you want to delete "${subjectPendingDelete.subjectName}"?\n\nA subject can only be deleted if it has no questions and is not being used by any examination.` : ''}
        loading={Boolean(subjectPendingDelete && deletingSubjectId === subjectPendingDelete.subjectId)}
        onCancel={() => setSubjectPendingDelete(null)}
        onConfirm={confirmDeleteSubject}
      />
      {/* ADD SUBJECT MODAL */}
      {showAddModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              {/* HEADER */}
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className="fa-solid fa-book-medical text-primary me-2"></i>
                  Add New Subject
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeAddModal}
                  disabled={addingSubject}
                ></button>
              </div>

              {/* FORM */}
              <form onSubmit={handleAddSubject}>
                <div className="modal-body">
                  {/* ERROR */}
                  {addError && (
                    <div className="alert alert-danger">
                      <i className="fa-solid fa-circle-exclamation me-2"></i>
                      {addError}
                    </div>
                  )}

                  {/* SUBJECT NAME */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="subjectName"
                    >
                      Subject Name
                    </label>

                    <input
                      id="subjectName"
                      type="text"
                      name="subjectName"
                      className="form-control"
                      placeholder="e.g. Computer Networks"
                      value={subjectForm.subjectName}
                      onChange={handleSubjectChange}
                      disabled={addingSubject}
                      autoFocus
                      required
                    />
                  </div>

                  {/* CATEGORY */}
                  <div className="mb-3">
                    <label
                      className="form-label fw-semibold"
                      htmlFor="subjectCategory"
                    >
                      Category
                    </label>

                    <input
                      id="subjectCategory"
                      type="text"
                      name="category"
                      className="form-control"
                      placeholder="e.g. CSE"
                      value={subjectForm.category}
                      onChange={handleSubjectChange}
                      disabled={addingSubject}
                    />
                  </div>

                  {/* INFORMATION */}
                  <div className="alert alert-light border small mb-0">
                    <i className="fa-solid fa-circle-info text-primary me-2"></i>
                    A new subject starts with
                    <strong className="mx-1">0 questions</strong>
                    and can be used when creating examinations.
                  </div>
                </div>

                {/* FOOTER */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeAddModal}
                    disabled={addingSubject}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary fw-semibold"
                    disabled={addingSubject}
                  >
                    {addingSubject ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Adding...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-plus me-1"></i>
                        Add Subject
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md-7">
          <div className="d-flex align-items-center gap-3">
            <Link
              to="/examiner-dashboard"
              className="btn btn-outline-secondary"
              title="Back to Examiner Dashboard"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </Link>

            <div>
              <h3 className="fw-bold text-dark mb-1">
                Subject Catalog
              </h3>

              <p className="text-muted small mb-0">
                View, add and manage subjects available in the
                examination system.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <div className="d-flex justify-content-md-end gap-2">
            {/* REFRESH */}
            <button
              className="btn btn-outline-secondary"
              onClick={fetchSubjects}
              disabled={loading}
            >
              <i className="fa-solid fa-rotate me-2"></i>
              Refresh
            </button>

            {/* ADD SUBJECT */}
            <button
              className="btn btn-primary fw-semibold"
              onClick={openAddModal}
            >
              <i className="fa-solid fa-plus me-2"></i>
              Add Subject
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="row g-3 mb-4">
        {/* TOTAL SUBJECTS */}
        <div className="col-sm-6 col-xl-4">
          <div className="card border-1 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">
                  Total Subjects
                </span>

                <h3 className="fw-bold text-dark my-1">
                  {loading ? '...' : subjects.length}
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
        <div className="col-sm-6 col-xl-4">
          <div className="card border-1 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">
                  Total Questions
                </span>

                <h3 className="fw-bold text-dark my-1">
                  {loading ? '...' : totalQuestions}
                </h3>

                <small className="text-muted">
                  Across all subjects
                </small>
              </div>

              <div className="bg-success-subtle text-success p-3 rounded-3 fs-3">
                <i className="fa-solid fa-clipboard-question"></i>
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="col-sm-6 col-xl-4">
          <div className="card border-1 shadow-sm p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">
                  Categories
                </span>

                <h3 className="fw-bold text-dark my-1">
                  {loading ? '...' : categoryCount}
                </h3>

                <small className="text-muted">
                  Subject categories
                </small>
              </div>

              <div className="bg-warning-subtle text-warning-emphasis p-3 rounded-3 fs-3">
                <i className="fa-solid fa-layer-group"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBJECT CATALOG */}
      <div className="card border-1 shadow-sm">
        {/* HEADER */}
        <div className="card-header bg-white py-3">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <h6 className="fw-bold text-dark mb-0">
                <i className="fa-solid fa-book text-primary me-2"></i>
                Available Subjects
              </h6>
            </div>

            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="fa-solid fa-search text-muted"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search subject or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="card-body">
            <div className="alert alert-danger mb-0">
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              {error}

              <button
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={fetchSubjects}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        {!error && (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Subject ID</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}
                {loading && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading...
                        </span>
                      </div>

                      <div className="text-muted mt-2">
                        Loading subjects...
                      </div>
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading && filteredSubjects.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        className="text-muted mb-2"
                        style={{ fontSize: '42px' }}
                      >
                        <i className="fa-solid fa-book-open"></i>
                      </div>

                      <h6 className="fw-bold">
                        {subjects.length === 0
                          ? 'No Subjects Found'
                          : 'No Matching Subjects'}
                      </h6>

                      <p className="text-muted small mb-0">
                        {subjects.length === 0
                          ? 'There are currently no subjects in the database.'
                          : 'Try a different search term.'}
                      </p>
                    </td>
                  </tr>
                )}

                {/* SUBJECT LIST */}
                {!loading &&
                  filteredSubjects.map((subject, index) => (
                    <tr key={subject.subjectId}>
                      {/* NUMBER */}
                      <td className="fw-semibold">{index + 1}</td>

                      {/* SUBJECT */}
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: '42px',
                              height: '42px',
                            }}
                          >
                            <i className="fa-solid fa-book"></i>
                          </div>

                          <div>
                            <div className="fw-bold text-dark">
                              {subject.subjectName}
                            </div>

                            <small className="text-muted">
                              Subject
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        {subject.category ? (
                          <span className="badge bg-light text-dark border">
                            {subject.category}
                          </span>
                        ) : (
                          <span className="text-muted">
                            Not specified
                          </span>
                        )}
                      </td>

                      {/* QUESTIONS */}
                      <td>
                        <span className="fw-semibold">
                          {subject.totalQuestions || 0}
                        </span>

                        <span className="text-muted ms-1">
                          questions
                        </span>
                      </td>

                      {/* SUBJECT ID */}
                      <td>
                        <span className="font-monospace text-muted">
                          #{subject.subjectId}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Delete Subject"
                          disabled={
                            deletingSubjectId === subject.subjectId
                          }
                          onClick={() => handleDeleteSubject(subject)}
                        >
                          {deletingSubjectId === subject.subjectId ? (
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
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* INFORMATION */}
      <div className="mt-3">
        <small className="text-muted">
          <i className="fa-solid fa-shield-halved me-1"></i>
          A subject cannot be deleted while it contains questions
          or is used by an examination.
        </small>
      </div>
    </main>
  );
}