import React from "react";
import { cn } from "@/lib/utils";

interface PlanoraLogoProps {
  className?: string;
  color?: string;
  size?: number;
  handWidth?: number;
  handHeight?: number;
  duration?: string;
}

export const PlanoraLogo: React.FC<PlanoraLogoProps> = ({ 
  className,
  color = "bg-blue-600",
  size = 200,
  handWidth = 6,
  handHeight,
  duration = "20s"
}) => {

  const hands = Array.from({ length: 8 });
  const calculatedHeight = handHeight || size / 4; 

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full animate-spin",
        className
      )}
      style={{ 
        width: size, 
        height: size,
        animationDuration: duration,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite"
      }}
    >

      {hands.map((_, i) => {
        const angle = (360 / hands.length) * i;
        return (
          <div
            key={i}
            className={cn("absolute rounded-full", color)} 
            style={{
              width: `${handWidth}px`,
              height: `${calculatedHeight}px`,
              left: "50%",
              top: "50%",
              transformOrigin: "bottom center",
              transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-${size * 0.1}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default PlanoraLogo;