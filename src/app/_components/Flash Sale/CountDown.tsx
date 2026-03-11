"use client";
import { useEffect, useState } from "react";

interface CountDownProps {
  initialSecondsLeft: number;
}

const CountDown = ({ initialSecondsLeft }: CountDownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(
    initialSecondsLeft > 0 ? initialSecondsLeft : 0,
  );

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center gap-1">
        <div className="bg-white shadow-sm border border-gray-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-gray-900 font-bold sm:text-lg text-base">
          {hours < 10 ? `0${hours}` : hours}
        </div>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Hours</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="bg-white shadow-sm border border-gray-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-gray-900 font-bold sm:text-lg text-base">
          {minutes < 10 ? `0${minutes}` : minutes}
        </div>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Mins</p>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="bg-white shadow-sm border border-gray-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-red-500 font-bold sm:text-lg text-base">
          {seconds < 10 ? `0${seconds}` : seconds}
        </div>
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Secs</p>
      </div>
    </div>
  );
};

export default CountDown;
