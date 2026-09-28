import React, { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { LogIn, UserCheck, Shield, Key } from 'lucide-react';

interface OidcResponse {
  success: boolean;
  user: {
    subject: string;
    email: string;
    name: string;
    picture: string;
  };
  simulatedAccessToken: string;
  roles: string[];
}

export const GoogleOidcTestbench: React.FC = () => {
  const [idToken, setIdToken] = useState<string>('eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDk5ODg3NzY2NTU0NDMzMjIxMTAiLCJlbWFpbCI6ImR1eS5uZ3V5ZW5AZnB0LmVkdS52biIsIm5hbWUiOiJOZ3V54buFbiBUaMOgbmggRHV5IiwiYXVkIjoiZGVtby1jbGllbnQtaWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJleHAiOjE3OTk5OTk5OTl9.demo_signature');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authResult, setAuthResult] = useState<OidcResponse | null>(null);

  const handleVerifyToken = async () => {
    setIsVerifying(true);
    try {
      const res = await axiosClient.post('/api/v1/auth/google-oidc', {
        idToken,
      });
      setAuthResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <HeritageCard
      title="8. Định Danh Tự Động Google OIDC (OpenID Connect / OAuth 2.0)"
      subtitle="Tự động sinh tài khoản từ Google ID Token, xác thực chữ ký số tại Backend và lưu trữ Access Token trong RAM (Zero-Knowledge & Hard Rule 1.3 RAM-Only)."
      icon={<LogIn className="w-5 h-5" />}
      badge={<HeritageBadge variant="gold">Google Identity Services</HeritageBadge>}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#0B291E]">Google JWT ID Token:</label>
          <textarea
            value={idToken}
            onChange={(e) => setIdToken(e.target.value)}
            rows={3}
            className="w-full p-3 font-mono text-[11px] bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg text-[#14241C]"
          />
        </div>

        <HeritageButton
          onClick={handleVerifyToken}
          isLoading={isVerifying}
          icon={<UserCheck className="w-4 h-4" />}
        >
          Xác thực ID Token & Tự động sinh tài khoản
        </HeritageButton>

        {authResult && (
          <div className="p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-bold text-[#0B291E] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#059669]" /> Thông tin định danh đã xác thực:
              </span>
              <HeritageBadge variant="success">OIDC VALIDATED</HeritageBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div>• Họ và tên: <strong>{authResult.user.name}</strong></div>
              <div>• Email: <strong>{authResult.user.email}</strong></div>
              <div className="md:col-span-2">• Google Subject ID: <code>{authResult.user.subject}</code></div>
              <div className="md:col-span-2">• Phân quyền vai trò: {authResult.roles.join(', ')}</div>
            </div>

            <div className="p-2.5 bg-[#FBF7EE] border border-[#E8DCC6] rounded-lg text-[10px] space-y-1">
              <div className="flex items-center gap-1 font-bold text-[#B88E4C]">
                <Key className="w-3.5 h-3.5" /> Tuân thủ RAM-Only (Hard Rule 1.3):
              </div>
              <p className="text-[#66786E]">
                Access Token chỉ lưu trong RAM state: <code>{authResult.simulatedAccessToken}</code>. Tuyệt đối không lưu vào localStorage/sessionStorage.
              </p>
            </div>
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
