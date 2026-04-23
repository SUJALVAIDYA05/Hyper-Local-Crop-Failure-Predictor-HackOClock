import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ============================================================
// RootErrorBoundary — per FRONTEND_ARCHITECTURE.md §1
// Catches render errors anywhere in the tree and shows a
// friendly, farmer-appropriate error message.
// ============================================================

export default class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Hard reload as a safety net
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #020a02 0%, #0a1f0a 60%, #041a1a 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div
          className="glass"
          style={{
            padding: '2.5rem 2rem',
            maxWidth: '440px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.75rem',
            }}
          >
            ⚠️
          </div>
          <h1
            className="heading-section"
            style={{
              fontSize: '1.5rem',
              marginBottom: '0.625rem',
              color: 'white',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: '0.92rem',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.55,
              marginBottom: '1.75rem',
            }}
          >
            We hit an unexpected error while loading your crop insights. Please try again.
          </p>
          {this.state.error?.message && (
            <pre
              style={{
                fontSize: '0.72rem',
                color: 'rgba(239,68,68,0.75)',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '0.5rem',
                padding: '0.625rem 0.75rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            className="btn-primary"
            onClick={this.handleReset}
            style={{ width: '100%' }}
          >
            🔄 Reload FasalRakshak
          </button>
        </div>
      </div>
    );
  }
}
