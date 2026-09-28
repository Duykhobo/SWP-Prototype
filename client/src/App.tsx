import React from 'react';
import { TestbenchPage } from './pages/TestbenchPage';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Đã xảy ra lỗi tại Hệ Thống LegacyVault">
      <TestbenchPage />
    </ErrorBoundary>
  );
};

export default App;
