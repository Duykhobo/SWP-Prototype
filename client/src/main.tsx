import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Vô hiệu hóa React DevTools extension để chống soi component state / props trên F12
if (typeof window !== 'undefined') {
  const hook = (window as unknown as { __REACT_DEVTOOLS_GLOBAL_HOOK__?: { inject?: () => void } }).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook && typeof hook.inject === 'function') {
    hook.inject = () => {};
  }

  // Cảnh báo an ninh chuẩn ngân hàng khi mở F12 Console
  console.log(
    '%c⚠️ CẢNH BÁO AN NINH: HỆ THỐNG LEGACYVAULT%c\nTính năng F12 chỉ dành cho nhà phát triển hệ thống được ủy quyền. Mọi hành vi cố tình can thiệp hoặc trích xuất dữ liệu trái phép sẽ bị ghi nhận vào nhật ký kiểm toán bất biến.',
    'color: #F3E5C8; font-size: 14px; font-weight: bold; background: #0B291E; padding: 4px 8px; border-radius: 4px;',
    'color: #B91C1C; font-size: 11px; font-weight: bold; display: block; margin-top: 4px;'
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
