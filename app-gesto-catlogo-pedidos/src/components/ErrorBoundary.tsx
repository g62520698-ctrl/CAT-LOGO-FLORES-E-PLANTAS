import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          minHeight: '100dvh',
          background: 'linear-gradient(160deg, #0a1f10 0%, #0d2a18 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: '32px 24px',
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🌸</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2e1e', margin: '0 0 8px' }}>
              Algo deu errado
            </h2>
            <p style={{ fontSize: 13, color: '#4b7a5c', margin: '0 0 6px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'Erro inesperado no aplicativo.'}
            </p>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 24px', lineHeight: 1.4 }}>
              Os seus dados estão seguros. Tente recarregar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={this.handleReset}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                }}
              >
                🔄 Tentar novamente
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14, border: '1px solid #d1eedd',
                  background: '#f5faf7', color: '#15803d', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Recarregar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
