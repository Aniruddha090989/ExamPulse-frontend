
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api/apiFetch';

const INITIAL_FORM = {
  title: '',
  subjectId: '',
  durationMinutes: '',
  startTime: '',
  endTime: '',
  questionIds: []
};

export default function CreateExamModal({
  show,
  onClose,
  onCreated,
  editExam
}) {
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize the form when the modal opens.
  useEffect(() => {
    if (!show) return;

    if (editExam) {
      setFormData({
        title: editExam.title || '',
        subjectId: editExam.subjectId
          ? String(editExam.subjectId)
          : '',
        durationMinutes: editExam.durationMinutes || '',
        startTime: editExam.startTime
          ? editExam.startTime.slice(0, 16)
          : '',
        endTime: editExam.endTime
          ? editExam.endTime.slice(0, 16)
          : '',
        questionIds: editExam.questions
          ? editExam.questions.map(
              (question) => question.questionId
            )
          : []
      });
    } else {
      setFormData(INITIAL_FORM);
    }

    setErrorMessage('');
  }, [show, editExam]);

  // Load subjects when the modal opens.
  useEffect(() => {
    if (!show) return;

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setErrorMessage('');

        const response = await apiFetch('/api/subjects');

        if (!response.ok) {
          throw new Error('Failed to load subjects');
        }

        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error('Load subjects error:', error);
        setErrorMessage('Failed to load subjects.');
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [show]);

  // Load questions whenever the selected subject changes.
  useEffect(() => {
    if (!formData.subjectId) {
      setQuestions([]);
      return;
    }

    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        setErrorMessage('');

        const response = await apiFetch('/api/admin/questions');

        if (!response.ok) {
          throw new Error('Failed to load questions');
        }

        const data = await response.json();

        const subjectQuestions = data.filter(
          (question) =>
            Number(question.subjectId) ===
            Number(formData.subjectId)
        );

        setQuestions(subjectQuestions);
      } catch (error) {
        console.error('Load questions error:', error);
        setErrorMessage('Failed to load questions.');
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [formData.subjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'subjectId') {
      setFormData((prev) => ({
        ...prev,
        questionIds: []
      }));
    }
  };

  const handleQuestionToggle = (questionId) => {
    setFormData((prev) => {
      const exists = prev.questionIds.includes(questionId);

      return {
        ...prev,
        questionIds: exists
          ? prev.questionIds.filter((id) => id !== questionId)
          : [...prev.questionIds, questionId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Exam title is required.');
      return;
    }

    if (!formData.subjectId) {
      setErrorMessage('Please select a subject.');
      return;
    }

    if (
      !formData.durationMinutes ||
      Number(formData.durationMinutes) < 1
    ) {
      setErrorMessage('Please enter a valid exam duration.');
      return;
    }

    if (formData.questionIds.length === 0) {
      setErrorMessage('Please select at least one question.');
      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        title: formData.title.trim(),
        subjectId: Number(formData.subjectId),
        durationMinutes: Number(formData.durationMinutes),
        questionIds: formData.questionIds,
        startTime: formData.startTime
          ? formData.startTime
          : null,
        endTime: formData.endTime
          ? formData.endTime
          : null
      };

      const url = editExam
        ? `/api/exams/${editExam.examId}`
        : '/api/exams';

      const method = editExam ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
          (editExam
            ? 'Failed to update exam.'
            : 'Failed to create exam.')
        );
      }

      alert(
        editExam
          ? 'Exam updated successfully.'
          : 'Exam created successfully.'
      );

      setFormData(INITIAL_FORM);
      setQuestions([]);

      onClose();

      if (onCreated) {
        onCreated(data);
      }
    } catch (error) {
      console.error(
        editExam ? 'Update exam error:' : 'Create exam error:',
        error
      );

      setErrorMessage(
        error.message || 'Failed to create or update exam.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;

    setFormData(INITIAL_FORM);
    setQuestions([]);
    setErrorMessage('');
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">

            {/* HEADER */}
            <div className="modal-header">
              <div>
                <h5 className="modal-title fw-bold">
                  {editExam
                    ? 'Edit Examination'
                    : 'Create New Examination'}
                </h5>

                <small className="text-muted">
                  {editExam
                    ? 'Update the examination details and selected questions'
                    : 'Configure the examination and select questions'}
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                disabled={saving}
              ></button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div
                className="modal-body"
                style={{
                  maxHeight: '50vh',
                  overflowY: 'auto'
                }}
              >

                {/* ERROR */}
                {errorMessage && (
                  <div className="alert alert-danger py-2 small">
                    {errorMessage}
                  </div>
                )}

                {/* EXAM TITLE */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Exam Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Enter examination title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* SUBJECT AND DURATION */}
                <div className="row g-3 mb-4">
                  <div className="col-md-7">
                    <label className="form-label fw-semibold">
                      Subject
                    </label>

                    <select
                      name="subjectId"
                      className="form-select"
                      value={formData.subjectId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        {loadingSubjects
                          ? 'Loading subjects...'
                          : 'Select Subject'}
                      </option>

                      {subjects.map((subject) => (
                        <option
                          key={subject.subjectId}
                          value={subject.subjectId}
                        >
                          {subject.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-5">
                    <label className="form-label fw-semibold">
                      Duration (Minutes)
                    </label>

                    <input
                      type="number"
                      name="durationMinutes"
                      className="form-control"
                      min="1"
                      placeholder="e.g. 30"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* SCHEDULE */}
                <div
                  className="mb-4 p-3"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '14px',
                    backgroundColor: '#fafbfc'
                  }}
                >
                  <div
                    className="d-flex align-items-center mb-3"
                    style={{ gap: '12px' }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: '#eef2ff',
                        color: '#4f46e5',
                        fontSize: '20px',
                        flexShrink: 0
                      }}
                    >
                      <i className="fa-regular fa-calendar"></i>
                    </div>

                    <div>
                      <h6
                        className="fw-bold mb-0"
                        style={{ color: '#111827' }}
                      >
                        Schedule
                      </h6>

                      <small
                        className="text-muted"
                        style={{ fontSize: '12px' }}
                      >
                        Set when this examination will be available
                      </small>
                    </div>
                  </div>

                  <div className="row g-3">
                    {/* START TIME */}
                    <div className="col-md-6">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      >
                        <i className="fa-regular fa-calendar me-2"></i>
                        Start Date &amp; Time
                      </label>

                      <input
                        type="datetime-local"
                        name="startTime"
                        className="form-control"
                        value={formData.startTime}
                        onChange={handleChange}
                        style={{
                          height: '44px',
                          borderRadius: '9px',
                          paddingRight: '12px'
                        }}
                      />

                      <small
                        className="text-muted d-block mt-1"
                        style={{ fontSize: '11px' }}
                      >
                        When students can start the examination
                      </small>
                    </div>

                    {/* END TIME */}
                    <div className="col-md-6">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          fontSize: '13px',
                          color: '#374151'
                        }}
                      >
                        <i className="fa-regular fa-clock me-2"></i>
                        End Date &amp; Time
                      </label>

                      <input
                        type="datetime-local"
                        name="endTime"
                        className="form-control"
                        value={formData.endTime}
                        onChange={handleChange}
                        style={{
                          height: '44px',
                          borderRadius: '9px',
                          paddingRight: '12px'
                        }}
                      />

                      <small
                        className="text-muted d-block mt-1"
                        style={{ fontSize: '11px' }}
                      >
                        When the examination will close
                      </small>
                    </div>
                  </div>
                </div>

                {/* QUESTIONS */}
                <div className="border rounded-3">
                  <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-0">
                        Select Questions
                      </h6>

                      <small className="text-muted">
                        {formData.questionIds.length} question(s) selected
                      </small>
                    </div>

                    {questions.length > 0 && (
                      <span className="badge bg-primary">
                        {questions.length} Available
                      </span>
                    )}
                  </div>

                  <div
                    className="p-3"
                    style={{
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}
                  >
                    {/* NO SUBJECT */}
                    {!formData.subjectId && (
                      <div className="text-center text-muted py-4">
                        Select a subject to load questions.
                      </div>
                    )}

                    {/* LOADING */}
                    {formData.subjectId && loadingQuestions && (
                      <div className="text-center text-muted py-4">
                        Loading questions...
                      </div>
                    )}

                    {/* NO QUESTIONS */}
                    {formData.subjectId &&
                      !loadingQuestions &&
                      questions.length === 0 && (
                        <div className="text-center text-muted py-4">
                          No questions available for this subject.
                        </div>
                      )}

                    {/* QUESTION LIST */}
                    {!loadingQuestions &&
                      questions.map((question, index) => (
                        <div
                          key={question.questionId}
                          className="border-bottom py-2"
                        >
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`question-${question.questionId}`}
                              checked={formData.questionIds.includes(
                                question.questionId
                              )}
                              onChange={() =>
                                handleQuestionToggle(
                                  question.questionId
                                )
                              }
                            />

                            <label
                              className="form-check-label"
                              htmlFor={`question-${question.questionId}`}
                            >
                              <span className="fw-semibold me-2">
                                Q{index + 1}.
                              </span>

                              {question.question}
                            </label>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary fw-semibold"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {editExam ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i
                        className={`fa-solid ${
                          editExam ? 'fa-save' : 'fa-plus'
                        } me-1`}
                      ></i>

                      {editExam ? 'Update Exam' : 'Create Exam'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
