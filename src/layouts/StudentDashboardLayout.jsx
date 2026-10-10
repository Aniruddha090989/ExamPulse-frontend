import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentDashboardNavbar from '../components/StudentDashboardNavbar';
import Footer from '../components/Footer';

export default function DashboardLayout() {
  return (
    <>
      <StudentDashboardNavbar />
      <Outlet />
      
    </>
  );
}