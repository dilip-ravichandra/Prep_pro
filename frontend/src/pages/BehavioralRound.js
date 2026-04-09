import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { behavioralAPI } from '../api/client';
import { useResults } from '../context/ResultsContext';
import { Orb, ProgressBar, ProgressDots, Spinner } from '../components/UI';

const DEFAULT_LIMIT_SECONDS = 120;

function formatTime(sec) {
  const s = Math.max(0, sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export default function BehavioralRound() {
  const navigate = useNavigate();
  const { saveResult } = useResults();

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_LIMIT_SECONDS);
  const [cameraError, setCameraError] = useState('');
  const [warning, setWarning] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [submittingAll, setSubmittingAll] = useState(false);

  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const [resultsByQuestion, setResultsByQuestion] = useState({});
  const [preRecordingCountdown, setPreRecordingCountdown] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const faceIntervalRef = useRef(null);
  const faceApiRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const totalMsRef = useRef(0);
  const faceDetectedMsRef = useRef(0);
  const missingMsRef = useRef(0);
  const lookingAwayMsRef = useRef(0);

  const question = questions[questionIndex];
  const questionLimit = Math.max(60, Math.min(120, Number(question?.videoDurationSeconds || DEFAULT_LIMIT_SECONDS)));

  useEffect(() => {
    const load = async () => {
      setLoadingQuestions(true);
      try {
        const qRes = await behavioralAPI.getQuestions();
        const data = qRes.data?.data || [];
        setQuestions(data);
      } catch {
        setError('Failed to load behavioral questions.');
      } finally {
        setLoadingQuestions(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadFaceApiScript = () => new Promise((resolve, reject) => {
      if (window.faceapi) return resolve(window.faceapi);

      const existing = document.querySelector('script[data-faceapi="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.faceapi));
        existing.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;
      script.dataset.faceapi = 'true';
      script.onload = () => resolve(window.faceapi);
      script.onerror = reject;
      document.body.appendChild(script);
    });

    const loadFaceModels = async () => {
      try {
        const api = await loadFaceApiScript();
        if (!api) throw new Error('face-api unavailable');
        faceApiRef.current = api;
        await api.nets.tinyFaceDetector.loadFromUri('/models');
        if (mounted) setFaceModelLoaded(true);
      } catch {
        if (mounted) {
          setFaceModelLoaded(false);
          setWarning('Face detection model not found in /public/models. Suspicion checks may be limited.');
        }
      }
    };
    loadFaceModels();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setTimeLeft(questionLimit);
  }, [questionLimit, questionIndex]);

  useEffect(() => {
    return () => {
      stopRecordingInternal();
      stopStream();
    };
  }, []);

  const completionMap = useMemo(() => {
    const map = {};
    Object.keys(resultsByQuestion).forEach((k) => { map[k] = true; });
    return map;
  }, [resultsByQuestion]);

  const ensureCamera = async () => {
    if (streamRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError('');
      return true;
    } catch {
      setCameraError('Camera/Microphone access denied. Please allow permission and retry.');
      return false;
    }
  };

  const stopStream = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const stopFaceCheckLoop = () => {
    if (faceIntervalRef.current) {
      clearInterval(faceIntervalRef.current);
      faceIntervalRef.current = null;
    }
  };

  const stopTimerLoop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopCountdownTimer = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  };

  const stopRecordingInternal = () => {
    stopTimerLoop();
    stopFaceCheckLoop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const startFaceCheckLoop = () => {
    stopFaceCheckLoop();
    lookingAwayMsRef.current = 0;
    
    faceIntervalRef.current = setInterval(async () => {
      totalMsRef.current += 500;
      if (!faceModelLoaded || !videoRef.current) {
        faceDetectedMsRef.current += 500;
        return;
      }

      try {
        const api = faceApiRef.current;
        if (!api) {
          faceDetectedMsRef.current += 500;
          return;
        }
        const detected = await api.detectSingleFace(videoRef.current, new api.TinyFaceDetectorOptions());
        if (detected) {
          faceDetectedMsRef.current += 500;
          lookingAwayMsRef.current = 0;
          setWarning('');
        } else {
          lookingAwayMsRef.current += 500;
          setWarning(`⚠️ LOOK AT CAMERA! (Not detected: ${Math.round(lookingAwayMsRef.current / 1000)}s) - Suspicious activity flagged!`);
        }
      } catch {
        setWarning('Face check failed. Please keep your face visible and look at camera.');
      }
    }, 500);
  };

  const startRecording = async () => {
    if (resultsByQuestion[question?.id]) return;
    setError('');
    setPreRecordingCountdown(5);

    const ready = await ensureCamera();
    if (!ready) return;

    // 5 second pre-recording countdown with camera instruction
    countdownTimerRef.current = setInterval(() => {
      setPreRecordingCountdown((prev) => {
        if (prev <= 1) {
          stopCountdownTimer();
          beginActualRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginActualRecording = async () => {
    try {
      totalMsRef.current = 0;
      faceDetectedMsRef.current = 0;
      missingMsRef.current = 0;
      lookingAwayMsRef.current = 0;
      chunksRef.current = [];
      setUploadProgress(0);
      setTimeLeft(questionLimit);
      setWarning('');

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = handleRecordedBlob;
      mediaRecorder.start(1000);
      setRecording(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecordingInternal();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      startFaceCheckLoop();
    } catch {
      setError('Unable to start recording.');
    }
  };

  const stopRecording = () => {
    stopRecordingInternal();
  };

  const handleRecordedBlob = async () => {
    if (!chunksRef.current.length) {
      setError('No video captured. Please retry.');
      return;
    }

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const file = new File([blob], `behavioral-${Date.now()}.webm`, { type: 'video/webm' });

    const facePresenceScore = totalMsRef.current > 0
      ? Math.round((faceDetectedMsRef.current / totalMsRef.current) * 100)
      : 0;

    const lookingAwaySeconds = Math.round(lookingAwayMsRef.current / 1000);
    const suspiciousByMissing = missingMsRef.current > 5000;
    const suspiciousByLookingAway = lookingAwaySeconds > 5;
    const isSuspicious = suspiciousByMissing || suspiciousByLookingAway || facePresenceScore < 50;

    const form = new FormData();
    form.append('video', file);
    form.append('questionId', String(question?.id ?? questionIndex));
    form.append('facePresenceScore', String(facePresenceScore));
    form.append('lookingAwaySeconds', String(lookingAwaySeconds));
    form.append('suspiciousActivity', String(isSuspicious));

    try {
      setUploading(true);
      const res = await behavioralAPI.submitVideo(form, (evt) => {
        if (!evt.total) return;
        setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      });

      const payload = res.data?.data;
      setResultsByQuestion((prev) => ({
        ...prev,
        [question?.id ?? questionIndex]: {
          ...payload,
          facePresenceScore,
          suspicious: payload?.suspicious || isSuspicious,
          lookingAwaySeconds,
        },
      }));
    } catch (e) {
      setError(e?.response?.data?.message || 'Upload/evaluation failed. Please retry.');
    } finally {
      setUploading(false);
    }
  };

  const nextQuestion = () => {
    if (questionIndex < questions.length - 1) setQuestionIndex((q) => q + 1);
  };

  const finishRound = () => {
    const entries = Object.values(resultsByQuestion);
    if (!entries.length) return;

    setSubmittingAll(true);
    const avg = Math.round(entries.reduce((sum, s) => sum + (s.finalScore || 0), 0) / entries.length);
    const result = {
      percentage: avg,
      pct: avg,
      answered: entries.length,
      total: questions.length,
      grade: avg >= 85 ? 'A+' : avg >= 70 ? 'B+' : avg >= 55 ? 'C+' : 'D',
    };

    saveResult('behavioral', result);
    navigate('/behavioral/result', { state: result });
    setSubmittingAll(false);
  };

  if (loadingQuestions) {
    return <div style={{ padding: 50, textAlign: 'center' }}><Spinner /></div>;
  }

  if (!questions.length) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No behavioral questions available</h2>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentResult = resultsByQuestion[question?.id ?? questionIndex];

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', padding: 22, position: 'relative', overflow: 'hidden' }}>
      <Orb color="#ec4899" size={200} left="-50px" top="-50px" opacity={0.08} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'Orbitron,sans-serif', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#ec4899,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🎬 Behavioral Video Round</h1>
          <p style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)' }}>Face verification + AI evaluation</p>
        </div>
        <ProgressDots total={questions.length} current={questionIndex} answered={completionMap} color="#ec4899" />
      </div>
      <ProgressBar pct={((questionIndex + 1) / questions.length) * 100} color="linear-gradient(90deg,#ec4899,#f59e0b)" />

      <div style={{ maxWidth: 760, margin: '18px auto 0' }}>
        <div className="glass-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span>Question {questionIndex + 1} of {questions.length}</span>
            <span style={{ color: recording ? '#ef4444' : '#e2e8f0' }}>{recording ? 'REC ' : ''}{formatTime(timeLeft)} / {formatTime(questionLimit)}</span>
          </div>
          <p style={{ fontSize: 16, marginBottom: 14 }}>{question?.question}</p>

          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: '#020617', marginBottom: 12 }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 320, objectFit: 'cover' }} />
            {!streamRef.current && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(226,232,240,0.6)' }}>
                Camera preview will appear here
              </div>
            )}
            {preRecordingCountdown > 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#ec4899', marginBottom: 16 }}>{preRecordingCountdown}</div>
                <div style={{ fontSize: 18, color: '#f59e0b', textAlign: 'center', padding: '0 20px' }}>📷 Look at the camera!</div>
                <div style={{ fontSize: 14, color: 'rgba(226,232,240,0.7)', marginTop: 8, textAlign: 'center' }}>Recording starts in {preRecordingCountdown} seconds</div>
              </div>
            )}
          </div>

          {cameraError && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{cameraError}</div>}
          {warning && <div style={{ color: '#f59e0b', fontSize: 12, marginBottom: 8 }}>{warning}</div>}
          {error && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 8 }}>{error}</div>}

          {uploading && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, marginBottom: 6 }}>Uploading & analyzing... {uploadProgress}%</div>
              <ProgressBar pct={uploadProgress} color="#00f5ff" />
            </div>
          )}

          {currentResult && (
            <div style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Score: <strong>{Math.round(currentResult.finalScore || 0)}%</strong></div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Face Presence: <strong>{Math.round(currentResult.facePresenceScore || 0)}%</strong></div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>Status: <strong style={{ color: currentResult.suspicious ? '#f59e0b' : '#10b981' }}>{currentResult.suspicious ? 'Suspicious' : 'Clear'}</strong></div>
              {currentResult.suggestions?.length > 0 && <div style={{ fontSize: 12 }}>Tip: {currentResult.suggestions[0]}</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {!recording && !currentResult && (
              <button className="btn btn-red" onClick={startRecording} disabled={uploading}>🔴 Start Recording</button>
            )}
            {recording && (
              <button className="btn btn-red" onClick={stopRecording}>⏹ Stop Recording</button>
            )}

            {currentResult && questionIndex < questions.length - 1 && (
              <button className="btn btn-primary" onClick={nextQuestion}>Next →</button>
            )}

            {currentResult && questionIndex === questions.length - 1 && (
              <button className="btn btn-primary" onClick={finishRound} disabled={submittingAll}>{submittingAll ? <Spinner size={14} /> : 'Finish Round'}</button>
            )}

            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} disabled={recording || uploading}>Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
