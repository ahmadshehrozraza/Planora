"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { PlanoraWheel } from "./planora-wheel";

import { Inter, Outfit, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

interface PlanoraLogoProps {
  className?: string;
  wheelColor?: string;
  wheelSize?: number;
  wheelHandWidth?: number;
  wheelHandHeight?: number;
  wheelDuration?: string;
  textColor?: string;
  size?: number;
  animateText?: boolean;
  fontFamily?: "inter" | "outfit" | "poppins" | "system"; 
  fontWeight?: string;
  hideText?: boolean;
}

export const PlanoraLogo: React.FC<PlanoraLogoProps> = ({
  className,
  wheelColor = "bg-blue-600",
  wheelSize,
  wheelHandHeight,
  wheelHandWidth,
  wheelDuration,
  textColor = "text-blue-600",
  size = 36,
  animateText = true,
  fontFamily = "outfit",
  fontWeight = "font-semibold",
  hideText = false, 
}) => {
  
  const textSizeStyle = {
    fontSize: `${size * 0.75}px`, 
    lineHeight: `${size}px`,
  };

  const fontClass = 
    fontFamily === "inter" ? inter.className :
    fontFamily === "outfit" ? outfit.className :
    fontFamily === "poppins" ? poppins.className :
    ""; 

  return (
    <div className={cn("flex items-center select-none group/logo cursor-pointer", className)}>

      <PlanoraWheel
        size={wheelSize}
        color={wheelColor}
        handHeight={wheelHandHeight}
        handWidth={wheelHandWidth || Math.max(2, (wheelSize || size) * 0.12)} 
        duration={wheelDuration || "15s"}
        className="shrink-0" 
      />
      <div 
        className={cn(
          "relative flex items-center transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
          hideText ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
        )}
      >
        <span
          className={cn(
            fontClass, 
            fontWeight, 
            "tracking-tight transition-transform duration-300 group-hover/logo:scale-105",
            textColor,
            fontFamily === "poppins" && "tracking-tighter" 
          )}
          style={{
            ...textSizeStyle,
            animation: animateText ? "text-breathe 4s ease-in-out infinite" : "none",
          }}
        >
          Planora
        </span>

        {animateText && (
          <style>{`
            @keyframes text-breathe {
              0%, 100% {
                opacity: 1;
                filter: drop-shadow(0 0 0px transparent);
              }
              50% {
                opacity: 0.85;
                filter: drop-shadow(0 0 8px currentColor);
              }
            }
          `}</style>
        )}
      </div>
      
    </div>
  );
};