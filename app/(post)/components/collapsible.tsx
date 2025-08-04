"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface CollapsibleProps {
  trigger: string;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({ trigger, children, className = "" }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`rounded-lg -ml-4 ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left font-medium rounded-t-lg transition-colors"
      >
        <span className="flex items-center justify-between">
          {trigger}
          <ChevronRight 
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />
        </span>
      </button>
      {isOpen && (
        <div className="p-4 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
} 