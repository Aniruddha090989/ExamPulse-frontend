import React from 'react';
import { Outlet } from 'react-router-dom';
import ExaminerNavbar from '../components/ExaminerNavbar';

export default function ExaminerLayout() {
  return (
    <div className="bg-light d-flex flex-column min-vh-100">
      <ExaminerNavbar />
      <Outlet />
    </div>
  );
}