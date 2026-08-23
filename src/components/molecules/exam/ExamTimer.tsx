"use client";

import { useState, useEffect, useRef } from "react";

interface ExamTimerProps {
  remainingSeconds: number;
  onTimeUp: () => void;
}

export default function ExamTimer({ remainingSeconds, onTimeUp }: ExamTimerProps) {
  const normalizedRemainingSeconds = Math.max(0, Math.ceil(Number(remainingSeconds) || 0));
  const [displaySeconds, setDisplaySeconds] = useState(normalizedRemainingSeconds);
  const [prevNormalized, setPrevNormalized] = useState(normalizedRemainingSeconds);

  // Use ref to avoid dependency issues with the callback
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Ensure onTimeUp fires at most once per timer run.
  const firedRef = useRef(false);
  const fireTimeUp = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    onTimeUpRef.current();
  };

  if (prevNormalized !== normalizedRemainingSeconds) {
    setPrevNormalized(normalizedRemainingSeconds);
    setDisplaySeconds(normalizedRemainingSeconds);
  }

  useEffect(() => {
    if (normalizedRemainingSeconds <= 0) {
      fireTimeUp();
      return;
    }

    firedRef.current = false;

    const endTime = Date.now() + normalizedRemainingSeconds * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(Math.ceil((endTime - now) / 1000), 0);

      if (diff <= 0) {
        clearInterval(timer);
        setDisplaySeconds(0);
        fireTimeUp();
      } else {
        setDisplaySeconds(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [normalizedRemainingSeconds]);

  const safeDisplaySeconds = Math.max(0, Math.ceil(Number(displaySeconds) || 0));
  const mins = Math.floor(safeDisplaySeconds / 60);
  const secs = safeDisplaySeconds % 60;
  const isLow = safeDisplaySeconds < 300; // Less than 5 minutes

  return (
    <div
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border-2 transition-colors ${
        isLow
          ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
          : "bg-blue-50 text-blue-600 border-blue-600/20"
      }`}
    >
      <span>Sisa waktu</span>
      <span className="font-mono">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}
