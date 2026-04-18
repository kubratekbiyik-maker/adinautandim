import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public state: State;

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Beklenmedik bir hata oluştu.';
      
      try {
        // Check if it's our custom Firestore error JSON
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error) {
          errorMessage = `Hata: ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-12 text-center space-y-8 bg-bauhaus-bg border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(255,75,43,1)] max-w-2xl mx-auto my-20">
          <div className="w-20 h-20 bg-bauhaus-red border-4 border-bauhaus-ink flex items-center justify-center">
            <span className="text-white text-4xl font-black">!</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-black tracking-tighter uppercase leading-none">Bir şeyler ters gitti.</h2>
            <p className="text-sm font-black uppercase tracking-widest text-gray-500 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bauhaus-button-yellow px-12 py-4 text-lg"
          >
            SAYFAYI YENİLE
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

export default ErrorBoundary;
