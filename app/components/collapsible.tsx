"use client";

import { useId, useState } from "react";
import { ChevronRight } from "lucide-react";

interface CollapsibleProps {
  trigger: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Collapsible({
  trigger,
  children,
  className = "",
  defaultOpen = false,
}: CollapsibleProps) {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen(prev => !prev);
  const chevronClassName = `w-4 h-4 text-gray-500 transition-transform duration-200 ${
    isOpen ? 'rotate-90' : ''
  }`;

  return (
    <div className={`rounded-lg -ml-4 ${className}`}>
      <button
        onClick={toggleOpen}
        className="w-full px-4 py-2 text-left font-medium rounded-t-lg transition-colors"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="flex items-center justify-between">
          {trigger}
          <ChevronRight className={chevronClassName} />
        </span>
      </button>
      {isOpen && (
        <div 
          id={contentId}
          className="p-4 rounded-b-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
} 