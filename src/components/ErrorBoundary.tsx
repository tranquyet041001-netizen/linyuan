import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs space-y-3 m-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{this.props.fallbackTitle || 'Đã xảy ra sự cố trong khu vực này'}</span>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            {this.state.error?.message || 'Có lỗi xảy ra khi nạp thành phần này.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử lại (Reload)</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
