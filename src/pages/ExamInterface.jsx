import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, getStoredUser } from '../api/apiFetch';

export default function ExamInterface() {
  const navigate = useNavigate();
  const { examId } = useParams();


  const videoRef = useRef(null);
const mediaStreamRef = useRef(null);

const [cameraStatus, setCameraStatus] = useState('connecting');
const [micStatus, setMicStatus] = useState('connecting');
const [mediaError, setMediaError] = useState('');

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [studentName, setStudentName] = useState('');









  useEffect(() => {
  let active = true;
  let stream = null;

  const startMediaMonitoring = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          'Camera and microphone require HTTPS or localhost.'
        );
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!active) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const updateCameraStatus = () => {
        setCameraStatus(
          videoTrack?.readyState === 'live' &&
          videoTrack.enabled &&
          !videoTrack.muted
            ? 'active'
            : 'unavailable'
        );
      };

      const updateMicStatus = () => {
        setMicStatus(
          audioTrack?.readyState === 'live' &&
          audioTrack.enabled &&
          !audioTrack.muted
            ? 'active'
            : 'unavailable'
        );
      };

      updateCameraStatus();
      updateMicStatus();

      videoTrack?.addEventListener('ended', updateCameraStatus);
      videoTrack?.addEventListener('mute', updateCameraStatus);
      videoTrack?.addEventListener('unmute', updateCameraStatus);

      audioTrack?.addEventListener('ended', updateMicStatus);
      audioTrack?.addEventListener('mute', updateMicStatus);
      audioTrack?.addEventListener('unmute', updateMicStatus);

      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (track.kind === 'video') updateCameraStatus();
          if (track.kind === 'audio') updateMicStatus();
        });
      });
    } catch (error) {
      console.error('Media monitoring error:', error);

      if (active) {
        setCameraStatus('unavailable');
        setMicStatus('unavailable');
        setMediaError(
          'Camera or microphone access failed. Allow access in your browser settings and retry.'
        );
      }
    }
  };

  startMediaMonitoring();

  return () => {
    active = false;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      mediaStreamRef.current = null;
    }

    stream?.getTracks().forEach((track) => {
      if (track.readyState !== 'ended') {
        track.stop();
      }
    });
  };
}, []);

  const attemptStartedForExam = useRef(null);

  const getUserId = () => {
    try {
      const user = getStoredUser();
      return user?.userId ?? null;
    } catch (error) {
      console.error('Failed to read logged-in user:', error);
      return null;
    }
  };

  const getStudentName = () => {
    try {
      const user = getStoredUser();

      if (!user) return 'Student';

      return (
        user.name ||
        user.fullName ||
        user.username ||
        user.email ||
        'Student'
      );
    } catch (error) {
      console.error('Failed to read student information:', error);
      return 'Student';
    }
  };

  // LOAD EXAM
  useEffect(() => {
    if (!examId) {
      setErrorMessage('Exam ID is missing.');
      setLoading(false);
      return;
    }

    const loadExam = async () => {
      if (attemptStartedForExam.current === examId) return;

      attemptStartedForExam.current = examId;

      try {
        setLoading(true);
        setErrorMessage('');

        const userId = getUserId();

        if (!userId) {
          setErrorMessage('User session not found. Please login again.');
          setLoading(false);
          return;
        }

        setStudentName(getStudentName());

        // GET EXAM
        const examResponse = await apiFetch(`/api/exams/${examId}`);
        const examData = await examResponse.json();

        if (!examResponse.ok) {
          throw new Error(
            examData.message || 'Failed to load examination.'
          );
        }

        const formattedQuestions = (examData.questions || []).map(
          (question) => ({
            id: question.questionId,
            text: question.question,
            options: (question.choices || []).map((choice) => ({
              id: choice.choiceId,
              text: choice.choice,
            })),
            answer: null,
            marked: false,
          })
        );

        setExam(examData);
        setQuestions(formattedQuestions);

        // START / RESTORE ATTEMPT
        const attemptResponse = await apiFetch(
          `/api/attempts/start?examId=${encodeURIComponent(
            examId
          )}&userId=${encodeURIComponent(userId)}`,
          { method: 'POST' }
        );

        const attemptData = await attemptResponse.json();

        if (!attemptResponse.ok) {
          throw new Error(
            attemptData.message || 'Failed to start examination.'
          );
        }

        setAttemptId(attemptData.attemptId);

        // CALCULATE REMAINING TIME
        const startTime = new Date(attemptData.startAt).getTime();
        const durationMilliseconds =
          Number(examData.durationMinutes || 0) * 60 * 1000;
        const deadline = startTime + durationMilliseconds;
        const remainingMilliseconds = deadline - Date.now();

        const remainingSeconds = Math.max(
          0,
          Math.floor(remainingMilliseconds / 1000)
        );

        setTotalSeconds(remainingSeconds);
      } catch (error) {
        console.error('Exam loading error:', error);
        setErrorMessage(
          error.message || 'Failed to load examination.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  // TIMER
  useEffect(() => {
    if (loading || !exam || !attemptId || submitting) return;

    const timer = setInterval(() => {
      setTotalSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam, attemptId, submitting]);

  // AUTO-SUBMIT WHEN TIME EXPIRES
  useEffect(() => {
    if (
      totalSeconds === 0 &&
      attemptId &&
      !loading &&
      !submitting
    ) {
      handleAutoSubmit();
    }
  }, [totalSeconds, attemptId, loading, submitting]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map((value) => value.toString().padStart(2, '0'))
      .join(':');
  };

  const currentQ = questions[currentIndex];

  // SELECT OPTION AND SAVE ANSWER
  const handleSelectOption = async (choiceId) => {
    if (!currentQ || !attemptId || savingAnswer || submitting) {
      return;
    }

    setQuestions((previousQuestions) => {
      const updated = [...previousQuestions];

      updated[currentIndex] = {
        ...updated[currentIndex],
        answer: choiceId,
      };

      return updated;
    });

    try {
      setSavingAnswer(true);

      const userId = getUserId();

      if (!userId) {
        throw new Error('User session not found.');
      }

      const response = await apiFetch(
        `/api/attempts/${attemptId}/answers?userId=${encodeURIComponent(
          userId
        )}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: currentQ.id,
            choiceId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save answer.');
      }
    } catch (error) {
      console.error('Save answer error:', error);
      setErrorMessage(error.message || 'Failed to save answer.');
    } finally {
      setSavingAnswer(false);
    }
  };

  // CLEAR CHOICE
  const handleClearOption = async () => {
    if (!currentQ || !attemptId) return;
    await handleSelectOption(null);
  };

  // MARK FOR REVIEW
  const handleToggleBookmark = () => {
    setQuestions((previousQuestions) => {
      const updated = [...previousQuestions];

      updated[currentIndex] = {
        ...updated[currentIndex],
        marked: !updated[currentIndex].marked,
      };

      return updated;
    });
  };

  // QUESTION NAVIGATION
  const handleNavigate = (step) => {
    const newIndex = currentIndex + step;

    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
    }
  };

  // SUBMIT EXAM
  const handleSubmit = async () => {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);

      const userId = getUserId();

      if (!userId) {
        throw new Error('User session not found.');
      }

      const response = await apiFetch(
        `/api/attempts/${attemptId}/submit?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to submit examination.'
        );
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Submit exam error:', error);
      setErrorMessage(
        error.message || 'Failed to submit examination.'
      );
      setSubmitting(false);
    }
  };

  // AUTO-SUBMIT
  const handleAutoSubmit = async () => {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);

      const userId = getUserId();

      if (!userId) {
        throw new Error('User session not found.');
      }

      const response = await apiFetch(
        `/api/attempts/${attemptId}/auto-submit?userId=${encodeURIComponent(
          userId
        )}`,
        { method: 'POST' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to auto-submit examination.'
        );
      }

      alert(
        'Time is over. Your examination has been submitted automatically.'
      );

      navigate('/dashboard');
    } catch (error) {
      console.error('Auto submit error:', error);
      setErrorMessage(
        error.message || 'Failed to submit examination.'
      );
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter(
    (question) => question.answer !== null
  ).length;

  const markedCount = questions.filter(
    (question) => question.marked
  ).length;

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
          ></div>
          <h6 className="fw-semibold">Loading examination...</h6>
          <small className="text-muted">
            Preparing your questions
          </small>
        </div>
      </div>
    );
  }

  // ERROR SCREEN
  if (errorMessage && !exam) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
        <div className="card border-0 shadow-sm" style={{ maxWidth: '500px' }}>
          <div className="card-body text-center p-5">
            <i className="fa-solid fa-circle-exclamation text-danger display-5 mb-3"></i>
            <h5 className="fw-bold">Unable to Start Examination</h5>
            <p className="text-muted mb-4">{errorMessage}</p>
            <button className="btn btn-primary" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // NO QUESTIONS
  if (!currentQ) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <h5 className="fw-bold">No questions found</h5>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column user-select-none">
      {/* TOP HEADER */}
      <header className="bg-dark text-white px-4 py-2 shadow">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-primary fs-6 font-monospace">
              EXAM-{exam.examId}
            </span>
            <h6 className="mb-0 fw-bold d-none d-md-block">
              {exam.title}
            </h6>
          </div>

          <div className="d-flex align-items-center gap-4">
            {/* TIMER */}
            <div
              className={`d-flex align-items-center gap-2 px-3 py-1 rounded-3 border ${
                totalSeconds <= 300
                  ? 'bg-danger bg-opacity-25 border-danger'
                  : 'bg-secondary bg-opacity-50 border-secondary'
              }`}
            >
              <i
                className={`fa-solid fa-stopwatch ${
                  totalSeconds <= 300 ? 'text-danger' : 'text-warning'
                }`}
              ></i>
              <span className="small text-uppercase text-secondary-subtle fw-semibold">
                Time Left:
              </span>
              <span
                className={`fw-bold font-monospace fs-5 ${
                  totalSeconds <= 300 ? 'text-danger' : 'text-warning'
                }`}
              >
                {formatTime(totalSeconds)}
              </span>
            </div>

            {/* STUDENT */}
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="fa-solid fa-user text-white"></i>
              </div>
              <div className="d-flex flex-column">
                <span
                  className="text-white fw-semibold"
                  style={{ fontSize: '14px' }}
                >
                  {studentName || 'Student'}
                </span>
                <span
                  className="text-secondary"
                  style={{ fontSize: '11px' }}
                >
                  Student
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="alert alert-danger rounded-0 mb-0 py-2 text-center small">
          {errorMessage}
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="container-fluid flex-grow-1 py-3 px-lg-4">
        <div className="row g-3">
          {/* QUESTION AREA */}
          <div className="col-lg-8 col-xl-9">
            <div className="card border-1 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-primary">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <button
                  className={`btn btn-sm fw-semibold ${
                    currentQ.marked
                      ? 'btn-warning text-dark'
                      : 'btn-outline-warning text-dark'
                  }`}
                  onClick={handleToggleBookmark}
                >
                  <i className="fa-regular fa-bookmark me-1"></i>
                  {currentQ.marked ? 'Marked' : 'Mark for Review'}
                </button>
              </div>

              <div className="card-body p-4">
                <h5 className="fw-bold text-dark mb-4">
                  {currentQ.text}
                </h5>

                <div className="d-flex flex-column gap-3">
                  {currentQ.options.map((option, idx) => {
                    const isChecked = currentQ.answer === option.id;

                    return (
                      <label
                        key={option.id}
                        className={`form-check p-3 border rounded-3 d-flex align-items-center gap-3 ${
                          isChecked
                            ? 'bg-primary-subtle border-primary fw-bold text-primary'
                            : 'bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          className="form-check-input"
                          type="radio"
                          name={`question-${currentQ.id}`}
                          checked={isChecked}
                          onChange={() => handleSelectOption(option.id)}
                        />
                        <span>
                          {String.fromCharCode(65 + idx)}. {option.text}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {savingAnswer && (
                  <div className="text-muted small mt-3">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving answer...
                  </div>
                )}
              </div>

              <div className="card-footer bg-white py-3 d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm fw-semibold"
                  onClick={handleClearOption}
                  disabled={currentQ.answer === null || savingAnswer}
                >
                  Clear Choice
                </button>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary fw-semibold px-4"
                    disabled={currentIndex === 0}
                    onClick={() => handleNavigate(-1)}
                  >
                    <i className="fa-solid fa-chevron-left me-1"></i>
                    Prev
                  </button>

                  <button
                    className="btn btn-primary fw-bold px-4"
                    disabled={
                      currentIndex === questions.length - 1 ||
                      savingAnswer
                    }
                    onClick={() => handleNavigate(1)}
                  >
                    Save &amp; Next
                    <i className="fa-solid fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-lg-4 col-xl-3">
            {/* LIVE WEBCAM AND MICROPHONE MONITORING */}

<div className="card border-0 shadow-sm mb-3 overflow-hidden">

  <div className="card-header bg-dark text-white py-2 d-flex justify-content-between align-items-center">
    <span className="fw-bold small">
      <i className="fa-solid fa-shield-halved me-2"></i>
      Exam Monitoring
    </span>

    <span className="badge bg-danger">
      <span className="spinner-grow spinner-grow-sm me-1"></span>
      LIVE
    </span>
  </div>

  {/* LIVE CAMERA FEED */}

  <div
    className="position-relative bg-black"
    style={{ minHeight: '180px' }}
  >
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-100 d-block"
      style={{
        height: '180px',
        objectFit: 'cover',
        transform: 'scaleX(-1)',
      }}
    />

    {cameraStatus !== 'active' && (
      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white text-center p-3">
        <i className="fa-solid fa-video-slash fs-2 mb-2"></i>

        <small>
          {cameraStatus === 'connecting'
            ? 'Connecting to camera...'
            : 'Camera unavailable'}
        </small>
      </div>
    )}

    <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75">
      <i className="fa-solid fa-video me-1"></i>
      Webcam
    </span>
  </div>

  {/* DEVICE STATUS */}

  <div className="card-body p-3">

    <div className="d-flex justify-content-between align-items-center mb-3">
      <span className="small text-dark">
        <i className="fa-solid fa-camera me-2 text-secondary"></i>
        Camera
      </span>

      <span
        className={`badge ${
          cameraStatus === 'active'
            ? 'bg-success'
            : cameraStatus === 'connecting'
            ? 'bg-secondary'
            : 'bg-danger'
        }`}
      >
        <i
          className={`fa-solid ${
            cameraStatus === 'active'
              ? 'fa-circle-check'
              : cameraStatus === 'connecting'
              ? 'fa-clock'
              : 'fa-circle-xmark'
          } me-1`}
        ></i>

        {cameraStatus === 'active'
          ? 'Active'
          : cameraStatus === 'connecting'
          ? 'Connecting'
          : 'Unavailable'}
      </span>
    </div>

    <div className="d-flex justify-content-between align-items-center">
      <span className="small text-dark">
        <i className="fa-solid fa-microphone me-2 text-secondary"></i>
        Microphone
      </span>

      <span
        className={`badge ${
          micStatus === 'active'
            ? 'bg-success'
            : micStatus === 'connecting'
            ? 'bg-secondary'
            : 'bg-danger'
        }`}
      >
        <i
          className={`fa-solid ${
            micStatus === 'active'
              ? 'fa-circle-check'
              : micStatus === 'connecting'
              ? 'fa-clock'
              : 'fa-circle-xmark'
          } me-1`}
        ></i>

        {micStatus === 'active'
          ? 'Active'
          : micStatus === 'connecting'
          ? 'Connecting'
          : 'Unavailable'}
      </span>
    </div>

    {mediaError && (
      <div className="alert alert-warning small mt-3 mb-0 py-2">
        {mediaError}

        <button
          type="button"
          className="btn btn-sm btn-outline-dark w-100 mt-2"
          onClick={() => window.location.reload()}
        >
          Retry Device Access
        </button>
      </div>
    )}

  </div>
</div>

            {/* QUESTION PALETTE */}
            <div className="card border-1 shadow-sm">
              <div className="card-header bg-white py-2 fw-bold text-dark small">
                Question Palette
              </div>

              <div className="card-body p-3">
                <div
                  className="d-grid gap-2"
                  style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}
                >
                  {questions.map((question, idx) => {
                    let btnClass = 'btn-outline-secondary';

                    if (idx === currentIndex) {
                      btnClass = 'btn-primary';
                    } else if (question.marked) {
                      btnClass = 'btn-warning text-dark';
                    } else if (question.answer !== null) {
                      btnClass = 'btn-success';
                    }

                    return (
                      <button
                        key={question.id}
                        className={`btn btn-sm fw-bold ${btnClass}`}
                        onClick={() => setCurrentIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* LEGEND */}
                <div className="border-top pt-3 mt-3">
                  <div className="d-flex justify-content-between text-muted small mb-2">
                    <span>
                      <i className="fa-solid fa-circle text-success me-1"></i>
                      Answered
                    </span>
                    <span>
                      <i className="fa-solid fa-circle text-warning me-1"></i>
                      Marked
                    </span>
                  </div>

                  <div className="d-flex justify-content-between text-muted small">
                    <span>
                      <i className="fa-solid fa-circle text-primary me-1"></i>
                      Current
                    </span>
                    <span>
                      <i className="fa-solid fa-circle text-secondary me-1"></i>
                      Unvisited
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="mt-3">
              <button
                type="button"
                className="btn btn-danger fw-bold w-100 py-2 shadow-sm"
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
              >
                <i className="fa-solid fa-paper-plane me-2"></i>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  Submit Examination?
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                ></button>
              </div>

              <div className="modal-body text-center py-4">
                <p className="text-muted small mb-3">
                  Are you sure you want to finalize your exam submission?
                </p>

                <div className="row g-2 bg-light p-3 rounded-3 text-start small mb-3 border">
                  <div className="col-6">
                    Answered:{' '}
                    <strong className="text-success">
                      {answeredCount}
                    </strong>{' '}
                    / {questions.length}
                  </div>

                  <div className="col-6">
                    Marked for Review:{' '}
                    <strong className="text-warning">
                      {markedCount}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light fw-semibold flex-grow-1"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                >
                  Resume Test
                </button>

                <button
                  type="button"
                  className="btn btn-primary fw-bold flex-grow-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    'Confirm Submit'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}