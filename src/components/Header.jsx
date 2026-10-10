import React from 'react';
import Navbar from './Navbar';

export default function Header({ onOpenCodeModal, showToast }) {
  return (
    <header className="sticky-top glass-nav">
      <Navbar onOpenCodeModal={onOpenCodeModal} showToast={showToast} />
    </header>
  );
}