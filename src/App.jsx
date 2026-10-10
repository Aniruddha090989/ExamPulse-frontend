
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import { getStoredUser } from './api/apiFetch';

import HomeLayout from './layouts/HomeLayout';
import StudentDashboardLayout from './layouts/StudentDashboardLayout';
import ExamSelectionLayout from './layouts/ExamSelectionLayout';
import ExaminerLayout from './layouts/ExaminerLayout';

import Home from './pages/Home';
import Dashboard from './pages/StudentDashboard';
import ExamSelection from './pages/ExamSelection';
import Instructions from './pages/Instructions';
import ExamInterface from './pages/ExamInterface';
import Login from './pages/Login';
import Register from './pages/Register';
import Result from './pages/Result';
import SubjectCatalog from './pages/SubjectCatalog';
import ExaminerDashboard from './pages/ExaminerDashboard';
import QuestionManagement from './pages/QuestionManagement';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';

// Check whether a valid-looking login session is stored.
function isAuthenticated() {
  const user = getStoredUser();
  return Boolean(user?.token);
}

// Read the role from the stored login response.
function getUserRole() {
  const user = getStoredUser();

  return String(
    user?.role || user?.user?.role || ''
  ).toUpperCase();
}

// Require login before rendering protected pages.
function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Allow only the specified role.
function RequireRole({ allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
      <BrowserRouter>
      <Routes>

        {/* PUBLIC HOME */}
        <Route element={<HomeLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* PUBLIC AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* AUTHENTICATED STUDENT ROUTES */}
        <Route element={<RequireRole allowedRoles={['STUDENT']} />}>
          <Route element={<StudentDashboardLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
          </Route>

          <Route element={<ExamSelectionLayout />}>
            <Route
              path="/exam-selection"
              element={<ExamSelection />}
            />
          </Route>

          <Route
            path="/instructions/:examId"
            element={<Instructions />}
          />

          <Route
            path="/exam-interface/:examId"
            element={<ExamInterface />}
          />

          <Route
            path="/result/:attemptId"
            element={<Result />}
          />
        </Route>

        {/* EXAMINER / ADMIN ROUTES */}
        <Route
          element={
            <RequireRole
              allowedRoles={['EXAMINER', 'ADMIN']}
            />
          }
        >
          <Route element={<ExaminerLayout />}>
            <Route
              path="/examiner-dashboard"
              element={<ExaminerDashboard />}
            />

            <Route
              path="/question-management"
              element={<QuestionManagement />}
            />

            <Route
              path="/subject-management"
              element={<SubjectCatalog />}
            />
          </Route>
        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </ToastProvider>
  );
}
