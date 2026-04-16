import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleCopy = async () => {
    if (this.state.error) {
      try {
        await navigator.clipboard.writeText(this.state.error.toString());
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      } catch (err) {
        console.error('Failed to copy error:', err);
      }
    }
  };

  private handleHardReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white organic-card m-4 sm:m-8 border-rose-100 shadow-[0_20px_50px_rgba(244,63,94,0.05)]">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-sm">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-3xl font-serif font-black text-gray-900 mb-4 tracking-tight">A small detour</h2>
          <p className="text-gray-500 max-w-md mb-10 font-medium leading-relaxed">
            It seems we've hit a bit of a bump on the road. Don't worry, your career journey is still safe—we just need to reset the path.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-3 px-8 py-4 bg-[#1a1c1e] text-white rounded-[2rem] font-bold hover:bg-gray-800 transition-all shadow-xl active:scale-95"
            >
              <RefreshCw size={20} />
              Reload Application
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={this.handleCopy}
                  className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-[2rem] font-bold hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                >
                  {this.state.copied ? <Check size={20} className="text-emerald-600" /> : <Copy size={20} />}
                  {this.state.copied ? 'Copied!' : 'Copy Details'}
                </button>

                <button
                  onClick={this.handleHardReset}
                  className="flex items-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 border-2 border-rose-100 rounded-[2rem] font-bold hover:bg-rose-100 transition-all active:scale-95 shadow-sm"
                >
                  <Trash2 size={20} />
                  Hard Reset
                </button>
              </>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 w-full max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Technical Details</p>
              <pre className="p-6 bg-gray-900 text-rose-400 text-xs text-left rounded-[2rem] overflow-auto max-h-48 w-full shadow-inner">
                {this.state.error?.toString()}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
