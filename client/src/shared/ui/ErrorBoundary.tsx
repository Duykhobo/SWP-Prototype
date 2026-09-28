import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { HeritageButton } from './HeritageButton';

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
        <div className="min-h-[200px] p-6 bg-[#FAF9F5] border border-[#FECACA] rounded-xl text-center space-y-4 m-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#B91C1C]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#0B291E]">
              {this.props.fallbackTitle || 'Đã xảy ra lỗi giao diện'}
            </h3>
            <p className="text-xs text-[#66786E] max-w-md mx-auto">
              {this.state.error?.message || 'Có lỗi bất ngờ trong quá trình hiển thị thành phần này.'}
            </p>
          </div>
          <HeritageButton
            variant="primary"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Tải Lại Giao Diện
          </HeritageButton>
        </div>
      );
    }

    return this.props.children;
  }
}
