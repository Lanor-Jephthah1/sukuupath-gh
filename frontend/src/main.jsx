import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#fee', color: '#900', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>React Application Crashed</h1>
          <p style={{ fontWeight: 'bold' }}>An unexpected JavaScript error occurred while navigating:</p>
          <pre style={{ background: '#fff', padding: 20, border: '1px solid #fcc', marginTop: 10, whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ background: '#fff', padding: 20, border: '1px solid #fcc', marginTop: 10, whiteSpace: 'pre-wrap', fontSize: 12 }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
