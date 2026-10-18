import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EGO EMPIRE Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('ego_admin_token');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#040816] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl iphone-glass border border-red-500/30 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-['Orbitron'] font-black uppercase tracking-[0.25em] text-red-400 block mb-1">
                SYSTEM DIAGNOSTIC NOTICE
              </span>
              <h2 className="font-['Orbitron'] text-2xl font-black text-white uppercase tracking-wide">
                COMMAND PORTAL RECOVERY
              </h2>
              <p className="font-['Rajdhani'] text-sm text-gray-300 font-semibold mt-2">
                A temporary rendering exception occurred. The system has prevented a black-screen crash and stabilized the command environment.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 text-left">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Error Details:</span>
                <p className="font-mono text-xs text-red-300 break-words mt-1">
                  {this.state.error.message || 'Unknown runtime error'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-['Orbitron'] text-xs font-black uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>RELOAD PORTAL</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-3 rounded-xl font-['Orbitron'] text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>RESET SESSION</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-gray-500 border-t border-white/10 pt-4">
              ᎬᏀᎧ Ꭼᴍᴘɪꤪꤨʀᴇ • Free Fire Esports Guild Command Center
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
