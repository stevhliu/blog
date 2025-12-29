'use client';

import React from 'react';
import { motion } from 'motion/react';

interface AnimatedDashedLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeColor?: string;
  strokeWidth?: number;
  dashArray?: string;
  className?: string;
  reverse?: boolean;
}

export const AnimatedDashedLine = ({
  x1,
  y1,
  x2,
  y2,
  strokeColor = '#FBBF24',
  strokeWidth = 2,
  dashArray = '10,5',
  className = '',
  reverse = false
}: AnimatedDashedLineProps) => {
  // Calculate the length and angle of the line
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  
  // Create dashes manually
  const dashLength = 4;
  const gapLength = 3;
  const totalDashUnit = dashLength + gapLength;
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x1,
        top: y1,
        width: length,
        height: strokeWidth,
        transformOrigin: '0 0',
        transform: `rotate(${angle}deg)`,
        overflow: 'hidden',
        backgroundImage: `repeating-linear-gradient(
          to right,
          ${strokeColor} 0px,
          ${strokeColor} ${dashLength}px,
          transparent ${dashLength}px,
          transparent ${totalDashUnit}px
        )`,
        backgroundSize: `${totalDashUnit}px 100%`,
        animation: reverse ? 'dash-reverse 1s linear infinite' : 'dash 1s linear infinite'
      }}
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <style jsx>{`
        @keyframes dash {
          to {
            background-position: ${totalDashUnit}px 0;
          }
        }
        @keyframes dash-reverse {
          to {
            background-position: -${totalDashUnit}px 0;
          }
        }
      `}</style>
    </motion.div>
  );
}; 