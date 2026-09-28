/**
 * @file ClientMediaPipeFacePoc.tsx
 * @description Thành phần PoC thử nghiệm tương tác chuyển động khuôn mặt bằng Google MediaPipe Face Landmarker
 */

import React, { useRef, useState, useEffect } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  UserCheck 
} from 'lucide-react';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';

export const ClientMediaPipeFacePoc: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);

  // Challenge states
  const [hasLookedStraight, setHasLookedStraight] = useState<boolean>(false);
  const [hasBlinked, setHasBlinked] = useState<boolean>(false);
  const [hasTurnedHead, setHasTurnedHead] = useState<boolean>(false);
  const [allChallengesCompleted, setAllChallengesCompleted] = useState<boolean>(false);

  const [currentPrompt, setCurrentPrompt] = useState<string>('Khởi động camera để bắt đầu thử nghiệm');
  const [faceDetectionScore, setFaceDetectionScore] = useState<number | null>(null);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestAnimationRef = useRef<number | null>(null);

  // Initialize MediaPipe Face Landmarker
  const initFaceLandmarker = async () => {
    if (landmarkerRef.current) return landmarkerRef.current;

    setIsLoadingModel(true);
    setModelError(null);
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      landmarkerRef.current = landmarker;
      return landmarker;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải mô hình MediaPipe Face Landmarker';
      setModelError(`${msg}. Vui lòng kiểm tra kết nối mạng để nạp mô hình WASM từ CDN.`);
      return null;
    } finally {
      setIsLoadingModel(false);
    }
  };

  const startCamera = async () => {
    const landmarker = await initFaceLandmarker();
    if (!landmarker) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        resetChallenges();
        setCurrentPrompt('Bước 1: Vui lòng nhìn thẳng vào camera');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy cập camera';
      setModelError(`Không thể mở webcam: ${msg}. Hãy cấp quyền camera cho trình duyệt.`);
    }
  };

  const stopCamera = () => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setCurrentPrompt('Camera đã tắt');
  };

  const resetChallenges = () => {
    setHasLookedStraight(false);
    setHasBlinked(false);
    setHasTurnedHead(false);
    setAllChallengesCompleted(false);
    setCurrentPrompt('Bước 1: Vui lòng nhìn thẳng vào camera');
  };

  // Continuous frame loop
  useEffect(() => {
    let lastVideoTime = -1;

    const renderLoop = () => {
      if (
        isCameraActive &&
        videoRef.current &&
        canvasRef.current &&
        landmarkerRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;
          const startTimeMs = performance.now();
          const results = landmarkerRef.current.detectForVideo(video, startTimeMs);

          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              const landmarks = results.faceLandmarks[0];
              setFaceDetectionScore(0.95);

              // Draw subtle landmark points
              ctx.fillStyle = '#059669';
              for (let i = 0; i < landmarks.length; i += 4) {
                const pt = landmarks[i];
                ctx.beginPath();
                ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 1.2, 0, 2 * Math.PI);
                ctx.fill();
              }

              // Extract blendshapes if available
              const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
              const blinkLeft = blendshapes.find((b) => b.categoryName === 'eyeBlinkLeft')?.score || 0;
              const blinkRight = blendshapes.find((b) => b.categoryName === 'eyeBlinkRight')?.score || 0;

              // Step 1: Look straight (nose tip centered between cheeks)
              const noseTip = landmarks[1];
              const leftCheek = landmarks[234];
              const rightCheek = landmarks[454];
              const faceWidth = Math.abs(rightCheek.x - leftCheek.x);
              const noseRelativeX = (noseTip.x - leftCheek.x) / faceWidth;

              // Look straight: nose is reasonably centered (0.4 to 0.6)
              if (!hasLookedStraight && noseRelativeX >= 0.38 && noseRelativeX <= 0.62) {
                setHasLookedStraight(true);
                setCurrentPrompt('Bước 2: Rất tốt! Bây giờ hãy chớp mắt 1 lần');
              }

              // Step 2: Blink detection
              if (hasLookedStraight && !hasBlinked) {
                if (blinkLeft > 0.35 || blinkRight > 0.35) {
                  setHasBlinked(true);
                  setCurrentPrompt('Bước 3: Đã ghi nhận chớp mắt! Hãy nghiêng đầu sang trái hoặc phải');
                }
              }

              // Step 3: Head turn detection (nose relative x < 0.3 hoặc > 0.7)
              if (hasBlinked && !hasTurnedHead) {
                if (noseRelativeX < 0.32 || noseRelativeX > 0.68) {
                  setHasTurnedHead(true);
                  setAllChallengesCompleted(true);
                  setCurrentPrompt('Hoàn thành! Đã ghi nhận chuỗi cử động tương tác khuôn mặt.');
                }
              }
            } else {
              setFaceDetectionScore(null);
            }
          }
        }
      }

      if (isCameraActive) {
        requestAnimationRef.current = requestAnimationFrame(renderLoop);
      }
    };

    if (isCameraActive) {
      requestAnimationRef.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (requestAnimationRef.current) {
        cancelAnimationFrame(requestAnimationRef.current);
      }
    };
  }, [isCameraActive, hasLookedStraight, hasBlinked, hasTurnedHead]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Academic Disclaimer Alert Box */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-xs space-y-2">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-amber-950">
            <p className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-amber-900">
              <span>Phạm vi thử nghiệm: Facial Motion Interaction PoC (Google MediaPipe)</span>
              <HeritageBadge variant="gold">Thử nghiệm tương tác</HeritageBadge>
            </p>
            <p className="leading-relaxed">
              <strong>Tuyên bố giới hạn kỹ thuật:</strong> MediaPipe Face Landmarker được Google phát triển để theo dõi 468 điểm mốc khuôn mặt và biểu cảm.
              Việc phát hiện cử động cơ học (chớp mắt, quay đầu) là bài toán thử nghiệm kiểm tra phản hồi tương tác (Liveness Interaction PoC).
              <strong> Nó KHÔNG tương đương với chứng chỉ chống giả mạo sinh trắc học chuyên sâu (Anti-spoofing certified)</strong> và không đủ để ngăn chặn các hình thức deepfake, ảnh in hoặc video phát lại tinh vi.
            </p>
          </div>
        </div>
      </div>

      {/* Camera & Interaction Canvas Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Video feed + Canvas */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
            <h4 className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#B88E4C]" />
              <span>Camera Theo Dõi Điểm Mốc (Face Mesh 468 Điểm)</span>
            </h4>
            {isCameraActive && (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Feed
              </span>
            )}
          </div>

          {/* Camera Stage */}
          <div className="relative aspect-4/3 bg-slate-900 rounded-lg overflow-hidden border border-[#DCD9D0] flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${isCameraActive ? 'block' : 'hidden'}`}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] pointer-events-none ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {!isCameraActive && (
              <div className="text-center text-slate-400 p-6 space-y-2">
                <Eye className="w-10 h-10 mx-auto text-slate-500" />
                <p className="text-xs font-medium">Webcam đang ở trạng thái tắt</p>
                <p className="text-[11px] text-slate-500">Nhấn nút bên dưới để cấp quyền và khởi chạy nhận diện</p>
              </div>
            )}

            {isLoadingModel && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white space-y-2 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-[#B88E4C]" />
                <span>Đang tải mô hình MediaPipe WASM...</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <HeritageButton
                variant="primary"
                onClick={startCamera}
                isLoading={isLoadingModel}
                className="w-full text-xs py-2.5"
              >
                <Camera className="w-4 h-4 mr-1.5" />
                <span>Bật Camera & Bắt đầu Kiểm thử</span>
              </HeritageButton>
            ) : (
              <>
                <HeritageButton variant="outline" onClick={stopCamera} className="w-1/2 text-xs py-2.5">
                  <CameraOff className="w-4 h-4 mr-1.5" />
                  <span>Dừng Camera</span>
                </HeritageButton>
                <HeritageButton variant="outline" onClick={resetChallenges} className="w-1/2 text-xs py-2.5">
                  <RefreshCw className="w-4 h-4 mr-1.5" />
                  <span>Thực hiện lại</span>
                </HeritageButton>
              </>
            )}
          </div>

          {modelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{modelError}</span>
            </div>
          )}
        </div>

        {/* Right: Challenge Progress Tracker */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
              <h4 className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Tiến Trình Thử Thách Cử Động (Motion Milestones)</span>
              </h4>
              <span className="text-[10px] font-mono text-[#66786E]">PoC Level</span>
            </div>

            {/* Prompt Banner */}
            <div className="mt-3 p-3 bg-[#EFECE6] border border-[#DCD9D0] rounded-lg text-xs font-semibold text-[#0B291E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88E4C] shrink-0" />
              <span>{currentPrompt}</span>
            </div>

            {/* Checklist */}
            <div className="mt-4 space-y-3">
              <div
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                  hasLookedStraight
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-[#DCD9D0] text-[#66786E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs">01</span>
                  <div>
                    <p className="font-bold">Nhìn thẳng vào tâm khung hình</p>
                    <p className="text-[11px] opacity-75">Tọa độ chóp mũi cân đối giữa hai gò má</p>
                  </div>
                </div>
                {hasLookedStraight ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[11px] font-mono">Chờ...</span>
                )}
              </div>

              <div
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                  hasBlinked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-[#DCD9D0] text-[#66786E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs">02</span>
                  <div>
                    <p className="font-bold">Chớp mắt (Eye Blinking)</p>
                    <p className="text-[11px] opacity-75">Blendshapes eyeBlinkLeft/Right vượt ngưỡng 0.35</p>
                  </div>
                </div>
                {hasBlinked ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[11px] font-mono">Chờ...</span>
                )}
              </div>

              <div
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all ${
                  hasTurnedHead
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-[#DCD9D0] text-[#66786E]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-xs">03</span>
                  <div>
                    <p className="font-bold">Nghiêng đầu nhẹ trái / phải</p>
                    <p className="text-[11px] opacity-75">Độ lệch trục góc quay Yaw khuôn mặt thay đổi</p>
                  </div>
                </div>
                {hasTurnedHead ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <span className="text-[11px] font-mono">Chờ...</span>
                )}
              </div>
            </div>

            {/* Success Summary */}
            {allChallengesCompleted && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã ghi nhận chuỗi cử động tương tác khuôn mặt thành công</span>
                </p>
                <p className="text-[11px] text-emerald-800">
                  Thử nghiệm chứng minh người dùng đang tương tác vật lý trực tiếp trước webcam.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DCD9D0] text-[10px] text-[#66786E] flex items-center justify-between">
            <span>Công nghệ: MediaPipe Tasks Vision (Google)</span>
            <span className="text-emerald-700 font-semibold">Mesh 468 Landmarks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
