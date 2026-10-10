import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/apiFetch';

export default function ExamSelection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await apiFetch('/api/exams/available');

        if (!response.ok) {
          throw new Error('Failed to load examinations');
        }

        const data = await response.json();

        const formattedExams = data.map((exam, index) => ({
          id: exam.examId,
          code: `EX-${String(exam.examId).padStart(3, '0')}`,
          badgeClass:
            index % 3 === 0
              ? 'bg-primary-subtle text-primary border-primary-subtle'
              : index % 3 === 1
              ? 'bg-success-subtle text-success border-success-subtle'
              : 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
          duration: `${exam.durationMinutes} Mins`,
          title: exam.title,
          description: `${exam.subjectName} examination`,
          mcqs: `${exam.totalQuestions} MCQs`,
          tagIcon: 'fa-shield-halved',
          tagText: 'AI Proctored',
          tagColor: 'text-success',
          btnClass:
            index === 0 ? 'btn-primary' : 'btn-outline-primary',
          btnText:
            index === 0
              ? 'Select & View Instructions'
              : 'Select Practice Test'
        }));

        setExamData(formattedExams);
      } catch (error) {
        console.error('Error loading exams:', error);
        setError('Failed to load examinations.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredExams = examData.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container py-4 flex-grow-1">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            Available Examination Catalog
          </h3>

          <p className="text-muted small mb-0">
            Select an assessment to review details and begin hardware check
          </p>
        </div>

        <div className="input-group" style={{ maxWidth: '360px' }}>
          <span className="input-group-text bg-white text-muted border-end-0">
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>

          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by title or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-5 text-muted">
          Loading examinations...
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="text-center py-5 text-danger">
          {error}
        </div>
      )}

      {/* CATALOG CARDS */}
      {!loading && !error && (
        <div className="row g-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-1 shadow-sm">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className={`badge border fw-bold ${exam.badgeClass}`}
                    >
                      {exam.code}
                    </span>

                    <small className="text-muted">
                      <i className="fa-regular fa-clock me-1"></i>
                      {exam.duration}
                    </small>
                  </div>

                  <h5 className="fw-bold text-dark">
                    {exam.title}
                  </h5>

                  <p className="text-muted small flex-grow-1">
                    {exam.description}
                  </p>

                  <div className="bg-light p-2.5 rounded-3 mb-3 d-flex justify-content-between text-xs text-muted">
                    <span>
                      <i className="fa-solid fa-list-check me-1"></i>
                      {exam.mcqs}
                    </span>

                    <span className={exam.tagColor}>
                      <i
                        className={`fa-solid ${exam.tagIcon} me-1`}
                      ></i>
                      {exam.tagText}
                    </span>
                  </div>

                  <Link
                    to={`/instructions/${exam.id}`}
                    className={`btn ${exam.btnClass} w-100 fw-bold`}
                  >
                    {exam.btnText}
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="col-12 text-center py-5 text-muted">
              No examinations found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </main>
  );
}