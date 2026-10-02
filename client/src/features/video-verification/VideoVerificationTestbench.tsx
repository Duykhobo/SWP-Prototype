/**
 * @file VideoVerificationTestbench.tsx
 * @description Thành phần kiểm thử Xác minh Danh tính & Cứu hộ qua Video 1–1 (LiveKit Cloud)
 * Giao diện tinh chỉnh: Bố cục Stepper trực quan, phân tách phòng chờ, phòng gọi và bàn thẩm định.
 */

import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

import { HeritageBadge } from "@/shared/ui/HeritageBadge";
import {
  AlertTriangle,
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  Fingerprint,
  Key,
  Lock,
  Mic,
  PhoneCall,
  PhoneOff,
  Plus,
  QrCode,
  RefreshCw,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Unlock,
  Users,
  Video,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface JoinTokenData {
  liveKitUrl: string;
  roomName: string;
  participantIdentity: string;
  participantName: string;
  token: string;
  expiresInSeconds: number;
}

export type ExtendedUserRole =
  | "EXECUTOR"
  | "BENEFICIARY_GUEST"
  | "CO_BENEFICIARY"
  | "NOTARY_OBSERVER"
  | "VERIFIER"
  | "OWNER";

export const VideoVerificationTestbench: React.FC = () => {
  // Navigation Steps: 'prejoin' | 'call' | 'verdict'
  const [activeStep, setActiveStep] = useState<"prejoin" | "call" | "verdict">("prejoin");

  // Scenarios & Roles
  const [purpose, setPurpose] = useState<"OWNER_RESCUE" | "HANDOVER_VERIFICATION">("HANDOVER_VERIFICATION");
  const [userRole, setUserRole] = useState<ExtendedUserRole>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const r = p.get("role") as ExtendedUserRole;
      if (r) return r;
    }
    return "EXECUTOR";
  });

  // Tên hiển thị của người tham gia trong cuộc họp
  const [participantDisplayName, setParticipantDisplayName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("name") || "";
    }
    return "";
  });

  // Guest Token nếu là người nhận truy cập qua link mời
  const [guestToken, setGuestToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("guestToken") || null;
    }
    return null;
  });

  // Case & Session IDs
  const [caseId, setCaseId] = useState<string>("c83f9872-4d2a-4318-b2a8-123456789abc");
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("session") || null;
    }
    return null;
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRoleText, setCopiedRoleText] = useState<string | null>(null);

  // Dynamic Challenge Code for live interaction
  const [challengeCode] = useState<string>("LV-8492");

  // Local Pre-join States
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // LiveKit Connection
  const [joinTokenData, setJoinTokenData] = useState<JoinTokenData | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [inCall, setInCall] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Verifier / Executor Checklist & Verdict
  const [checklist, setChecklist] = useState({
    faceMatched: false,
    challengeSpoken: false,
    headTurned: false,
    noDuress: false,
  });
  const [verdictOutcome, setVerdictOutcome] = useState<"PASS" | "FAIL" | "REQUIRE_MORE_DOCS" | "INCONCLUSIVE">("PASS");
  const [verifierNotes, setVerifierNotes] = useState<string>(
    "Đương sự đã xuất trình CCCD gốc, đọc chính xác mã xác minh LV-8492 và quay mặt đối chiếu phản xạ tự nhiên. Khuôn mặt khớp ảnh đăng ký.",
  );
  const [verdictResult, setVerdictResult] = useState<any>(null);

  // Emergency Hold State
  const [holdResult, setHoldResult] = useState<any>(null);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  // In-Call Handover Ceremony States (7-Step Protocol)
  const [handoverEligibility, setHandoverEligibility] = useState<any>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);
  const [isAcceptingHandover, setIsAcceptingHandover] = useState<boolean>(false);
  const [acceptResponse, setAcceptResponse] = useState<any>(null);
  const [secondFactorVerified, setSecondFactorVerified] = useState<boolean>(true); // FIDO2 / Passkey
  const [isVerifierSaving, setIsVerifierSaving] = useState<boolean>(false);
  const [verifierSavedPass, setVerifierSavedPass] = useState<boolean>(false);
  const [verifierSavedInconclusive, setVerifierSavedInconclusive] = useState<boolean>(false);
  const [executorAllowing, setExecutorAllowing] = useState<boolean>(false);
  const [downloadingAssetId, setDownloadingAssetId] = useState<string | null>(null);
  const [decryptedFiles, setDecryptedFiles] = useState<Record<string, boolean>>({});
  const [downloadedAssetIds, setDownloadedAssetIds] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [finalReceipt, setFinalReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Tải trạng thái điều kiện bàn giao từ Backend
  const fetchHandoverEligibility = async (targetSessionId?: string) => {
    const sId = targetSessionId || sessionId;
    if (!sId) return;
    try {
      setIsCheckingEligibility(true);
      const res = await axios.get(`${API_BASE}/api/video-sessions/${sId}/handover-eligibility`);
      setHandoverEligibility(res.data);
      if (res.data.isVerifierApproved || res.data.isExecutorAuthorized) {
        setVerifierSavedPass(true);
      }
      if (res.data.isFinalized && res.data.finalReceipt) {
        setFinalReceipt(res.data.finalReceipt);
      }
      if (res.data.isAlreadyAccepted && !acceptResponse) {
        setAcceptResponse({
          success: true,
          message: "Di sản đã được tiếp nhận thành công.",
          grantId: res.data.existingGrantId,
          grantStatus: "ACTIVE",
          assets: res.data.assets,
        });
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra điều kiện bàn giao:", err);
    } finally {
      setIsCheckingEligibility(false);
    }
  };

  // Bước 4: Người thực thi bấm "Xác nhận người nhận & cho phép nhận di sản"
  const handleExecutorAllowHandover = async () => {
    if (!sessionId) return;
    try {
      setExecutorAllowing(true);
      await axios.post(`${API_BASE}/api/case-bundles/${caseId}/executor-allow-handover`, {
        faceMatched: checklist.faceMatched,
        nationalIdMatched: true,
        interactiveChallengePassed: checklist.challengeSpoken,
        executorNotes: verifierNotes,
      });
      setVerifierSavedPass(true);
      setVerifierSavedInconclusive(false);
      await fetchHandoverEligibility();
    } catch (err: any) {
      alert("Lỗi khi xác nhận người nhận: " + (err.response?.data?.message || err.message));
    } finally {
      setExecutorAllowing(false);
    }
  };

  // Bước 6 & 7: Người nhận bấm "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên"
  const handleFinalizeHandover = async () => {
    if (!sessionId) return;
    try {
      setIsFinalizing(true);
      const res = await axios.post(`${API_BASE}/api/case-bundles/${caseId}/finalize-handover`, {
        downloadedAssetIds: downloadedAssetIds,
        legalDeclaration: "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên.",
        guestToken: guestToken,
      });
      setFinalReceipt(res.data.receipt);
      setShowReceiptModal(true);
      await fetchHandoverEligibility();
    } catch (err: any) {
      alert("Lỗi hoàn tất phiên: " + (err.response?.data?.message || err.message));
    } finally {
      setIsFinalizing(false);
    }
  };

  // Verifier lưu kết quả xác minh: ĐẠT ngay trong cuộc gọi
  const handleSaveVerifierPass = async () => {
    if (!sessionId) return;
    try {
      setIsVerifierSaving(true);
      await axios.post(
        `${API_BASE}/api/video-sessions/${sessionId}/submit-verdict?verifierId=22222222-2222-2222-2222-222222222222`,
        {
          outcome: "PASS",
          verifierNotes: verifierNotes,
          checklistJson: JSON.stringify(checklist),
        },
      );
      setVerifierSavedPass(true);
      setVerifierSavedInconclusive(false);
      await fetchHandoverEligibility();
    } catch (err: any) {
      alert("Lỗi khi lưu kết quả: " + (err.response?.data?.message || err.message));
    } finally {
      setIsVerifierSaving(false);
    }
  };

  // Verifier đánh dấu Nghi ngờ bất thường / Deepfake
  const handleSaveVerifierInconclusive = async () => {
    if (!sessionId) return;
    try {
      setIsVerifierSaving(true);
      await axios.post(
        `${API_BASE}/api/video-sessions/${sessionId}/submit-verdict?verifierId=22222222-2222-2222-2222-222222222222`,
        {
          outcome: "INCONCLUSIVE",
          verifierNotes: "Nghi ngờ tín hiệu deepfake / giật mép hình / bất thường nhận dạng từ xa. Chuyển hội đồng thẩm định trực tiếp.",
          checklistJson: JSON.stringify(checklist),
        },
      );
      setVerifierSavedInconclusive(true);
      setVerifierSavedPass(false);
      await fetchHandoverEligibility();
    } catch (err: any) {
      alert("Lỗi khi lưu kết quả: " + (err.response?.data?.message || err.message));
    } finally {
      setIsVerifierSaving(false);
    }
  };

  // Người nhận bấm "Chấp nhận nhận di sản" (Bước 4 & 5)
  const handleAcceptHandover = async () => {
    if (!sessionId) return;
    try {
      setIsAcceptingHandover(true);
      const res = await axios.post(`${API_BASE}/api/video-sessions/${sessionId}/accept-handover`, {
        legalAcknowledgment: true,
        secondFactorType: "PASSKEY_FIDO2",
        secondFactorProof: "webauthn-hardware-signature-verified-ok",
      });
      setAcceptResponse(res.data);
      await fetchHandoverEligibility();
    } catch (err: any) {
      alert("Không thể nhận di sản: " + (err.response?.data?.message || err.message));
    } finally {
      setIsAcceptingHandover(false);
    }
  };

  // Người nhận tải và giải mã tệp bản rõ trong bộ nhớ máy
  const handleDecryptAndDownload = async (asset: any) => {
    setDownloadingAssetId(asset.assetId);
    try {
      // 1. Nhận vật liệu giải mã qua kênh bảo mật riêng HTTPS (tách biệt khỏi LiveKit)
      await axios.post(`${API_BASE}/api/case-bundles/${caseId}/decrypt-key`);
      
      // 2. Tải bản mã
      const blobRes = await axios.get(`${API_BASE}${asset.downloadEndpoint}`, { responseType: "blob" });
      
      // 3. Giả lập giải mã AES-GCM 256-bit trong RAM trình duyệt và kích hoạt tải về máy
      const decryptedBlob = new Blob([blobRes.data], { type: asset.mimeType || "application/octet-stream" });
      const url = window.URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.title.replace(".enc", "");
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDecryptedFiles((prev) => ({ ...prev, [asset.assetId]: true }));
      setDownloadedAssetIds((prev) => Array.from(new Set([...prev, asset.assetId])));
    } catch (err: any) {
      alert("Lỗi giải mã tài sản: " + (err.response?.data?.message || err.message));
    } finally {
      setDownloadingAssetId(null);
    }
  };

  // Polling điều kiện bàn giao khi đang ở trong phòng gọi
  useEffect(() => {
    if (activeStep === "call" && sessionId) {
      fetchHandoverEligibility(sessionId);
      const timer = setInterval(() => {
        fetchHandoverEligibility(sessionId);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [activeStep, sessionId]);

  // 1. Quản lý Pre-join Local Camera & Mic Preview
  const startLocalPreview = async () => {
    try {
      stopLocalPreview();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
        audio: true,
      });
      setLocalStream(stream);
      setIsCameraActive(true);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      // Audio Level Analyzer
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err: any) {
      console.error("Không thể mở preview:", err);
      alert("Vui lòng cho phép quyền truy cập Camera và Microphone trên trình duyệt.");
    }
  };

  const stopLocalPreview = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setIsCameraActive(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      stopLocalPreview();
    };
  }, []);

  // 2. Kích hoạt Emergency Rescue Hold
  const handleTriggerEmergencyHold = async () => {
    setIsHolding(true);
    try {
      const res = await axios.post(`${API_BASE}/api/video-sessions/rescue/hold`, {
        caseId: caseId,
        ownerId: "11111111-1111-1111-1111-111111111111",
        reason: "Chủ sở hữu phát hiện di sản bị kích hoạt bất thường. Kháng nghị TÔI CÒN SỐNG!",
      });
      setHoldResult(res.data);
      if (res.data.videoSessionId) {
        setSessionId(res.data.videoSessionId);
      }
    } catch (err: any) {
      console.error("Lỗi khi kích hoạt Emergency Hold:", err);
      alert(err.response?.data?.message || "Không thể kích hoạt Emergency Hold.");
    } finally {
      setIsHolding(false);
    }
  };

  // 3. Khởi tạo phiên gọi nếu chưa có
  const ensureSessionCreated = async (): Promise<string> => {
    if (sessionId) return sessionId;
    const res = await axios.post(`${API_BASE}/api/video-sessions/request`, {
      caseId: caseId,
      purpose: purpose,
      subjectUserId: "11111111-1111-1111-1111-111111111111",
      assignedVerifierId: "22222222-2222-2222-2222-222222222222",
    });
    setSessionId(res.data.sessionId);
    return res.data.sessionId;
  };

  // 3.1. Tạo thêm phòng họp mới hoàn toàn (Hội đồng di sản / Nhiều người)
  const handleCreateNewRoom = async (customPurpose?: "OWNER_RESCUE" | "HANDOVER_VERIFICATION") => {
    const p = customPurpose || purpose;
    const newCaseId = `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      const res = await axios.post(`${API_BASE}/api/video-sessions/request`, {
        caseId: newCaseId,
        purpose: p,
        subjectUserId: "11111111-1111-1111-1111-111111111111",
        assignedVerifierId: "22222222-2222-2222-2222-222222222222",
      });
      setCaseId(newCaseId);
      setSessionId(res.data.sessionId);
      setGuestToken(null);
      setJoinTokenData(null);
      setInCall(false);
      setDownloadedAssetIds([]);
      setDecryptedFiles({});
      setFinalReceipt(null);
      setShowReceiptModal(false);
      setAcceptResponse(null);
      setVerifierSavedPass(false);
      setActiveStep("prejoin");
      alert(`Đã khởi tạo phòng họp mới thành công!\nMã phòng: ${res.data.sessionId.slice(0, 8)}...`);
    } catch (err: any) {
      alert("Lỗi tạo phòng họp mới: " + (err.response?.data?.message || err.message));
    }
  };

  // 3.2. Sao chép link mời theo từng vai trò cụ thể trong cuộc họp
  const copyInviteLink = async (role: ExtendedUserRole, defaultName: string, label: string) => {
    let sid = sessionId;
    if (!sid) {
      sid = await ensureSessionCreated();
    }
    let token = guestToken;
    if (!token && (role === "BENEFICIARY_GUEST" || role === "CO_BENEFICIARY")) {
      try {
        const gRes = await axios.post(`${API_BASE}/api/case-bundles/${caseId}/guest-session?sessionId=${sid}`);
        token = gRes.data.guestToken;
        setGuestToken(token);
      } catch (e) {
        console.error("Lỗi tạo guest session:", e);
      }
    }
    const params = new URLSearchParams();
    params.set("session", sid);
    params.set("role", role);
    if (token) params.set("guestToken", token);
    params.set("name", defaultName);

    const link = `${window.location.origin}/?${params.toString()}`;
    navigator.clipboard.writeText(link);
    setCopiedRoleText(label);
    setTimeout(() => setCopiedRoleText(null), 3000);
  };

  // 4. Lấy Token & Vào cuộc gọi (Hỗ trợ nhiều bên tham gia cùng lúc)
  const handleJoinCall = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      stopLocalPreview();
      const currentSessionId = await ensureSessionCreated();

      let effectiveUserId = "11111111-1111-1111-1111-111111111111";
      if (userRole === "VERIFIER" || userRole === "EXECUTOR") {
        effectiveUserId = "22222222-2222-2222-2222-222222222222";
      } else if (userRole === "CO_BENEFICIARY") {
        effectiveUserId = "33333333-3333-3333-3333-333333333333";
      } else if (userRole === "NOTARY_OBSERVER") {
        effectiveUserId = "44444444-4444-4444-4444-444444444444";
      }

      const defaultName =
        userRole === "EXECUTOR"
          ? "Người thực thi (Host Executor)"
          : userRole === "BENEFICIARY_GUEST"
          ? "Người thụ hưởng 1 (Chính)"
          : userRole === "CO_BENEFICIARY"
          ? "Đồng thừa kế 2"
          : userRole === "NOTARY_OBSERVER"
          ? "Công chứng viên / Luật sư"
          : userRole === "VERIFIER"
          ? "Thẩm định viên (Verifier)"
          : "Chủ kho (Owner)";

      const effectiveName = participantDisplayName.trim() || defaultName;

      const params = new URLSearchParams();
      params.set("userId", effectiveUserId);
      params.set("role", userRole);
      params.set("participantName", effectiveName);
      if (guestToken) {
        params.set("guestToken", guestToken);
      }

      const res = await axios.post(
        `${API_BASE}/api/video-sessions/${currentSessionId}/join-token?${params.toString()}`,
      );

      setJoinTokenData(res.data);
      setInCall(true);
      setActiveStep("call");
    } catch (err: any) {
      console.error("Lỗi kết nối phòng gọi:", err);
      setConnectionError(err.response?.data?.message || "Không thể cấp quyền gia nhập phòng LiveKit.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 5. Kết thúc cuộc gọi
  const handleEndCall = async () => {
    if (sessionId) {
      try {
        const effectiveUserId =
          userRole === "VERIFIER" || userRole === "EXECUTOR"
            ? "22222222-2222-2222-2222-222222222222"
            : "11111111-1111-1111-1111-111111111111";
        await axios.post(`${API_BASE}/api/video-sessions/${sessionId}/end?userId=${effectiveUserId}`);
      } catch (e) {
        console.error("Lỗi khi đóng phiên:", e);
      }
    }
    setInCall(false);
    setJoinTokenData(null);
    setActiveStep("verdict");
  };

  // 6. Verifier nộp kết quả
  const handleSubmitVerdict = async () => {
    if (!sessionId) {
      alert("Vui lòng thực hiện phiên gọi trước.");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE}/api/video-sessions/${sessionId}/submit-verdict?verifierId=22222222-2222-2222-2222-222222222222`,
        {
          outcome: verdictOutcome,
          verifierNotes: verifierNotes,
          checklistJson: JSON.stringify(checklist),
        },
      );
      setVerdictResult(res.data);
    } catch (err: any) {
      console.error("Lỗi nộp phán quyết:", err);
      alert("Không thể lưu kết quả thẩm định.");
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl shadow-xs overflow-hidden">
      {/* 1. TOP HEADER & WORKFLOW NAVIGATION */}
      <div className="bg-white border-b border-[#DCD9D0] p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <HeritageBadge variant="gold">MANUAL IDENTITY VERIFICATION</HeritageBadge>
              <HeritageBadge variant="forest">LIVEKIT CLOUD</HeritageBadge>
              <span className="text-[11px] font-mono text-[#66786E]">RFC-WebRTC SFU</span>
            </div>
            <h2 className="text-xl font-bold text-[#0B291E] flex items-center gap-2">
              <Video className="w-5 h-5 text-[#B88E4C]" />
              Xác Minh Danh Tính Thủ Công & Gọi Video 1–1
            </h2>
            <p className="text-xs text-[#66786E]">
              Đối chiếu trực tiếp người nộp hồ sơ hoặc tiếp nhận Kháng nghị cứu hộ khẩn cấp trước khi bàn giao di sản.
            </p>
          </div>

          {/* Quick Context Switchers */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#DCD9D0] flex items-center gap-2">
              <span className="text-[#66786E] font-medium">Mục đích:</span>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as any)}
                className="bg-white border-0 font-bold text-[#0B291E] focus:ring-0 cursor-pointer"
              >
                <option value="OWNER_RESCUE">🚨 Kháng nghị Cứu hộ (Owner Rescue)</option>
                <option value="HANDOVER_VERIFICATION">📋 Thẩm định Bàn giao (Executor)</option>
              </select>
            </div>

            <div className="bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#DCD9D0] flex items-center gap-2">
              <span className="text-[#66786E] font-medium">Góc nhìn:</span>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="bg-white border-0 font-bold text-[#B88E4C] focus:ring-0 cursor-pointer"
              >
                <option value="EXECUTOR">Người thực thi (Executor - Host)</option>
                <option value="BENEFICIARY_GUEST">Người thụ hưởng 1 (Guest)</option>
                <option value="CO_BENEFICIARY">Đồng thừa kế (Co-Beneficiary)</option>
                <option value="NOTARY_OBSERVER">Công chứng viên / Luật sư</option>
                <option value="VERIFIER">Thẩm định viên (Verifier)</option>
                <option value="OWNER">Chủ kho di sản (Owner / Subject)</option>
              </select>
            </div>
          </div>
        </div>

        {/* STEPPER PROGRESS BAR */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EFECE6]">
          <div className="flex items-center gap-3">
            {/* Step 1 */}
            <button
              onClick={() => setActiveStep("prejoin")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeStep === "prejoin" ? "bg-[#0B291E] text-white shadow-xs" : "text-[#66786E] hover:bg-[#EFECE6]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>Kiểm tra Thiết bị (Phòng chờ)</span>
            </button>

            <ChevronRight className="w-4 h-4 text-[#DCD9D0]" />

            {/* Step 2 */}
            <button
              onClick={() => setActiveStep("call")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeStep === "call" ? "bg-[#0B291E] text-white shadow-xs" : "text-[#66786E] hover:bg-[#EFECE6]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
              <span>Phòng Gọi Video 1–1</span>
              {inCall && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            <ChevronRight className="w-4 h-4 text-[#DCD9D0]" />

            {/* Step 3 */}
            <button
              onClick={() => setActiveStep("verdict")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeStep === "verdict" ? "bg-[#0B291E] text-white shadow-xs" : "text-[#66786E] hover:bg-[#EFECE6]"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
              <span>Biên Bản Thẩm Định</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1.1. MULTI-PARTY ROOM MANAGEMENT & MULTI-ROLE INVITE HUB */}
      <div className="bg-[#FAF9F5] border-b border-[#DCD9D0] px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#B88E4C] shrink-0" />
            <span className="font-bold text-[#0B291E]">Phòng họp LiveKit:</span>
            {sessionId ? (
              <code className="bg-white border border-[#DCD9D0] px-2 py-0.5 rounded text-[#0B291E] font-mono font-bold">
                {sessionId.slice(0, 8)}...
              </code>
            ) : (
              <span className="text-[#66786E] italic">(Chưa khởi tạo phòng)</span>
            )}
          </div>

          {/* Nút Tạo Thêm Phòng Mới */}
          <button
            onClick={() => handleCreateNewRoom()}
            className="px-2.5 py-1 bg-white hover:bg-[#EFECE6] border border-[#DCD9D0] text-[#0B291E] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Khởi tạo một phòng họp video LiveKit mới hoàn toàn"
          >
            <Plus className="w-3.5 h-3.5 text-[#B88E4C]" />
            <span>Tạo Thêm Phòng Mới</span>
          </button>
        </div>

        {/* Multi-party Invite Links */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#66786E] font-medium hidden sm:inline mr-1">Mời vào phòng:</span>

          {/* 1. Link Người thụ hưởng chính */}
          <button
            onClick={() => copyInviteLink("BENEFICIARY_GUEST", "Người Thụ Hưởng 1", "Người Thụ Hưởng 1")}
            className="px-2.5 py-1 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
            title="Link khách mời cho người nhận chính (Không cần đăng nhập)"
          >
            <Copy className="w-3 h-3 text-[#B88E4C]" />
            <span>+ Người Nhận 1</span>
          </button>

          {/* 2. Link Đồng thừa kế (Người nhận 2) */}
          <button
            onClick={() => copyInviteLink("CO_BENEFICIARY", "Đồng Thừa Kế 2", "Đồng Thừa Kế 2")}
            className="px-2.5 py-1 bg-white hover:bg-[#EFECE6] border border-[#DCD9D0] text-[#0B291E] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
            title="Link cho người nhận di sản thứ 2 / thành viên thừa kế"
          >
            <Users className="w-3 h-3 text-blue-600" />
            <span>+ Đồng Thừa Kế 2</span>
          </button>

          {/* 3. Link Công chứng viên / Luật sư */}
          <button
            onClick={() => copyInviteLink("NOTARY_OBSERVER", "Công Chứng Viên", "Công Chứng Viên")}
            className="px-2.5 py-1 bg-white hover:bg-[#EFECE6] border border-[#DCD9D0] text-[#0B291E] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
            title="Link cho luật sư / công chứng viên giám sát"
          >
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            <span>+ Luật Sư / Công Chứng</span>
          </button>

          {/* 4. Link Người thực thi */}
          <button
            onClick={() => copyInviteLink("EXECUTOR", "Người Thực Thi", "Người Thực Thi")}
            className="px-2.5 py-1 bg-white hover:bg-[#EFECE6] border border-[#DCD9D0] text-[#0B291E] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs whitespace-nowrap"
            title="Link cho Người thực thi (Host Executor)"
          >
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            <span>+ Executor</span>
          </button>

          {copiedRoleText && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md animate-in fade-in flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-700" /> Đã chép link {copiedRoleText}!
            </span>
          )}
        </div>
      </div>

      {/* 2. EMERGENCY HOLD BANNER (Nếu vừa kích hoạt) */}
      {holdResult && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>EMERGENCY HOLD ĐANG HOẠT ĐỘNG:</strong> Tiến trình bàn giao đã bị tạm giữ. Chặn cấp phát quyền tải
              mới.
            </span>
          </div>
          <span className="font-mono text-[11px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
            HoldId: {holdResult.holdId?.slice(0, 8)}...
          </span>
        </div>
      )}

      {/* 3. STEP CONTENT WORKSPACES */}
      <div className="p-6">
        {/* ============================================================== */}
        {/* TAB 1: PRE-JOIN ROOM & DEVICE CHECK                            */}
        {/* ============================================================== */}
        {activeStep === "prejoin" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#0B291E]">
                Phòng Chờ Kiểm Tra Thiết Bị (Pre-join Verification Desk)
              </h3>
              <p className="text-xs text-[#66786E]">
                Thực hiện kiểm tra camera và micro cục bộ trên thiết bị của bạn trước khi bước vào phòng xác minh chính
                thức.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Preview Screen */}
              <div className="md:col-span-7 bg-[#14241C] rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-white/10 shadow-md">
                {isCameraActive ? (
                  <div className="w-full h-full relative">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                    {/* Live Mic Meter Badge */}
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px]">Độ nhạy Mic:</span>
                      <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all duration-75"
                          style={{ width: `${audioLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-6 text-white/60">
                    <CameraOff className="w-10 h-10 mx-auto text-white/30" />
                    <p className="text-xs">Webcam chưa được kích hoạt.</p>
                    <button
                      onClick={startLocalPreview}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      Bật Camera & Micro
                    </button>
                  </div>
                )}
              </div>

              {/* Checklist & Entry Action Card */}
              <div className="md:col-span-5 bg-white border border-[#DCD9D0] rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#0B291E] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#B88E4C]" />
                  Hướng dẫn chuẩn bị xác minh
                </h4>

                <ul className="text-xs text-[#66786E] space-y-2.5">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Cầm sẵn <strong>Căn cước công dân / Hộ chiếu gốc</strong> trên tay.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Đảm bảo ánh sáng rõ ràng, không đeo khẩu trang hay kính râm.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Đọc to <strong>Mã thử thách (Challenge Code)</strong> khi Verifier yêu cầu.
                    </span>
                  </li>
                </ul>

                {/* Tên hiển thị người tham gia trong phòng gọi */}
                <div className="space-y-1.5 pt-2 border-t border-[#EFECE6]">
                  <label className="text-[11px] font-bold text-[#0B291E] flex items-center justify-between">
                    <span>Tên của bạn trong phòng họp:</span>
                    <span className="text-[10px] text-[#66786E] font-normal">Hiển thị trên khung LiveKit</span>
                  </label>
                  <input
                    type="text"
                    value={participantDisplayName}
                    onChange={(e) => setParticipantDisplayName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn A (Người thụ hưởng)"
                    className="w-full bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl px-3 py-2 text-xs font-semibold text-[#0B291E] focus:ring-1 focus:ring-[#B88E4C]"
                  />
                </div>

                <div className="pt-1">
                  <button
                    onClick={handleJoinCall}
                    disabled={isConnecting}
                    className="w-full py-3 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4 text-[#B88E4C]" />
                    {isConnecting ? "Đang cấp Token LiveKit..." : "Tham Gia Phòng Gọi Trực Tiếp"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LIVEKIT IN-CALL ROOM & IN-CALL HANDOVER PANEL          */}
        {/* ============================================================== */}
        {activeStep === "call" && (
          <div className="space-y-4">
            {/* Top Call Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#DCD9D0] p-4 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
                    <span>Phiên Gọi Trực Tiếp (Room: {joinTokenData?.roomName || "Đang kết nối"})</span>
                    <HeritageBadge variant="gold">LỄ BÀN GIAO TRONG PHÒNG GỌI</HeritageBadge>
                  </h4>
                  <p className="text-[11px] text-[#66786E]">
                    Vai trò:{" "}
                    <strong className="text-[#0B291E]">
                      {userRole === "EXECUTOR"
                        ? "Người thực thi (Host Executor)"
                        : userRole === "VERIFIER"
                        ? "Thẩm định viên (Host Verifier)"
                        : userRole === "BENEFICIARY_GUEST"
                        ? "Người thụ hưởng 1 (Chính)"
                        : userRole === "CO_BENEFICIARY"
                        ? "Đồng thừa kế 2"
                        : userRole === "NOTARY_OBSERVER"
                        ? "Công chứng viên / Luật sư giám sát"
                        : "Chủ kho di sản (Owner)"}
                    </strong>
                    {participantDisplayName && (
                      <span className="ml-1.5 font-bold text-[#B88E4C]">({participantDisplayName})</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Challenge Code Widget on screen */}
              <div className="flex items-center gap-2">
                <div className="bg-[#FAF9F5] border border-[#B88E4C]/40 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs shadow-xs">
                  <QrCode className="w-4 h-4 text-[#B88E4C]" />
                  <div>
                    <span className="text-[9px] text-[#66786E] uppercase font-bold block">Mã Thử Thách Cử Chỉ:</span>
                    <span className="font-mono text-xs font-extrabold text-[#0B291E] tracking-wider">
                      {challengeCode}
                    </span>
                  </div>
                </div>

                {/* Refresh Handover Status */}
                <button
                  onClick={() => fetchHandoverEligibility()}
                  disabled={isCheckingEligibility}
                  title="Cập nhật điều kiện bàn giao"
                  className="p-2 bg-white border border-[#DCD9D0] hover:bg-[#FAF9F5] rounded-xl text-[#0B291E] transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingEligibility ? "animate-spin text-[#B88E4C]" : ""}`} />
                </button>

                {/* End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  Rời Phòng & Xem Biên Bản
                </button>
              </div>
            </div>

            {/* TWO-COLUMN IN-CALL WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: LIVEKIT VIDEO STREAM (7 COLS) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="bg-[#14241C] rounded-2xl overflow-hidden min-h-[480px] border border-white/10 shadow-lg relative flex items-center justify-center">
                  {inCall && joinTokenData ? (
                    <div className="w-full h-[480px] bg-black">
                      <LiveKitRoom
                        video={true}
                        audio={true}
                        token={joinTokenData.token}
                        serverUrl={joinTokenData.liveKitUrl}
                        onDisconnected={handleEndCall}
                        data-lk-theme="default"
                        className="w-full h-full"
                      >
                        <VideoConference />
                        <RoomAudioRenderer />
                      </LiveKitRoom>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-white/50 space-y-3">
                      <PhoneOff className="w-10 h-10 mx-auto text-white/30" />
                      <p className="text-xs">Chưa kết nối vào phòng LiveKit.</p>
                      <button
                        onClick={handleJoinCall}
                        className="px-4 py-2 bg-[#B88E4C] text-[#0B291E] font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Vào Lại Phòng Gọi
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-[#DCD9D0] px-4 py-2.5 rounded-xl flex items-center justify-between text-xs text-[#66786E]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Kênh WebRTC SFU LiveKit mã hóa đầu-cuối. Duy trì mở phòng trong suốt lễ nhận di sản.</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#B88E4C] font-semibold">Zero-Knowledge Kept Intact</span>
                </div>
              </div>

              {/* RIGHT COLUMN: IN-CALL HANDOVER PANEL (5 COLS) */}
              <div className="lg:col-span-5 bg-white border border-[#DCD9D0] rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-[#B88E4C]" />
                    <h4 className="text-xs font-bold text-[#0B291E] uppercase tracking-wider">
                      Bàn Giao Di Sản (In-Call Ceremony)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-[#FAF9F5] border border-[#DCD9D0] px-2 py-0.5 rounded text-[#66786E]">
                    Bundle: {caseId.slice(0, 8)}...
                  </span>
                </div>

                {/* NIST SP 800-63A & Anti-Deepfake Notice */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 text-xs text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Lưu ý An ninh & Phòng chống Giả mạo (NIST SP 800-63A):</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Cuộc gọi video là <strong>nguồn bằng chứng hỗ trợ đối chiếu</strong>; chưa bảo đảm chống deepfake chuyên sâu. Khóa giải mã chỉ được phát hành khi hội đủ: <em>Verifier xác nhận, ràng buộc hồ sơ gốc, xác thực 2FA/Passkey và kiểm soát Time-Lock/Rescue.</em>
                  </p>
                </div>

                {/* Dossier info ràng buộc từ trước */}
                {handoverEligibility?.registeredDossier && (
                  <div className="p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl text-xs space-y-1.5">
                    <span className="text-[10px] text-[#66786E] uppercase font-bold block">
                      Hồ Sơ Người Thụ Hưởng Đã Đăng Ký Trước (Không Thể Đổi):
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#66786E] block">Họ tên chỉ định:</span>
                        <strong className="text-[#0B291E]">{handoverEligibility.registeredDossier.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-[#66786E] block">CCCD trên CSDL:</span>
                        <strong className="text-[#0B291E] font-mono">{handoverEligibility.registeredDossier.nationalIdMasked}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Hold Banner nếu có */}
                {handoverEligibility?.isRescueHeld && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>HỒ SƠ ĐANG TẠM GIỮ BỞI CHỦ KHO (RESCUE HOLD)</span>
                    </div>
                    <p className="text-[11px] text-red-600">
                      Chủ sở hữu đã gửi lệnh cứu hộ khẩn cấp. Toàn bộ thao tác bàn giao và cấp phát khóa giải mã bị đóng băng vô điều kiện.
                    </p>
                  </div>
                )}

                {/* --- PHÂN BẬT GIAO DIỆN THEO ROLE (7-STEP HANDOVER CEREMONY) --- */}

                {/* 1. GIAO DIỆN NGƯỜI THỰC THI (EXECUTOR / VERIFIER): BƯỚC 3 & 4 */}
                {(userRole === "EXECUTOR" || userRole === "VERIFIER") && (
                  <div className="space-y-4 pt-1 border-t border-[#EFECE6]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-[#B88E4C]" />
                        Bảng Thao Tác Người Thực Thi (Executor Desk):
                      </span>
                      {handoverEligibility?.isExecutorAuthorized || verifierSavedPass ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Đã Cấp Quyền Nhận Di Sản
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ Đối Chiếu & Cấp Phép
                        </span>
                      )}
                    </div>

                    {/* Bước 3: Đối chiếu người nhận & Kiểm tra giấy tờ */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#66786E] uppercase tracking-wider flex items-center gap-1">
                        <span>Bước 3: Đối chiếu người nhận & Kiểm tra giấy tờ</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <label className="flex items-start gap-2 p-2 bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg cursor-pointer hover:bg-[#F5F2EB] transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.faceMatched}
                            onChange={(e) => setChecklist({ ...checklist, faceMatched: e.target.checked })}
                            className="mt-0.5 rounded text-[#0B291E] focus:ring-0"
                          />
                          <span>Khớp khuôn mặt với CCCD gốc & hồ sơ chỉ định trên CSDL</span>
                        </label>
                        <label className="flex items-start gap-2 p-2 bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg cursor-pointer hover:bg-[#F5F2EB] transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.challengeSpoken}
                            onChange={(e) => setChecklist({ ...checklist, challengeSpoken: e.target.checked })}
                            className="mt-0.5 rounded text-[#0B291E] focus:ring-0"
                          />
                          <span>Đã yêu cầu & người nhận đọc to chính xác mã: <strong>{challengeCode}</strong></span>
                        </label>
                        <label className="flex items-start gap-2 p-2 bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg cursor-pointer hover:bg-[#F5F2EB] transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.headTurned}
                            onChange={(e) => setChecklist({ ...checklist, headTurned: e.target.checked })}
                            className="mt-0.5 rounded text-[#0B291E] focus:ring-0"
                          />
                          <span>Cử chỉ tự nhiên, viền mép cổ thực tế, không có dấu hiệu deepfake</span>
                        </label>
                      </div>
                    </div>

                    {/* Ghi chú đối chiếu */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#66786E]">Ghi chú biên bản thẩm định:</label>
                      <textarea
                        rows={2}
                        value={verifierNotes}
                        onChange={(e) => setVerifierNotes(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-2.5 text-xs text-[#0B291E] focus:ring-1 focus:ring-[#B88E4C]"
                      />
                    </div>

                    {/* Bước 4: Cho phép nhận */}
                    <div className="pt-1">
                      <div className="text-[11px] font-bold text-[#66786E] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <span>Bước 4: Cấp quyền tiếp nhận di sản</span>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={handleExecutorAllowHandover}
                          disabled={executorAllowing || handoverEligibility?.isRescueHeld || (handoverEligibility?.isExecutorAuthorized && verifierSavedPass)}
                          className={`w-full py-3 px-4 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                            (handoverEligibility?.isExecutorAuthorized || verifierSavedPass)
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                              : "bg-emerald-700 hover:bg-emerald-800 text-white"
                          } disabled:opacity-50`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>
                            {executorAllowing
                              ? "Đang xác nhận trên hệ thống..."
                              : (handoverEligibility?.isExecutorAuthorized || verifierSavedPass)
                              ? "Đã Xác Nhận Người Nhận & Cho Phép Nhận Di Sản"
                              : "Xác nhận người nhận & cho phép nhận di sản"}
                          </span>
                        </button>

                        {!(handoverEligibility?.isExecutorAuthorized || verifierSavedPass) && (
                          <button
                            onClick={handleSaveVerifierInconclusive}
                            disabled={isVerifierSaving}
                            className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShieldQuestion className="w-3.5 h-3.5 text-amber-700" />
                            <span>Tạm giữ nghi ngờ (INCONCLUSIVE / Báo cáo)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bảng theo dõi tiến độ tải của người nhận (Real-time Beneficiary Progress) */}
                    <div className="p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#0B291E]">
                        <span>Tiến độ tải & giải mã của Người nhận:</span>
                        <span className="font-mono text-[#B88E4C]">
                          {downloadedAssetIds.length}/{(acceptResponse?.assets || handoverEligibility?.assets || []).length} tệp
                        </span>
                      </div>
                      <div className="w-full bg-[#EFECE6] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full transition-all duration-300"
                          style={{
                            width: `${
                              (acceptResponse?.assets || handoverEligibility?.assets || []).length > 0
                                ? (downloadedAssetIds.length /
                                    (acceptResponse?.assets || handoverEligibility?.assets || []).length) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-[#66786E] flex items-center justify-between pt-1">
                        <span>Trạng thái phiên:</span>
                        {handoverEligibility?.isFinalized ? (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Đã hoàn tất & cấp biên nhận
                          </span>
                        ) : (handoverEligibility?.isExecutorAuthorized || verifierSavedPass) ? (
                          <span className="text-amber-700">Đang chờ người nhận tải & xác nhận...</span>
                        ) : (
                          <span className="text-[#66786E]">Chờ Executor cấp phép</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. GIAO DIỆN NGƯỜI THỤ HƯỞNG (BENEFICIARY_GUEST / OWNER): BƯỚC 5 & 6 */}
                {(userRole === "BENEFICIARY_GUEST" || userRole === "OWNER") && (
                  <div className="space-y-3.5 pt-1 border-t border-[#EFECE6]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#B88E4C]" />
                        Tiến Trình Nhận Di Sản (4 Chốt An Ninh Backend):
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Chốt 1: Quyền từ Người thực thi */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCD9D0] bg-[#FAF9F5]">
                        <span className="flex items-center gap-2">
                          {handoverEligibility?.isExecutorAuthorized || handoverEligibility?.isVerifierApproved || verifierSavedPass ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
                          )}
                          <span>1. Người thực thi cho phép nhận:</span>
                        </span>
                        <strong
                          className={
                            handoverEligibility?.isExecutorAuthorized || handoverEligibility?.isVerifierApproved || verifierSavedPass
                              ? "text-emerald-700"
                              : "text-amber-600"
                          }
                        >
                          {handoverEligibility?.isExecutorAuthorized || handoverEligibility?.isVerifierApproved || verifierSavedPass
                            ? "ĐÃ CHO PHÉP (PASS)"
                            : "Chờ Executor..."}
                        </strong>
                      </div>

                      {/* Chốt 2: Time-Lock */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCD9D0] bg-[#FAF9F5]">
                        <span className="flex items-center gap-2">
                          {!handoverEligibility?.isTimeLocked ? (
                            <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span>2. Khóa thời gian trễ (Time-Lock):</span>
                        </span>
                        <strong className={!handoverEligibility?.isTimeLocked ? "text-emerald-700" : "text-amber-600 font-mono"}>
                          {!handoverEligibility?.isTimeLocked ? "ĐÃ GIẢI TỎA" : `Còn ${handoverEligibility?.timeLockRemainingSeconds}s`}
                        </strong>
                      </div>

                      {/* Chốt 3: Rescue Hold */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCD9D0] bg-[#FAF9F5]">
                        <span className="flex items-center gap-2">
                          {!handoverEligibility?.isRescueHeld ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>3. Kháng nghị Cứu hộ (Rescue):</span>
                        </span>
                        <strong className={!handoverEligibility?.isRescueHeld ? "text-emerald-700" : "text-red-600"}>
                          {!handoverEligibility?.isRescueHeld ? "AN TOÀN" : "TẠM GIỮ"}
                        </strong>
                      </div>

                      {/* Chốt 4: Xác thực thiết bị */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#DCD9D0] bg-[#FAF9F5]">
                        <span className="flex items-center gap-2">
                          <Fingerprint className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>4. Xác thực thiết bị (Passkey / Session):</span>
                        </span>
                        <strong className="text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Sẵn sàng
                        </strong>
                      </div>
                    </div>

                    {/* Bước 5: NÚT CHẤP NHẬN & TẢI DI SẢN (KHI CHƯA TIẾP NHẬN) */}
                    {!acceptResponse && (
                      <div className="pt-2">
                        {!(handoverEligibility?.isExecutorAuthorized || verifierSavedPass) ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-center space-y-1">
                            <p className="font-semibold">Vui lòng tương tác trực tiếp với Người thực thi qua video bên trái.</p>
                            <p className="text-[11px] text-amber-800">
                              Nút <strong>“Chấp nhận & tải di sản”</strong> sẽ xuất hiện ngay sau khi Người thực thi kiểm tra CCCD và bấm cho phép.
                            </p>
                          </div>
                        ) : (
                          <button
                            onClick={handleAcceptHandover}
                            disabled={
                              !handoverEligibility?.canAccept &&
                              !(
                                handoverEligibility?.isExecutorAuthorized &&
                                !handoverEligibility?.isRescueHeld &&
                                !handoverEligibility?.isTimeLocked
                              )
                            }
                            className="w-full py-3 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Sparkles className="w-4 h-4 text-[#B88E4C]" />
                            <span>
                              {isAcceptingHandover ? "Đang xác thực & Mở quyền truy cập..." : "Chấp nhận & tải di sản"}
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* BƯỚC 5: KHU VỰC TẢI & GIẢI MÃ TỪNG FILE TẠI CLIENT */}
                    {acceptResponse && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>BƯỚC 5: GIẢI MÃ & TẢI TỪNG TỆP DI SẢN</span>
                          </div>
                          <span className="text-[10px] font-mono bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded">
                            RAM AES-GCM
                          </span>
                        </div>

                        <p className="text-[11px] text-emerald-900 leading-relaxed">
                          Dữ liệu được giải mã an toàn trong bộ nhớ máy. Vui lòng kiểm tra trạng thái từng tệp trước khi xác nhận hoàn tất.
                        </p>

                        <div className="space-y-2 pt-1">
                          {(acceptResponse.assets || handoverEligibility?.assets || []).map((asset: any) => {
                            const isDownloaded = downloadedAssetIds.includes(asset.assetId) || decryptedFiles[asset.assetId];
                            const isDownloading = downloadingAssetId === asset.assetId;

                            return (
                              <div
                                key={asset.assetId}
                                className="bg-white p-3 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-[#0B291E] font-mono text-[11px]">{asset.title}</strong>
                                    {asset.isMandatory !== false && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                                        Bắt buộc
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#66786E] block mt-0.5">
                                    {asset.category} • {Math.round(asset.fileSizeBytes / 1024)} KB
                                  </span>

                                  {/* Trạng thái từng file */}
                                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                                    {isDownloaded ? (
                                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã lưu thành công vào thiết bị
                                      </span>
                                    ) : isDownloading ? (
                                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> Đang giải mã AES-GCM...
                                      </span>
                                    ) : (
                                      <span className="text-[#66786E] flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-amber-500" /> Chưa tải
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleDecryptAndDownload(asset)}
                                  disabled={isDownloading}
                                  className="px-3 py-1.5 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 text-[11px] cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                  <Download className="w-3.5 h-3.5 text-[#B88E4C]" />
                                  <span>
                                    {isDownloading ? "Đang xử lý..." : isDownloaded ? "Tải lại file" : "Giải mã & Tải về"}
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* BƯỚC 6: XÁC NHẬN HOÀN TẤT */}
                        <div className="pt-3 border-t border-emerald-200/80 space-y-2">
                          <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                            <span>Bước 6: Xác nhận hoàn tất & đóng phiên</span>
                            <span className="font-mono text-[10px] text-emerald-800">
                              {downloadedAssetIds.length}/
                              {(acceptResponse.assets || handoverEligibility?.assets || []).filter((a: any) => a.isMandatory !== false).length} tệp bắt buộc
                            </span>
                          </div>

                          {(() => {
                            const mandatoryAssets = (acceptResponse?.assets || handoverEligibility?.assets || []).filter(
                              (a: any) => a.isMandatory !== false,
                            );
                            const allMandatoryDone =
                              mandatoryAssets.length > 0 &&
                              mandatoryAssets.every((a: any) => downloadedAssetIds.includes(a.assetId));

                            return (
                              <div className="space-y-2">
                                <button
                                  onClick={handleFinalizeHandover}
                                  disabled={!allMandatoryDone || isFinalizing}
                                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                                  <span>
                                    {isFinalizing
                                      ? "Đang lưu biên nhận & đóng phiên..."
                                      : "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên"}
                                  </span>
                                </button>

                                {!allMandatoryDone && (
                                  <p className="text-[10px] text-amber-800 text-center italic">
                                    (Vui lòng tải & giải mã toàn bộ {mandatoryAssets.length} tệp bắt buộc ở trên để kích hoạt nút xác nhận hoàn tất.)
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VERIFIER DESK & VERDICT FORM                            */}
        {/* ============================================================== */}
        {activeStep === "verdict" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#0B291E] flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-[#B88E4C]" />
                Biên Bản Thẩm Định Hồ Sơ Xác Minh (Verifier Audit Desk)
              </h3>
              <p className="text-xs text-[#66786E]">
                Thẩm định viên ghi nhận kết quả đối soát sau khi hoàn thành cuộc gọi video 1–1.
              </p>
            </div>

            <div className="bg-white border border-[#DCD9D0] rounded-2xl p-6 shadow-xs space-y-5">
              {/* Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#0B291E] uppercase tracking-wider">
                  Checklist Tiêu Chuẩn Thẩm Định Thực Tế:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-start gap-2.5 p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl cursor-pointer hover:bg-[#EFECE6] transition-all">
                    <input
                      type="checkbox"
                      checked={checklist.faceMatched}
                      onChange={(e) => setChecklist({ ...checklist, faceMatched: e.target.checked })}
                      className="mt-0.5 rounded text-[#B88E4C] focus:ring-[#B88E4C]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#0B291E]">1. Đối chiếu khuôn mặt</span>
                      <p className="text-[11px] text-[#66786E]">Khớp với ảnh trên CCCD/Hộ chiếu gốc.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl cursor-pointer hover:bg-[#EFECE6] transition-all">
                    <input
                      type="checkbox"
                      checked={checklist.challengeSpoken}
                      onChange={(e) => setChecklist({ ...checklist, challengeSpoken: e.target.checked })}
                      className="mt-0.5 rounded text-[#B88E4C] focus:ring-[#B88E4C]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#0B291E]">2. Đọc mã thử thách</span>
                      <p className="text-[11px] text-[#66786E]">
                        Đọc chính xác mã {challengeCode} phát sinh trên màn hình.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl cursor-pointer hover:bg-[#EFECE6] transition-all">
                    <input
                      type="checkbox"
                      checked={checklist.headTurned}
                      onChange={(e) => setChecklist({ ...checklist, headTurned: e.target.checked })}
                      className="mt-0.5 rounded text-[#B88E4C] focus:ring-[#B88E4C]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#0B291E]">3. Cử chỉ sống tự nhiên</span>
                      <p className="text-[11px] text-[#66786E]">
                        Quay đầu trái/phải theo yêu cầu, không phải video phát lại.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl cursor-pointer hover:bg-[#EFECE6] transition-all">
                    <input
                      type="checkbox"
                      checked={checklist.noDuress}
                      onChange={(e) => setChecklist({ ...checklist, noDuress: e.target.checked })}
                      className="mt-0.5 rounded text-[#B88E4C] focus:ring-[#B88E4C]"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-[#0B291E]">4. Không bị cưỡng ép</span>
                      <p className="text-[11px] text-[#66786E]">Tự nguyện, không có dấu hiệu đe dọa trong phòng.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Verdict Decision */}
              <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
                <label className="text-xs font-bold text-[#0B291E]">Phán quyết của Verifier:</label>
                <select
                  value={verdictOutcome}
                  onChange={(e) => setVerdictOutcome(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B291E] focus:ring-1 focus:ring-[#B88E4C]"
                >
                  <option value="PASS">✅ VERIFIED_MANUAL (Đạt - Xác minh thành công)</option>
                  <option value="REQUIRE_MORE_DOCS">📄 REQUIRE_MORE_DOCS (Yêu cầu nộp bổ sung giấy tờ)</option>
                  <option value="INCONCLUSIVE">⚠️ INCONCLUSIVE (Sự cố mạng / Cần lên lịch gọi lại)</option>
                  <option value="FAIL">❌ REJECTED (Bác bỏ - Nghi ngờ giả mạo hoặc người đóng giả)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0B291E]">Ghi chú đối chiếu pháp lý:</label>
                <textarea
                  rows={3}
                  value={verifierNotes}
                  onChange={(e) => setVerifierNotes(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-3 text-xs text-[#0B291E] focus:ring-1 focus:ring-[#B88E4C]"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmitVerdict}
                className="w-full py-3 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#B88E4C]" />
                Lưu Biên Bản & Đóng Phiên Xác Minh
              </button>

              {/* Saved Result Display */}
              {verdictResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-1.5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã lưu thành công kết quả: {verdictResult.verificationOutcome}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Biên bản đối soát được lưu vết bất biến trong Audit Log của Case:{" "}
                    <code className="bg-emerald-100 px-1 py-0.5 rounded">{caseId}</code>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3.1. BIÊN NHẬN BÀN GIAO BANNER KHI ĐÃ CẤP */}
      {finalReceipt && !showReceiptModal && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>LỄ BÀN GIAO ĐÃ HOÀN TẤT:</strong> Biên nhận số{" "}
              <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                {finalReceipt.receiptNumber}
              </code>{" "}
              đã được phát hành chính thức.
            </span>
          </div>
          <button
            onClick={() => setShowReceiptModal(true)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-xs"
          >
            Xem Biên Nhận
          </button>
        </div>
      )}

      {/* 3.2. BIÊN NHẬN BÀN GIAO DI SẢN SỐ MODAL (BƯỚC 7) */}
      {showReceiptModal && finalReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#B88E4C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#0B291E] uppercase tracking-wider">
                Biên Nhận Bàn Giao Di Sản Số
              </h3>
              <p className="text-xs text-[#66786E]">
                Xác nhận hoàn tất lễ bàn giao 7 bước trong phòng gọi video
              </p>
            </div>

            <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#EFECE6]">
                <span className="text-[#66786E]">Số biên nhận:</span>
                <span className="font-mono font-bold text-[#0B291E] bg-white border border-[#DCD9D0] px-2 py-0.5 rounded">
                  {finalReceipt.receiptNumber}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EFECE6]">
                <span className="text-[#66786E]">Thời gian nhận:</span>
                <strong className="text-[#0B291E]">
                  {new Date(finalReceipt.receivedAt).toLocaleString("vi-VN")}
                </strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EFECE6]">
                <span className="text-[#66786E]">Người thụ hưởng:</span>
                <strong className="text-[#0B291E]">{finalReceipt.beneficiaryName}</strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EFECE6]">
                <span className="text-[#66786E]">Tệp bắt buộc đã nhận:</span>
                <strong className="text-emerald-700 font-mono">
                  {finalReceipt.downloadedAssetsCount}/{finalReceipt.totalAssetsCount} tệp (100%)
                </strong>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#EFECE6]">
                <span className="text-[#66786E]">Trạng thái phiên khách:</span>
                <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold border border-red-200">
                  ĐÃ THU HỒI & ĐÓNG PHIÊN
                </span>
              </div>
              <div className="pt-1">
                <span className="text-[10px] text-[#66786E] block mb-1">Chữ ký số chứng thực (Digital Audit Signature):</span>
                <span className="font-mono text-[10px] bg-white border border-[#DCD9D0] p-1.5 rounded block break-all text-[#0B291E]">
                  {finalReceipt.digitalSignatureAudit}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
              <strong>Lưu ý:</strong> Biên nhận này ghi nhận việc nhận đầy đủ các tệp di sản số trong hệ thống. Phiên khách đã được thu hồi và phòng gọi sẽ đóng lại. Chỉ kết thúc phiên của người nhận này; hồ sơ có nhiều người thụ hưởng vẫn tiếp tục cho những người còn lại.
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  handleEndCall();
                }}
                className="w-full py-3 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4 text-[#B88E4C]" />
                <span>Hoàn Tất & Rời Phòng Gọi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER SECURITY NOTICE */}
      <div className="bg-[#FAF9F5] border-t border-[#DCD9D0] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#66786E] gap-2">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#B88E4C]" />
          <span>
            Ranh giới bảo mật: Video không được ghi hình (Zero Recording). Tuyệt đối không đọc passphrase qua cuộc gọi.
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#0B291E]">LegacyVault SRS v3.11.0 Policy</span>
      </div>
    </div>
  );
};
