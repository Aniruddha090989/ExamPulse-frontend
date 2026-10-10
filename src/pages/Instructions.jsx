import React, {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';

import { apiFetch } from '../api/apiFetch';

export default function Instructions() {

  const [systemCheck, setSystemCheck] = useState({
  webcam: 'pending',
  microphone: 'pending',
  network: 'pending',
});

const [checkingSystem, setCheckingSystem] = useState(false);
const [networkSpeed, setNetworkSpeed] = useState(null);
const [systemCheckMessage, setSystemCheckMessage] = useState('');


  const navigate = useNavigate();
  const { examId } = useParams();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);

  /*
   * =========================================================
   * LOAD SELECTED EXAM
   * =========================================================
   */

  useEffect(() => {
    if (!examId) {
      setError('Exam ID is missing.');
      setLoading(false);
      return;
    }

    const loadExam = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch(
          `/api/exams/${examId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to load examination.'
          );
        }

        setExam(data);
      } catch (error) {
        console.error(
          'Instruction page error:',
          error
        );

        setError(
          error.message ||
            'Unable to load examination.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  /*
   * =========================================================
   * ENTER EXAM
   * =========================================================
   */

const runSystemCheck = async () => {
  setCheckingSystem(true);
  setSystemCheckMessage('');
  setNetworkSpeed(null);

  setSystemCheck({
    webcam: 'pending',
    microphone: 'pending',
    network: 'pending',
  });

  // Check camera permission and availability.
  try {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    const cameraAvailable = cameraStream
      .getVideoTracks()
      .some((track) => track.readyState === 'live');

    cameraStream.getTracks().forEach((track) => track.stop());

    setSystemCheck((prev) => ({
      ...prev,
      webcam: cameraAvailable ? 'passed' : 'failed',
    }));
  } catch (error) {
    console.error('Camera verification failed:', error);

    setSystemCheck((prev) => ({
      ...prev,
      webcam: 'failed',
    }));
  }

  // Check microphone permission and availability.
  try {
    const microphoneStream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    const microphoneAvailable = microphoneStream
      .getAudioTracks()
      .some((track) => track.readyState === 'live');

    microphoneStream.getTracks().forEach((track) => track.stop());

    setSystemCheck((prev) => ({
      ...prev,
      microphone: microphoneAvailable ? 'passed' : 'failed',
    }));
  } catch (error) {
    console.error('Microphone verification failed:', error);

    setSystemCheck((prev) => ({
      ...prev,
      microphone: 'failed',
    }));
  }

  // Measure network download speed.
  try {
    const testUrl =
      `https://speed.cloudflare.com/__down?bytes=1000000&t=${Date.now()}`;

    const startTime = performance.now();

    const response = await fetch(testUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Network speed test failed.');
    }

    const data = await response.arrayBuffer();
    const endTime = performance.now();

    if (data.byteLength === 0) {
      throw new Error('No data received during speed test.');
    }

    const durationSeconds = (endTime - startTime) / 1000;

    const speedMbps =
      (data.byteLength * 8) / durationSeconds / 1_000_000;

    setNetworkSpeed(speedMbps);

    // Minimum acceptable download speed: 1 Mbps.
    const networkPassed = speedMbps >= 1;

    setSystemCheck((prev) => ({
      ...prev,
      network: networkPassed ? 'passed' : 'failed',
    }));
  } catch (error) {
    console.error('Network verification failed:', error);

    setSystemCheck((prev) => ({
      ...prev,
      network: 'failed',
    }));

    setSystemCheckMessage(
      'Unable to complete the network speed test. Check your internet connection and try again.'
    );
  } finally {
    setCheckingSystem(false);
  }
};

const allChecksPassed =
  systemCheck.webcam === 'passed' &&
  systemCheck.microphone === 'passed' &&
  systemCheck.network === 'passed';



const handleEnterExam = () => {
  if (!isAgreed || !allChecksPassed || checkingSystem) {
    return;
  }

  navigate(`/exam-interface/${examId}`);
};

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <main className="container py-5 flex-grow-1">
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            role="status"
          ></div>

          <p className="text-muted mt-3">
            Loading exam instructions...
          </p>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !exam) {
    return (
      <main className="container py-5 flex-grow-1">
        <div
          className="card border-0 shadow-sm rounded-4 mx-auto"
          style={{
            maxWidth: '600px'
          }}
        >
          <div className="card-body text-center p-5">
            <i
              className="fa-solid fa-circle-exclamation text-danger mb-3"
              style={{
                fontSize: '50px'
              }}
            ></i>

            <h5 className="fw-bold">
              Unable to Load Examination
            </h5>

            <p className="text-muted">
              {error || 'Examination not found.'}
            </p>

            <Link
              to="/dashboard"
              className="btn btn-primary fw-semibold"
            >
              <i className="fa-solid fa-arrow-left me-2"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * =========================================================
   * INSTRUCTIONS
   * =========================================================
   */

  return (
    <main
      className="container py-5 flex-grow-1"
      style={{
        maxWidth: '850px'
      }}
    >
      <div className="card border-1 shadow-sm rounded-4 overflow-hidden">
        {/* HEADER */}

        <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
          <h5 className="fw-bold text-dark mb-0">
            <i className="fa-solid fa-clipboard-check me-2 text-primary"></i>
            Exam Pre-Check &amp; Instructions
          </h5>

          <span className="badge bg-primary fs-6 font-monospace">
            EXAM-{exam.examId}
          </span>
        </div>

        <div className="card-body p-4">
          {/* EXAM SUMMARY */}

          <div className="row g-3 bg-light p-3 rounded-3 mb-4 text-center border">
            {/* DURATION */}

            <div className="col-3 border-end">
              <small
                className="text-muted d-block fw-semibold text-uppercase"
                style={{
                  fontSize: '0.7rem'
                }}
              >
                Duration
              </small>

              <strong className="text-dark fs-6">
                {exam.durationMinutes} Mins
              </strong>
            </div>

            {/* QUESTIONS */}

            <div className="col-3 border-end">
              <small
                className="text-muted d-block fw-semibold text-uppercase"
                style={{
                  fontSize: '0.7rem'
                }}
              >
                Questions
              </small>

              <strong className="text-dark fs-6">
                {exam.totalQuestions} MCQs
              </strong>
            </div>

            {/* PASSING SCORE */}

            <div className="col-3 border-end">
              <small
                className="text-muted d-block fw-semibold text-uppercase"
                style={{
                  fontSize: '0.7rem'
                }}
              >
                Passing Score
              </small>

              <strong className="text-dark fs-6">
                40%
              </strong>
            </div>

            {/* PROCTORING */}

            <div className="col-3">
              <small
                className="text-muted d-block fw-semibold text-uppercase"
                style={{
                  fontSize: '0.7rem'
                }}
              >
                Proctoring
              </small>

              <strong className="text-success fs-6">
                <i className="fa-solid fa-shield me-1"></i>
                Active
              </strong>
            </div>
          </div>

          {/* EXAM INFORMATION */}

          <div className="alert alert-primary border-0 rounded-3 mb-4">
            <div className="d-flex gap-3">
              <i className="fa-solid fa-circle-info fs-5"></i>

              <div>
                <strong>{exam.title}</strong>

                {exam.subjectName && (
                  <div className="small mt-1">
                    Subject: {exam.subjectName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SYSTEM CHECK */}

          <h6 className="fw-bold text-dark mb-3">
            <i className="fa-solid fa-desktop me-2 text-primary"></i>
            1. Automated System Compatibility Check
          </h6>

          <div className="row g-3 mb-3">

  {/* WEBCAM */}
  <div className="col-md-4">
    <div
      className={`p-3 border rounded-3 d-flex align-items-center justify-content-between ${
        systemCheck.webcam === 'passed'
          ? 'bg-success-subtle text-success'
          : systemCheck.webcam === 'failed'
          ? 'bg-danger-subtle text-danger'
          : 'bg-light text-secondary'
      }`}
    >
      <div className="d-flex align-items-center gap-2">
        <i className="fa-solid fa-video fs-5"></i>

        <div>
          <small className="d-block fw-bold text-dark">
            Webcam
          </small>

          <span
            className={`badge ${
              systemCheck.webcam === 'passed'
                ? 'bg-success'
                : systemCheck.webcam === 'failed'
                ? 'bg-danger'
                : 'bg-secondary'
            }`}
          >
            {systemCheck.webcam === 'passed'
              ? 'Verified'
              : systemCheck.webcam === 'failed'
              ? 'Failed'
              : 'Not checked'}
          </span>
        </div>
      </div>

      <i
        className={`fa-solid ${
          systemCheck.webcam === 'passed'
            ? 'fa-circle-check'
            : systemCheck.webcam === 'failed'
            ? 'fa-circle-xmark'
            : 'fa-clock'
        } fs-5`}
      ></i>
    </div>
  </div>

  {/* MICROPHONE */}
  <div className="col-md-4">
    <div
      className={`p-3 border rounded-3 d-flex align-items-center justify-content-between ${
        systemCheck.microphone === 'passed'
          ? 'bg-success-subtle text-success'
          : systemCheck.microphone === 'failed'
          ? 'bg-danger-subtle text-danger'
          : 'bg-light text-secondary'
      }`}
    >
      <div className="d-flex align-items-center gap-2">
        <i className="fa-solid fa-microphone fs-5"></i>

        <div>
          <small className="d-block fw-bold text-dark">
            Microphone
          </small>

          <span
            className={`badge ${
              systemCheck.microphone === 'passed'
                ? 'bg-success'
                : systemCheck.microphone === 'failed'
                ? 'bg-danger'
                : 'bg-secondary'
            }`}
          >
            {systemCheck.microphone === 'passed'
              ? 'Verified'
              : systemCheck.microphone === 'failed'
              ? 'Failed'
              : 'Not checked'}
          </span>
        </div>
      </div>

      <i
        className={`fa-solid ${
          systemCheck.microphone === 'passed'
            ? 'fa-circle-check'
            : systemCheck.microphone === 'failed'
            ? 'fa-circle-xmark'
            : 'fa-clock'
        } fs-5`}
      ></i>
    </div>
  </div>

  {/* NETWORK */}
  <div className="col-md-4">
    <div
      className={`p-3 border rounded-3 d-flex align-items-center justify-content-between ${
        systemCheck.network === 'passed'
          ? 'bg-success-subtle text-success'
          : systemCheck.network === 'failed'
          ? 'bg-danger-subtle text-danger'
          : 'bg-light text-secondary'
      }`}
    >
      <div className="d-flex align-items-center gap-2">
        <i className="fa-solid fa-wifi fs-5"></i>

        <div>
          <small className="d-block fw-bold text-dark">
            Network
          </small>

          <span
            className={`badge ${
              systemCheck.network === 'passed'
                ? 'bg-success'
                : systemCheck.network === 'failed'
                ? 'bg-danger'
                : 'bg-secondary'
            }`}
          >
            {systemCheck.network === 'passed'
              ? 'Verified'
              : systemCheck.network === 'failed'
              ? 'Failed'
              : 'Not checked'}
          </span>

          {networkSpeed !== null && (
            <small className="d-block mt-1 text-dark">
              {networkSpeed.toFixed(2)} Mbps
            </small>
          )}
        </div>
      </div>

      <i
        className={`fa-solid ${
          systemCheck.network === 'passed'
            ? 'fa-circle-check'
            : systemCheck.network === 'failed'
            ? 'fa-circle-xmark'
            : 'fa-clock'
        } fs-5`}
      ></i>
    </div>
  </div>
</div>

{/* RUN SYSTEM CHECK */}
<div className="mb-4">
  <button
    type="button"
    className="btn btn-outline-primary fw-semibold"
    onClick={runSystemCheck}
    disabled={checkingSystem}
  >
    {checkingSystem ? (
      <>
        <span
          className="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        Checking System...
      </>
    ) : (
      <>
        <i className="fa-solid fa-rotate me-2"></i>
        {allChecksPassed ? 'Check Again' : 'Run System Check'}
      </>
    )}
  </button>

  {systemCheckMessage && (
    <div className="text-danger small mt-2">
      <i className="fa-solid fa-circle-exclamation me-1"></i>
      {systemCheckMessage}
    </div>
  )}

  {allChecksPassed && (
    <div className="text-success small mt-2">
      <i className="fa-solid fa-circle-check me-1"></i>
      All system checks passed. You can proceed when ready.
    </div>
  )}
</div>
          {/* RULES */}

          <h6 className="fw-bold text-dark mb-2">
            <i className="fa-solid fa-triangle-exclamation me-2 text-warning"></i>
            2. Important Rules &amp; Guidelines
          </h6>

          <div className="bg-light p-3 rounded-3 border mb-4">
            <ul className="text-secondary small mb-0 d-flex flex-column gap-2 ps-3">
              <li>
                <strong>Full-Screen Mode:</strong>{' '}
                Do not leave full-screen mode or switch tabs.
              </li>

              <li>
                <strong>Face Visibility:</strong>{' '}
                Your face must remain visible within the camera frame.
              </li>

              <li>
                <strong>Timer Starts Immediately:</strong>{' '}
                The countdown begins when you enter the examination.
              </li>

              <li>
                <strong>Auto-Submit:</strong>{' '}
                When the time expires, your answers are automatically submitted.
              </li>
            </ul>
          </div>

          {/* DECLARATION */}

          <div className="form-check p-3 bg-primary-subtle border border-primary-subtle rounded-3 mb-4">
            <input
              className="form-check-input ms-0 me-2"
              type="checkbox"
              id="agreeCheck"
              checked={isAgreed}
              onChange={(e) =>
                setIsAgreed(e.target.checked)
              }
            />

            <label
              className="form-check-label text-dark fw-bold small"
              htmlFor="agreeCheck"
              style={{
                cursor: 'pointer'
              }}
            >
              I have read all instructions and consent to real-time webcam and audio proctoring during this exam.
            </label>
          </div>

          {/* BUTTONS */}

          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline-secondary px-4 fw-semibold"
            >
              <i className="fa-solid fa-arrow-left me-2"></i>
              Cancel
            </button>

            <button
  type="button"
  onClick={handleEnterExam}
  disabled={!isAgreed || !allChecksPassed || checkingSystem}
  className="btn btn-primary px-5 fw-bold shadow-sm"
>
  Enter Exam Hall
  <i className="fa-solid fa-arrow-right ms-1"></i>
</button>
          </div>
        </div>
      </div>
    </main>
  );
}