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
        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-tech-card border border-neon-pink/40 rounded-2xl m-4 sm:m-8 shadow-[0_0_30px_rgba(255,0,127,0.15)]">
          <div className="w-16 h-16 bg-neon-pink/10 text-neon-pink rounded-xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(255,0,127,0.2)] border border-neon-pink/30 animate-pulse">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-serif font-black text-white mb-2 tracking-tight uppercase">[ CRITICAL_SYSTEM_INTERRUPT ]</h2>
          <p className="text-slate-400 max-w-md mb-8 font-mono text-xs leading-relaxed">
            A parsing anomaly was detected in the active data thread. Review technical diagnostic parameters or initiate an application recoin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan/20 to-neon-violet/20 hover:from-neon-cyan/30 hover:to-neon-violet/30 border border-neon-cyan/40 text-neon-cyan rounded-xl font-serif font-bold hover:shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all cursor-pointer text-sm"
            >
              <RefreshCw size={16} className="animate-spin" />
              HOT_RELOAD
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={this.handleCopy}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-slate-300 border border-tech-border rounded-xl font-mono text-xs hover:text-white hover:border-slate-500 transition-all cursor-pointer"
                >
                  {this.state.copied ? <Check size={14} className="text-neon-emerald" /> : <Copy size={14} />}
                  {this.state.copied ? 'COPIED_LOGS_OK' : 'COPY_DIAGNOSTICS'}
                </button>

                <button
                  onClick={this.handleHardReset}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-neon-pink border border-neon-pink/20 rounded-xl font-mono text-xs hover:bg-neon-pink/10 hover:border-neon-pink/60 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                  HARD_RESET_PURGE
                </button>
              </>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 w-full max-w-2xl">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-2">// DIAGNOSTIC ERROR STREAM</p>
              <pre className="p-4 bg-slate-950 text-neon-pink text-[11px] font-mono text-left rounded-lg overflow-auto max-h-48 w-full border border-tech-border shadow-inner">
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
