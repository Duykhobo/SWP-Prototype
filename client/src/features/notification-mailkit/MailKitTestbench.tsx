import React, { useState, useEffect } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Mail, Send, AlertTriangle, Key, CheckCircle, RefreshCw } from 'lucide-react';
import { getErrorMessage } from '@/shared/lib/errorUtils';

interface DispatchedEmail {
  toEmail: string;
  subject: string;
  htmlBody: string;
  sentAt: string;
  isRealSmtp: boolean;
}

export const MailKitTestbench: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [ownerName, setOwnerName] = useState('Nguyễn Văn Chủ Kho');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [showSmtpConfig, setShowSmtpConfig] = useState(true);

  const [isSendingAlert, setIsSendingAlert] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [recentEmails, setRecentEmails] = useState<DispatchedEmail[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendMetrics, setSendMetrics] = useState<{ isReal: boolean; latencyMs: number; messageId: string } | null>(null);

  interface SmtpEnvStatus {
    isReadyForLiveSmtp: boolean;
    host: string;
    port: number;
    usernameMasked: string;
    hasPasswordConfigured: boolean;
    senderEmail: string;
    senderName: string;
    guidanceMessage: string;
  }

  const [envStatus, setEnvStatus] = useState<SmtpEnvStatus | null>(null);

  const fetchRecentEmails = async () => {
    try {
      const res = await axiosClient.get('/api/v1/mail/recent');
      setRecentEmails(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEnvStatus = async () => {
    try {
      const res = await axiosClient.get('/api/v1/mail/env-check');
      setEnvStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecentEmails();
    fetchEnvStatus();
  }, []);

  const getSmtpPayload = () => {
    if (smtpUser.trim() && smtpPass.trim()) {
      return {
        host: smtpHost.trim(),
        port: Number(smtpPort),
        username: smtpUser.trim(),
        password: smtpPass.trim(),
      };
    }
    return undefined;
  };

  const handleSendDeathClaimAlert = async () => {
    if (!recipientEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }

    setIsSendingAlert(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setSendMetrics(null);

    try {
      const res = await axiosClient.post('/api/v1/mail/death-claim-alert', {
        toEmail: recipientEmail.trim(),
        ownerName: ownerName.trim(),
        smtpOverride: getSmtpPayload(),
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        setSendMetrics({
          isReal: res.data.isRealSmtp,
          latencyMs: res.data.latencyMs,
          messageId: res.data.messageId,
        });
      } else {
        setErrorMessage(res.data.message || res.data.errorDetails || 'Gửi email thất bại.');
      }
      fetchRecentEmails();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSendingAlert(false);
    }
  };

  const handleSendOtp = async () => {
    if (!recipientEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email người nhận.');
      return;
    }

    setIsSendingOtp(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    setSendMetrics(null);

    try {
      const res = await axiosClient.post('/api/v1/mail/otp', {
        toEmail: recipientEmail.trim(),
        smtpOverride: getSmtpPayload(),
      });

      if (res.data.success) {
        setSuccessMessage(`Đã gửi mã OTP: ${res.data.otpGenerated}. ${res.data.message}`);
        setSendMetrics({
          isReal: res.data.isRealSmtp,
          latencyMs: res.data.latencyMs,
          messageId: res.data.messageId,
        });
      } else {
        setErrorMessage(res.data.message || res.data.errorDetails || 'Gửi email OTP thất bại.');
      }
      fetchRecentEmails();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSendingOtp(false);
    }
  };

  return (
    <HeritageCard
      title="5. Dịch Vụ Gửi Email Bảo Mật MailKit SMTP Thực Tế"
      subtitle="Sử dụng MailKit và MimeKit (.NET 8) gửi email cảnh báo xâm phạm kho khẩn cấp, OTP đăng nhập và link Hủy mở kho một chạm (Anti-Collusion Alert)."
      icon={<Mail className="w-5 h-5" />}
      badge={<HeritageBadge variant="forest">MailKit / MimeKit Engine</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* EmailUtils Environment Status Banner */}
        {envStatus && (
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            envStatus.isReadyForLiveSmtp
              ? 'bg-[#EBF7F0] border-[#A7F3D0]'
              : 'bg-[#FAF6EE] border-[#D5C29E]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B291E] flex items-center gap-1.5">
                <CheckCircle className={`w-4 h-4 ${envStatus.isReadyForLiveSmtp ? 'text-[#059669]' : 'text-[#B88E4C]'}`} />
                Kiểm Tra Biến Môi Trường SMTP (EmailUtils):
              </span>
              <HeritageBadge variant={envStatus.isReadyForLiveSmtp ? 'success' : 'gold'}>
                {envStatus.isReadyForLiveSmtp ? 'SMTP ENV READY' : 'CHƯA NẠP BIẾN MÔI TRƯỜNG'}
              </HeritageBadge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#4A453A]">
              <div>• Host: <strong>{envStatus.host}</strong> ({envStatus.port})</div>
              <div>• Username: <strong>{envStatus.usernameMasked}</strong></div>
              <div>• Password: <strong>{envStatus.hasPasswordConfigured ? '✓ Đã thiết lập mật mã' : '✗ Chưa cấu hình'}</strong></div>
            </div>
            <p className="text-[10px] text-[#66786E]">
              {envStatus.guidanceMessage}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B291E]">Email Người Nhận (Chủ kho):</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0B291E]">Tên Chủ Kho:</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg"
            />
          </div>
        </div>

        {/* Cấu hình SMTP Live */}
        <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[#0B291E]">Cấu hình Gửi Email Thực Tế (MailKit SMTP):</span>
              <span className="text-[#66786E] ml-2">
                {smtpUser ? `Đang dùng tài khoản: ${smtpUser}` : 'Chưa nhập tài khoản gửi (Vui lòng cấu hình bên dưới để gửi email thật)'}
              </span>
            </div>
            <button
              onClick={() => setShowSmtpConfig(!showSmtpConfig)}
              className="px-3 py-1 bg-[#0B291E] text-[#FAF9F5] text-xs font-semibold rounded-md hover:bg-[#133E2F] cursor-pointer"
            >
              {showSmtpConfig ? 'Ẩn cấu hình' : 'Mở cài đặt SMTP Live'}
            </button>
          </div>

          {showSmtpConfig && (
            <div className="pt-3 border-t border-[#E8DCC6] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[#0B291E]">SMTP Host:</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0B291E]">Port:</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0B291E]">Username (Email gửi):</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
                  placeholder="your_email@gmail.com"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#0B291E]">Mật khẩu ứng dụng (App Password):</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
                  placeholder="16 ký tự Google App Password"
                />
              </div>
              <div className="sm:col-span-2 md:col-span-4 text-[10px] text-[#66786E]">
                * Hướng dẫn: Đối với Gmail, bật 2-Step Verification trong Tài khoản Google → Bảo mật → Mật khẩu ứng dụng (App Passwords) → Tạo mật khẩu 16 chữ cái để kết nối trực tiếp.
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <HeritageButton
            variant="danger"
            onClick={handleSendDeathClaimAlert}
            isLoading={isSendingAlert}
            icon={<AlertTriangle className="w-4 h-4" />}
          >
            Gửi Email Cảnh Báo Mở Kho Khẩn Cấp (Có Nút Cứu Hộ)
          </HeritageButton>

          <HeritageButton
            variant="gold"
            onClick={handleSendOtp}
            isLoading={isSendingOtp}
            icon={<Key className="w-4 h-4" />}
          >
            Gửi Mã OTP Xác Thực Danh Tính
          </HeritageButton>

          <HeritageButton
            variant="outline"
            onClick={fetchRecentEmails}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Làm mới danh sách
          </HeritageButton>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] space-y-1">
            <span className="font-bold block">Lỗi Gửi Email SMTP:</span>
            <code className="text-[10px] font-mono break-all block whitespace-pre-wrap">{errorMessage}</code>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-[#E6F4EA] border border-[#A7F3D0] rounded-lg text-xs text-[#059669] space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            {sendMetrics && (
              <div className="text-[11px] text-[#14241C] flex items-center gap-3 pt-1 border-t border-[#A7F3D0]/60">
                <span>• Thời gian gửi: <strong>{sendMetrics.latencyMs} ms</strong></span>
                <span>• Message-ID: <code className="font-mono text-[10px]">{sendMetrics.messageId}</code></span>
                <HeritageBadge variant={sendMetrics.isReal ? 'success' : 'neutral'}>
                  {sendMetrics.isReal ? 'SMTP THỰC TẾ' : 'SIMULATED'}
                </HeritageBadge>
              </div>
            )}
          </div>
        )}

        {/* Danh sách email đã gửi */}
        <div className="space-y-3 pt-3 border-t border-[#DCD9D0]">
          <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider">
            Nhật Ký Email Đã Phát Hành (Gần Đây Nhất):
          </h4>
          {recentEmails.length === 0 ? (
            <p className="text-xs text-[#66786E]">Chưa có email nào được gửi trong phiên làm việc này.</p>
          ) : (
            <div className="space-y-3">
              {recentEmails.map((email, idx) => (
                <div key={idx} className="p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B291E]">{email.subject}</span>
                    <HeritageBadge variant={email.isRealSmtp ? 'success' : 'neutral'}>
                      {email.isRealSmtp ? 'SMTP Thực Tế' : 'Simulated SMTP Record'}
                    </HeritageBadge>
                  </div>
                  <div className="text-[11px] text-[#66786E]">
                    Gửi tới: <strong>{email.toEmail}</strong> lúc {new Date(email.sentAt).toLocaleTimeString('vi-VN')}
                  </div>
                  <div
                    className="p-3 bg-white rounded border border-[#DCD9D0] overflow-x-auto text-[11px]"
                    dangerouslySetInnerHTML={{ __html: email.htmlBody }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HeritageCard>
  );
};
