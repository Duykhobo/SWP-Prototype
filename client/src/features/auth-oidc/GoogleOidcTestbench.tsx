/**
 * @file GoogleOidcTestbench.tsx
 * @description Tích hợp Google Identity Services (GIS) & OpenID Connect thật 100%
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { 
  LogIn, 
  UserCheck, 
  Shield, 
  Key, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface OidcResponse {
  success: boolean;
  user: {
    subject: string;
    email: string;
    name: string;
    picture: string;
    issuer?: string;
    audience?: string;
    expiryTime?: string;
  };
  simulatedAccessToken: string;
  roles: string[];
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: (notification?: (notification: unknown) => void) => void;
        };
      };
    };
  }
}

export const GoogleOidcTestbench: React.FC = () => {
  // Lấy Client ID đã lưu hoặc để trống để người dùng nhập
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return localStorage.getItem('lv_google_client_id') || '';
  });
  const [isGisReady, setIsGisReady] = useState<boolean>(false);
  const [idToken, setIdToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authResult, setAuthResult] = useState<OidcResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // Xác thực token qua backend
  const verifyIdToken = useCallback(async (tokenToVerify: string, clientIdUsed?: string) => {
    if (!tokenToVerify.trim()) return;
    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await axiosClient.post('/api/v1/auth/google-oidc', {
        idToken: tokenToVerify.trim(),
        clientId: (clientIdUsed || googleClientId).trim() || undefined,
      });

      if (res.data.success) {
        setAuthResult(res.data);
      } else {
        setAuthError('Xác thực thất bại: Google ID Token không hợp lệ hoặc đã hết hạn.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setAuthError(axiosErr.response?.data?.message || axiosErr.message || 'Lỗi kết nối tới máy chủ xác thực.');
    } finally {
      setIsVerifying(false);
    }
  }, [googleClientId]);

  // Khởi tạo Google Identity Services
  const initGoogleIdentityServices = useCallback(() => {
    if (!window.google?.accounts?.id) {
      return false;
    }

    const cleanClientId = googleClientId.trim();
    if (!cleanClientId) {
      setIsGisReady(false);
      return false;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: cleanClientId,
        callback: (response: { credential: string }) => {
          // response.credential là real Google JWT ID Token!
          setIdToken(response.credential);
          verifyIdToken(response.credential, cleanClientId);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 300,
        });
      }

      setIsGisReady(true);
      localStorage.setItem('lv_google_client_id', cleanClientId);
      return true;
    } catch (err) {
      console.error('Lỗi khởi tạo Google Identity Services:', err);
      setIsGisReady(false);
      return false;
    }
  }, [googleClientId, verifyIdToken]);

  // Kiểm tra nạp SDK Google
  useEffect(() => {
    const checkGsiInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGsiInterval);
        if (googleClientId.trim()) {
          initGoogleIdentityServices();
        }
      }
    }, 300);

    return () => clearInterval(checkGsiInterval);
  }, [googleClientId, initGoogleIdentityServices]);

  const handleApplyClientId = () => {
    if (!googleClientId.trim()) {
      setAuthError('Vui lòng nhập Google Client ID trước khi kích hoạt.');
      return;
    }
    setAuthError(null);
    initGoogleIdentityServices();
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOneTap = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <HeritageCard
      title="8. Định Danh Tự Động Google OIDC (OpenID Connect / OAuth 2.0)"
      subtitle="Đăng nhập trực tiếp bằng Google thật qua Google Identity Services (GIS). Xác thực chữ ký số RSA 2048-bit tại Backend và lưu trữ Access Token trong RAM (Hard Rule 1.3 RAM-Only)."
      icon={<LogIn className="w-5 h-5" />}
      badge={<HeritageBadge variant="gold">Google Live OIDC</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Banner Hướng Dẫn & Thiết Lập Client ID */}
        <div className="p-4 bg-gradient-to-r from-[#FAF6EE] to-[#F3EDE0] border border-[#D5C29E] rounded-xl text-xs space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88E4C]" />
              <span className="font-bold text-[#0B291E] text-sm">
                Đăng Nhập Bằng Google Thật (Google Identity Services)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[#B88E4C] hover:text-[#8C682D] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showGuide ? 'Ẩn hướng dẫn' : 'Cách lấy Client ID Google (2 phút)'}
            </button>
          </div>

          <p className="text-[#4A453A] leading-relaxed">
            Để Google hiển thị cửa sổ chọn tài khoản thật của bạn, Google yêu cầu <strong>Google OAuth 2.0 Client ID</strong> (cấp từ Google Cloud Console) được cho phép chạy trên tên miền <code>{window.location.origin}</code>.
          </p>

          {/* Ô nhập Google Client ID */}
          <div className="space-y-1.5 pt-1">
            <label className="font-bold text-[#0B291E] block">
              Google OAuth 2.0 Client ID của bạn:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: 1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
                value={googleClientId}
                onChange={(e) => setGoogleClientId(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD9D0] rounded-lg font-mono text-[#0B291E]"
              />
              <HeritageButton
                variant="primary"
                onClick={handleApplyClientId}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Kích Hoạt Nút Google
              </HeritageButton>
            </div>
            <span className="text-[11px] text-[#66786E] block">
              Client ID sẽ được tự động ghi nhớ trên trình duyệt để bạn không cần nhập lại.
            </span>
          </div>

          {/* Hộp Hướng Dẫn Chi Tiết Cách Lấy Client ID */}
          {showGuide && (
            <div className="p-3.5 bg-white border border-[#E4D5BE] rounded-lg space-y-2 mt-2 text-[#4A453A]">
              <div className="font-bold text-[#0B291E]">3 Bước Lấy Google Client ID Miễn Phí:</div>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>
                  Truy cập trang cấu hình Google Cloud:{' '}
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[#B88E4C] underline font-bold inline-flex items-center gap-0.5"
                  >
                    Google Cloud Console Credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Nhấn <strong>+ CREATE CREDENTIALS</strong> $\rightarrow$ chọn <strong>OAuth client ID</strong> $\rightarrow$ Chọn Application type: <strong>Web application</strong>.
                </li>
                <li>
                  Tại mục <strong>Authorized JavaScript origins</strong>, nhấn Add URI và dán đúng địa chỉ:
                  <div className="inline-flex items-center gap-1.5 ml-1 px-2 py-0.5 bg-[#E5EDE8] rounded border border-[#CBD5CB] font-mono text-[#0B291E]">
                    {window.location.origin}
                    <button
                      type="button"
                      onClick={handleCopyOrigin}
                      className="cursor-pointer hover:text-[#059669]"
                      title="Sao chép URI"
                    >
                      {copied ? <Check className="w-3 h-3 text-[#059669]" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </li>
                <li>
                  Nhấn <strong>CREATE</strong>, sao chép <strong>Client ID</strong> dán vào ô bên trên rồi bấm <strong>"Kích Hoạt Nút Google"</strong>.
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Khối Đăng Nhập Chính Thức Google */}
        <div className="p-6 bg-white border border-[#DCD9D0] rounded-xl space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-3">
            <div>
              <h4 className="font-bold text-sm text-[#0B291E] flex items-center gap-2">
                <LogIn className="w-4 h-4 text-[#B88E4C]" />
                Đăng Nhập Tài Khoản Google Thật
              </h4>
              <p className="text-[11px] text-[#66786E] mt-0.5">
                Nhấn nút chính thức của Google bên dưới để xác thực danh tính thực tế.
              </p>
            </div>

            {isGisReady && (
              <button
                type="button"
                onClick={handleOneTap}
                className="px-3 py-1 bg-[#E5EDE8] text-[#0B291E] hover:bg-[#D2E2D7] rounded-md text-xs font-semibold cursor-pointer transition-colors"
              >
                Mở Google One Tap ⚡
              </button>
            )}
          </div>

          {/* Vùng Render Nút Google GIS Chính Thức */}
          <div className="flex flex-col items-center justify-center p-6 bg-[#FAF9F5] border border-[#E8DCC6] rounded-xl space-y-3">
            <div ref={googleBtnContainerRef} id="google-signin-button" className="min-h-[44px]">
              {!isGisReady && (
                <div className="text-center space-y-2">
                  <div className="p-3 bg-[#FBF7EE] border border-[#E8DCC6] rounded-lg text-xs text-[#8C682D] max-w-md">
                    <AlertCircle className="w-4 h-4 inline mr-1 text-[#B88E4C]" />
                    Chưa kích hoạt nút Google. Vui lòng dán <strong>Google Client ID</strong> vào ô trên và bấm <strong>"Kích Hoạt Nút Google"</strong> để đăng nhập tài khoản thật.
                  </div>
                </div>
              )}
            </div>

            {isGisReady && (
              <span className="text-[10px] text-[#66786E]">
                Google Identity Services v2 • Được bảo vệ bởi giao thức Google OpenID Connect (OIDC)
              </span>
            )}
          </div>

          {/* Hiển thị Lỗi nếu có */}
          {authError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>

        {/* Khối Hiển Thị Thông Tin Đã Xác Thực (Verified User Profile) */}
        {authResult && authResult.success && (
          <div className="p-6 bg-gradient-to-br from-[#FAF8F2] to-[#F1ECE1] border border-[#D4C3A3] rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E2D5BC] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#059669]" />
                <span className="font-bold text-sm text-[#0B291E]">
                  Hồ Sơ Người Dùng Đã Xác Thực Chữ Ký Google (RS256)
                </span>
              </div>
              <HeritageBadge variant="success">OIDC VALIDATED (LIVE)</HeritageBadge>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Ảnh đại diện Google thật */}
              {authResult.user.picture ? (
                <img
                  src={authResult.user.picture}
                  alt={authResult.user.name}
                  className="w-16 h-16 rounded-full border-2 border-[#B88E4C] shadow-xs object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#0B291E] text-white font-bold flex items-center justify-center text-xl">
                  {authResult.user.name?.charAt(0) || 'U'}
                </div>
              )}

              {/* Thông tin chi tiết */}
              <div className="flex-1 space-y-1.5 text-xs text-[#2A3F33] w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <span className="font-bold text-base text-[#0B291E]">{authResult.user.name}</span>
                  <span className="text-[11px] text-[#66786E]">
                    Vai trò gán: <strong className="text-[#0B291E]">{authResult.roles.join(', ')}</strong>
                  </span>
                </div>
                <div>• Email xác thực: <strong className="text-[#059669]">{authResult.user.email}</strong></div>
                <div className="break-all">• Google Subject ID (sub): <code className="text-[10px] font-mono">{authResult.user.subject}</code></div>
                {authResult.user.issuer && (
                  <div className="text-[10px] text-[#66786E]">• Nhà phát hành (iss): {authResult.user.issuer}</div>
                )}
              </div>
            </div>

            {/* RAM-Only Access Token */}
            <div className="p-3 bg-[#E5EDE8] border border-[#CBD5CB] rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0B291E]">
                <Key className="w-3.5 h-3.5 text-[#B88E4C]" />
                Tuân Thủ Quy Tắc RAM-Only (Hiến Chương Hard Rule 1.3):
              </div>
              <p className="text-[11px] text-[#3A5345]">
                Access Token phiên làm việc chỉ được lưu giữ trong RAM bộ nhớ phiên:
              </p>
              <code className="text-[10px] font-mono bg-white px-2 py-1 rounded block break-all text-[#0B291E] border border-[#CBD5CB]">
                {authResult.simulatedAccessToken}
              </code>
              <span className="text-[10px] text-[#66786E] block pt-0.5">
                Tuyệt đối không lưu Access Token hoặc Master Key vào localStorage / sessionStorage theo tiêu chuẩn Zero-Knowledge.
              </span>
            </div>
          </div>
        )}

        {/* Khối Nhập Token Thủ Công (Dành Cho Nhà Phát Triển / Kiểm Thử) */}
        <div className="p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#0B291E] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#B88E4C]" />
              Kiểm Tra ID Token JWT Thủ Công (Dành Cho Developer):
            </span>
            <span className="text-[10px] text-[#66786E]">Xác thực trực tiếp chuỗi JWT</span>
          </div>

          <textarea
            value={idToken}
            onChange={(e) => setIdToken(e.target.value)}
            rows={3}
            placeholder="Dán chuỗi Google JWT ID Token (eyJhbGciOiJSUzI1NiIs...) vào đây..."
            className="w-full p-2.5 font-mono text-[11px] bg-white border border-[#DCD9D0] rounded-lg text-[#14241C]"
          />

          <HeritageButton
            onClick={() => verifyIdToken(idToken)}
            isLoading={isVerifying}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Xác Thực Chữ Ký ID Token Tại Backend
          </HeritageButton>
        </div>
      </div>
    </HeritageCard>
  );
};
