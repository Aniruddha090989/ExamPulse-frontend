import React from 'react';
import { Outlet } from 'react-router-dom';
import ExamSelectionNavbar from '../components/ExamSelectionNavbar';


export default function MainLayout() {
  return (
    <>
      <ExamSelectionNavbar />
      <Outlet />
      
    </>
  );
}