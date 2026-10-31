import React from 'react';
import { HiExclamationTriangle, HiArrowPath } from '../../utils/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-primary p-6 text-center">
          <div className="w-20 h-20 bg-accent-red/10 rounded-full flex items-center justify-center mb-6">
            <HiExclamationTriangle className="w-10 h-10 text-accent-red" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Something went wrong</h2>
          <p className="text-sm text-text-secondary mb-8 max-w-sm">
            We're sorry, but the application encountered an unexpected error.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-border text-text-primary hover:bg-card-hover transition-colors font-bold"
          >
            <HiArrowPath className="w-5 h-5" />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
