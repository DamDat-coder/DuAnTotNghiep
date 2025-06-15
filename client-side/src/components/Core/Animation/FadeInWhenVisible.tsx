// components/Core/Animation/FadeInWhenVisible.tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function FadeInWhenVisible({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out transform",
        isVisible
          ? "opacity-100 translate-y-0 scale-100 blur-0"
          : "opacity-0 translate-y-10 scale-95 blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
