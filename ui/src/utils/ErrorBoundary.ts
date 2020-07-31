import * as React from 'react';

type ErrorBoundaryProps = {
  fallback: React.ReactNode | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  state = {hasError: false, error: null};
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
