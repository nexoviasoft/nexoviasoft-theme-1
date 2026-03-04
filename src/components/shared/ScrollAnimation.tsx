"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";

interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: string;
  delay?: number;
}

const ScrollAnimation = ({
  children,
  className,
  animation = "animate__fadeInUp",
  delay = 0,
}: ScrollAnimationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-opacity duration-500",
        isVisible ? `animate__animated ${animation}` : "opacity-0",
        className
      )}
      style={{
        animationDelay: isVisible ? `${delay}s` : "0s",
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimation;
