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
  Copy,
  FileText,
  Lock,
  Mic,
  PhoneCall,
  PhoneOff,
  QrCode,
  Share2,
  ShieldAlert,
  ShieldCheck,
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

export const VideoVerificationTestbench: React.FC = () => {
  // Navigation Steps: 'prejoin' | 'call' | 'verdict'
  const [activeStep, setActiveStep] = useState<"prejoin" | "call" | "verdict">("prejoin");

  // Scenarios & Roles
  const [purpose, setPurpose] = useState<"OWNER_RESCUE" | "HANDOVER_VERIFICATION">("OWNER_RESCUE");
  const [userRole, setUserRole] = useState<"OWNER" | "VERIFIER">(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      const r = p.get("role");
      if (r === "VERIFIER" || r === "OWNER") return r;
    }
    return "OWNER";
  });

  // Case & Session IDs
  const [caseId] = useState<string>("c83f9872-4d2a-4318-b2a8-123456789abc");
  const [sessionId, setSessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      return p.get("session") || null;
    }
    return null;
  });

  const [copiedLink, setCopiedLink] = useState(false);

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

  // Verifier Checklist & Verdict
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

  // 4. Lấy Token & Vào cuộc gọi
  const handleJoinCall = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      stopLocalPreview();
      const currentSessionId = await ensureSessionCreated();
      const effectiveUserId =
        userRole === "VERIFIER" ? "22222222-2222-2222-2222-222222222222" : "11111111-1111-1111-1111-111111111111";

      const res = await axios.post(
        `${API_BASE}/api/video-sessions/${currentSessionId}/join-token?userId=${effectiveUserId}`,
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
          userRole === "VERIFIER" ? "22222222-2222-2222-2222-222222222222" : "11111111-1111-1111-1111-111111111111";
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
                <option value="OWNER">Chủ kho / Đương sự (Subject)</option>
                <option value="VERIFIER">Thẩm định viên (Verifier)</option>
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

      {/* 1.1. INVITE LINK BAR FOR 2ND PERSON */}
      <div className="bg-[#FAF9F5] border-b border-[#DCD9D0] px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#B88E4C] shrink-0" />
          <span className="font-bold text-[#0B291E]">Mời người thứ 2 vào phòng:</span>
          {sessionId ? (
            <span className="text-[#66786E]">
              Mã phòng: <code className="bg-white border border-[#DCD9D0] px-1.5 py-0.5 rounded text-[#0B291E] font-mono font-bold">{sessionId.slice(0, 8)}...</code>
            </span>
          ) : (
            <span className="text-[#66786E] italic">(Chưa có phòng, bấm tạo để lấy link mời)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {sessionId ? (
            <button
              onClick={() => {
                const otherRole = userRole === "OWNER" ? "VERIFIER" : "OWNER";
                const link = `${window.location.origin}/?session=${sessionId}&role=${otherRole}`;
                navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="px-3 py-1.5 bg-[#0B291E] hover:bg-[#14241C] text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#B88E4C]" />}
              <span>{copiedLink ? "Đã chép link mời!" : `Sao chép link mời (${userRole === "OWNER" ? "Thẩm định viên" : "Chủ kho"})`}</span>
            </button>
          ) : (
            <button
              onClick={async () => {
                const sid = await ensureSessionCreated();
                const otherRole = userRole === "OWNER" ? "VERIFIER" : "OWNER";
                const link = `${window.location.origin}/?session=${sid}&role=${otherRole}`;
                navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="px-3 py-1.5 bg-[#B88E4C] hover:bg-[#A07839] text-[#0B291E] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Đã chép link!" : "Tạo & Chép Link Mời"}</span>
            </button>
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

                <div className="pt-2 border-t border-[#EFECE6]">
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
        {/* TAB 2: LIVEKIT IN-CALL ROOM                                   */}
        {/* ============================================================== */}
        {activeStep === "call" && (
          <div className="space-y-4">
            {/* Top Call Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-[#DCD9D0] p-4 rounded-xl gap-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-[#0B291E]">
                    Phiên Xác Minh Đang Diễn Ra (Mã phòng: {joinTokenData?.roomName || "Đang kết nối"})
                  </h4>
                  <p className="text-[11px] text-[#66786E]">
                    Vai trò của bạn:{" "}
                    <strong>{userRole === "VERIFIER" ? "Thẩm định viên (Host)" : "Đương sự xuất trình hồ sơ"}</strong>
                  </p>
                </div>
              </div>

              {/* Challenge Code Widget on screen */}
              <div className="bg-[#FAF9F5] border border-[#B88E4C]/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 text-xs shadow-xs">
                <QrCode className="w-4 h-4 text-[#B88E4C]" />
                <div>
                  <span className="text-[10px] text-[#66786E] uppercase font-bold block">Mã Thử Thách Cử Chỉ:</span>
                  <span className="font-mono text-sm font-extrabold text-[#0B291E] tracking-wider">
                    {challengeCode}
                  </span>
                </div>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                Kết thúc & Sang Biên bản
              </button>
            </div>

            {/* Video Canvas Container */}
            <div className="bg-[#14241C] rounded-2xl overflow-hidden min-h-[460px] border border-white/10 shadow-lg relative flex items-center justify-center">
              {inCall && joinTokenData ? (
                <div className="w-full h-[460px] bg-black">
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
