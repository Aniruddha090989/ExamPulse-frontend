import React from 'react';
import { notifyToast } from './ToastProvider';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Uncaught page rendering error:', error);
    notifyToast('This page encountered an unexpected error. Please refresh and try again.', 'error', 6500);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container py-5 text-center" role="alert">
          <h2>Something went wrong</h2>
          <p className="text-muted">An unexpected error occurred while displaying this page.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh page</button>
        </main>
      );
    }
    return this.props.children;
  }
}
