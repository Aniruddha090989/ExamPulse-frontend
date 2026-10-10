import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';
import ConfirmDialog from '../components/ConfirmDialog';
import { notifyToast } from '../components/ToastProvider';


// Read the JWT token saved by Login.jsx

const getAuthHeaders = () => {

  let storedUser = null;

  try {
    const userData =
      localStorage.getItem('user') ||
      sessionStorage.getItem('user');

    storedUser = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Unable to read the stored login session:', error);
  }

  const token = storedUser?.token;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};


const INITIAL_FORM_STATE = {
  id: null,
  subjectId: '',
  subjectName: '',
  //difficulty: 'Easy',
  text: '',
  options: ['', '', '', ''],
  correct: 0
};


export default function QuestionManagement() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [filterSubject, setFilterSubject] = useState('ALL');
  //const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionPendingDelete, setQuestionPendingDelete] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================
  // FETCH SUBJECTS FROM DATABASE
  // ============================================================

  useEffect(() => {
    apiFetch('/api/subjects', {
      headers: getAuthHeaders()
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }

        return response.json();
      })
      .then((data) => {
        setSubjects(data);

        // Select first subject automatically
        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            subjectId: data[0].subjectId,
            subjectName: data[0].subjectName
          }));
        }
      })
      .catch((error) => {
        console.error('Error fetching subjects:', error);
      })
      .finally(() => {
        setLoadingSubjects(false);
      });
  }, []);

  // ============================================================
  // FETCH QUESTIONS FROM DATABASE
  // ============================================================

  useEffect(() => {
    apiFetch('/api/admin/questions', {
      headers: getAuthHeaders()
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        return response.json();
      })
      .then((data) => {
        const formattedQuestions = data.map((question) => ({
          // FIXED: backend returns questionId
          questionId: question.questionId,
          subject: question.subjectName,
          subjectId: question.subjectId,
          //difficulty: 'Easy',
          text: question.question,

          options: question.choices.map(
            (choice) => choice.choice
          ),

          correct: question.choices.findIndex(
            (choice) => choice.isCorrect
          )
        }));

        setQuestions(formattedQuestions);
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      })
      .finally(() => {
        setLoadingQuestions(false);
      });
  }, []);

  // ============================================================
  // FILTER QUESTIONS
  // ============================================================

  const filteredQuestions = questions.filter((q) => {
    const matchesSubj =
      filterSubject === 'ALL' ||
      q.subjectId?.toString() === filterSubject;

    // const matchesDiff =
    //   filterDifficulty === 'ALL' ||
    //   q.difficulty === filterDifficulty;

    const matchesKeyword =
      q.text
        ?.toLowerCase()
        .includes(searchKeyword.toLowerCase());

    return matchesSubj && matchesKeyword;
  });

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const handleOpenAddModal = () => {
    setErrorMessage('');

    const firstSubject =
      subjects.length > 0
        ? subjects[0]
        : null;

    setFormData({
      ...INITIAL_FORM_STATE,
      subjectId: firstSubject?.subjectId || '',
      subjectName: firstSubject?.subjectName || ''
    });

    setIsModalOpen(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const handleOpenEditModal = (q) => {
    setFormData({
      id: q.questionId,
      subjectId: q.subjectId,
      subjectName: q.subject,
      //difficulty: q.difficulty,
      text: q.text,
      options: [...q.options],
      correct: q.correct
    });

    setErrorMessage('');
    setIsModalOpen(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage('');
  };

  // ============================================================
  // SUBJECT CHANGE
  // ============================================================

  const handleSubjectChange = (e) => {
    const selectedId = Number(e.target.value);

    const selectedSubject = subjects.find(
      (subject) => subject.subjectId === selectedId
    );

    setFormData({
      ...formData,
      subjectId: selectedId,
      subjectName: selectedSubject?.subjectName || ''
    });
  };

  // ============================================================
  // OPTION CHANGE
  // ============================================================

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];

    newOptions[index] = value;

    setFormData({
      ...formData,
      options: newOptions
    });
  };

  // ============================================================
  // SAVE QUESTION TO DATABASE
  // ============================================================

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    // -------------------------------
    // Validation
    // -------------------------------

    if (!formData.subjectId) {
      setErrorMessage('Please select a subject.');
      return;
    }

    if (!formData.text.trim()) {
      setErrorMessage('Please enter the question.');
      return;
    }

    if (formData.options.some((option) => !option.trim())) {
      setErrorMessage('Please fill all four answer options.');
      return;
    }

    if (
      formData.correct < 0 ||
      formData.correct >= formData.options.length
    ) {
      setErrorMessage('Please select the correct answer.');
      return;
    }

    try {
      setSavingQuestion(true);

      const requestBody = {
        question: formData.text.trim(),
        type: 'MCQ',
        subjectId: Number(formData.subjectId),

        choices: formData.options.map(
          (option) => option.trim()
        ),

        correctIndexes: [formData.correct]
      };

      console.log(
        formData.id
          ? 'Updating question:'
          : 'Creating question:',
        requestBody
      );

      // ==================================================
      // EDIT EXISTING QUESTION
      // ==================================================

      if (formData.id !== null) {
        const response = await apiFetch(
          `/api/admin/questions/${formData.id}`,
          {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText || 'Failed to update question'
          );
        }

        const updatedQuestion = await response.json();

        console.log(
          'Question updated successfully:',
          updatedQuestion
        );

        // Update the existing question in UI
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.questionId === formData.id
              ? {
                  questionId: updatedQuestion.questionId,
                  subject: updatedQuestion.subjectName,
                  subjectId: updatedQuestion.subjectId,
                  //difficulty: formData.difficulty,
                  text: updatedQuestion.question,

                  options: updatedQuestion.choices.map(
                    (choice) => choice.choice
                  ),

                  correct: formData.correct
                }
              : question
          )
        );

        setIsModalOpen(false);

        setFormData({
          ...INITIAL_FORM_STATE,
          subjectId: subjects[0]?.subjectId || '',
          subjectName: subjects[0]?.subjectName || ''
        });

        alert('Question updated successfully.');

        return;
      }

      // ==================================================
      // ADD NEW QUESTION
      // ==================================================

      const response = await apiFetch(
        '/api/admin/questions',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText || 'Failed to save question'
        );
      }

      const savedQuestion = await response.json();

      console.log(
        'Question saved successfully:',
        savedQuestion
      );

      const newQuestion = {
        questionId: savedQuestion.questionId,
        subject: savedQuestion.subjectName,
        subjectId: savedQuestion.subjectId,
        //difficulty: formData.difficulty,
        text: savedQuestion.question,

        options: savedQuestion.choices.map(
          (choice) => choice.choice
        ),

        correct: formData.correct
      };

      setQuestions((prevQuestions) => [
        ...prevQuestions,
        newQuestion
      ]);

      setIsModalOpen(false);

      setFormData({
        ...INITIAL_FORM_STATE,
        subjectId: subjects[0]?.subjectId || '',
        subjectName: subjects[0]?.subjectName || ''
      });

      alert('Question saved successfully.');

    } catch (error) {
      console.error(
        'Error saving/updating question:',
        error
      );

      setErrorMessage(
        error.message ||
        'Failed to save question.'
      );

    } finally {
      setSavingQuestion(false);
    }
  };

  // ============================================================
  // DELETE QUESTION
  // ============================================================

  const handleDeleteQuestion = (id) => setQuestionPendingDelete(id);

  const confirmDeleteQuestion = async () => {
    const id = questionPendingDelete;
    if (id == null) return;
    setDeletingQuestion(true);

    try {
      const response = await apiFetch(
        `/api/admin/questions/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setQuestions((prevQuestions) =>
        prevQuestions.filter(
          (question) => question.questionId !== id
        )
      );
      setQuestionPendingDelete(null);
      notifyToast('Question deleted successfully.', 'success');

    } catch (error) {
      console.error(
        'Error deleting question:',
        error
      );

      notifyToast('Failed to delete question.', 'error');
    } finally {
      setDeletingQuestion(false);
    }
  };

  return (
    <main className="container-fluid px-lg-4 py-4 flex-grow-1">
      <ConfirmDialog
        show={questionPendingDelete != null}
        title="Delete question?"
        message={questionPendingDelete != null ? `Are you sure you want to delete Question #${questionPendingDelete}?` : ''}
        loading={deletingQuestion}
        onCancel={() => setQuestionPendingDelete(null)}
        onConfirm={confirmDeleteQuestion}
      />

      {/* =====================================================
          HEADER & ACTION BAR
          ===================================================== */}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

        <div>

          <nav aria-label="breadcrumb">

            <ol className="breadcrumb mb-1 small">

              <li className="breadcrumb-item">

                <Link
                  to="/examiner-dashboard"
                  className="text-decoration-none"
                >
                  Dashboard
                </Link>

              </li>

              <li className="breadcrumb-item active">
                Question Management
              </li>

            </ol>

          </nav>

          <h3 className="fw-bold text-dark mb-0">
            Question Bank Repository
          </h3>

        </div>

        <button
          className="btn btn-primary fw-bold shadow-sm"
          onClick={handleOpenAddModal}
        >
          <i className="fa-solid fa-plus me-1"></i>
          Add New Question
        </button>

      </div>

      {/* =====================================================
          SEARCH & FILTER BAR
          ===================================================== */}

      <div className="card border-1 shadow-sm mb-4">

        <div className="card-body p-3">

          <div className="row g-3">

            {/* SUBJECT FILTER */}

            <div className="col-md-4">

              <label className="form-label text-muted small fw-bold mb-1">
                Filter by Subject
              </label>

              <select
                className="form-select form-select-sm"
                value={filterSubject}
                onChange={(e) =>
                  setFilterSubject(e.target.value)
                }
              >

                <option value="ALL">
                  All Subjects
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

            {/* DIFFICULTY FILTER */}

            {/* <div className="col-md-3">

              <label className="form-label text-muted small fw-bold mb-1">
                Filter by Difficulty
              </label>

              <select
                className="form-select form-select-sm"
                value={filterDifficulty}
                onChange={(e) =>
                  setFilterDifficulty(e.target.value)
                }
              >

                <option value="ALL">
                  All Levels
                </option>

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>

            </div> */}

            {/* SEARCH */}

            <div className="col-md-5">

              <label className="form-label text-muted small fw-bold mb-1">
                Search Keywords
              </label>

              <div className="input-group input-group-sm">

                <span className="input-group-text bg-light">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search question text..."
                  value={searchKeyword}
                  onChange={(e) =>
                    setSearchKeyword(e.target.value)
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          QUESTIONS LIST
          ===================================================== */}

      <div className="d-flex flex-column gap-3">

        {loadingQuestions ? (

          <div className="card p-5 text-center text-muted">

            <div
              className="spinner-border text-primary mb-3"
              role="status"
            ></div>

            <p className="mb-0">
              Loading questions...
            </p>

          </div>

        ) : filteredQuestions.length === 0 ? (

          <div className="card p-5 text-center text-muted">

            <i className="fa-solid fa-folder-open fs-1 mb-2"></i>

            <p className="mb-0">
              No questions found matching your criteria.
            </p>

          </div>

        ) : (

          filteredQuestions.map((q, index) => {

            const diffColor =
              q.difficulty === 'Easy'
                ? 'success'
                : q.difficulty === 'Medium'
                  ? 'warning'
                  : 'danger';

            return (

              <div
                key={q.questionId}
                className="card border-1 shadow-sm"
              >

                <div className="card-body p-4">

                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">

                    <div className="d-flex align-items-center gap-2">

                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">
                        {q.subject}
                      </span>

                      <span
                        className={`badge bg-${diffColor}-subtle text-${diffColor} border border-${diffColor}-subtle fw-bold`}
                      >
                        {q.difficulty}
                      </span>

                      {/* FIXED QID */}

                      <span className="text-muted small">
                        QID: #{q.questionId}
                      </span>

                    </div>

                    <div className="d-flex gap-1">

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() =>
                          handleOpenEditModal(q)
                        }
                        title="Edit Question"
                      >
                        <i className="fa-solid fa-pen-to-square me-1"></i>
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          handleDeleteQuestion(q.questionId)
                        }
                        title="Delete Question"
                      >
                        <i className="fa-solid fa-trash me-1"></i>
                        Delete
                      </button>

                    </div>

                  </div>

                  <h6 className="fw-bold text-dark mb-3">
                    {index + 1}. {q.text}
                  </h6>

                  <div className="row g-2">

                    {q.options.map((opt, i) => {

                      const isCorrect =
                        i === q.correct;

                      return (

                        <div
                          key={i}
                          className="col-md-6"
                        >

                          <div
                            className={`p-2 rounded-3 border small d-flex align-items-center gap-2 ${
                              isCorrect
                                ? 'bg-success-subtle border-success fw-semibold'
                                : 'bg-white'
                            }`}
                          >

                            <span
                              className={`badge ${
                                isCorrect
                                  ? 'bg-success text-white'
                                  : 'bg-light text-dark border'
                              } fw-bold`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>

                            <span className="text-dark">
                              {opt}
                            </span>

                            {isCorrect && (
                              <i className="fa-solid fa-circle-check text-success ms-auto"></i>
                            )}

                          </div>

                        </div>

                      );

                    })}

                  </div>

                </div>

              </div>

            );

          })

        )}

      </div>

      {/* =====================================================
          ADD / EDIT QUESTION MODAL
          ===================================================== */}

      {isModalOpen && (

        <>

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >

            <div className="modal-dialog modal-lg modal-dialog-centered">

              <div className="modal-content border-0 rounded-4 shadow">

                {/* MODAL HEADER */}

                <div className="modal-header border-bottom py-3">

                  <h5 className="modal-title fw-bold text-dark">

                    <i className="fa-solid fa-pen-to-square text-primary me-2"></i>

                    {formData.id
                      ? `Edit Question #${formData.id}`
                      : 'Add New Question'}

                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>

                </div>

                {/* FORM */}

                <form onSubmit={handleSaveQuestion}>

                  <div className="modal-body p-4">

                    {/* ERROR */}

                    {errorMessage && (

                      <div className="alert alert-danger py-2">

                        <i className="fa-solid fa-circle-exclamation me-2"></i>

                        {errorMessage}

                      </div>

                    )}

                    {/* SUBJECT + DIFFICULTY */}

                    <div className="row g-3 mb-3">

                      <div className="col-md-6">

                        <label className="form-label fw-semibold small text-dark">
                          Subject
                        </label>

                        <select
                          className="form-select"
                          value={formData.subjectId}
                          onChange={handleSubjectChange}
                          required
                          disabled={loadingSubjects}
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

                      {/* <div className="col-md-6">

                        <label className="form-label fw-semibold small text-dark">
                          Difficulty Level
                        </label>

                        <select
                          className="form-select"
                          value={formData.difficulty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              difficulty: e.target.value
                            })
                          }
                          required
                        >

                          <option value="Easy">
                            Easy
                          </option>

                          <option value="Medium">
                            Medium
                          </option>

                          <option value="Hard">
                            Hard
                          </option>

                        </select>

                      </div> */}

                    </div>

                    {/* QUESTION TEXT */}

                    <div className="mb-3">

                      <label className="form-label fw-semibold small text-dark">
                        Question Statement
                      </label>

                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Enter the complete question..."
                        value={formData.text}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            text: e.target.value
                          })
                        }
                        required
                      ></textarea>

                    </div>

                    {/* OPTIONS */}

                    <label className="form-label fw-semibold small text-dark mb-2">
                      Answer Options & Correct Key
                    </label>

                    <div className="d-flex flex-column gap-2 mb-3">

                      {formData.options.map(
                        (optText, i) => (

                          <div
                            key={i}
                            className="input-group"
                          >

                            <span className="input-group-text fw-bold">
                              {String.fromCharCode(65 + i)}
                            </span>

                            <input
                              type="text"
                              className="form-control"
                              placeholder={`Option ${String.fromCharCode(65 + i)} text`}
                              value={optText}
                              onChange={(e) =>
                                handleOptionChange(
                                  i,
                                  e.target.value
                                )
                              }
                              required
                            />

                            <div className="input-group-text bg-white">

                              <input
                                className="form-check-input mt-0"
                                type="radio"
                                name="correctOpt"
                                checked={
                                  formData.correct === i
                                }
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    correct: i
                                  })
                                }
                                id={`radioOpt${i}`}
                                required
                              />

                              <label
                                className="ms-1 small fw-semibold"
                                htmlFor={`radioOpt${i}`}
                              >
                                Correct
                              </label>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                  {/* MODAL FOOTER */}

                  <div className="modal-footer border-top py-2">

                    <button
                      type="button"
                      className="btn btn-light fw-semibold"
                      onClick={handleCloseModal}
                      disabled={savingQuestion}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary fw-bold"
                      disabled={savingQuestion}
                    >

                      {savingQuestion ? (

                        <>

                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>

                          Saving...

                        </>

                      ) : (

                        <>

                          <i className="fa-solid fa-floppy-disk me-1"></i>
                          Save Question

                        </>

                      )}

                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

          <div
            className="modal-backdrop fade show"
            onClick={handleCloseModal}
          ></div>

        </>

      )}

    </main>
  );
}