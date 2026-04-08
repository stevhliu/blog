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

  return (
    <div className={`rounded-lg -ml-4 ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full rounded-t-lg px-4 py-2 text-left font-medium transition-[color,background-color,transform] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[var(--color-surface)] active:scale-[0.97] motion-reduce:transition-[color,background-color] motion-reduce:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue)]"
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="flex items-center justify-between">
          {trigger}
          <ChevronRight
            aria-hidden="true"
            className={`w-4 h-4 shrink-0 text-gray-500 transition-transform duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={contentId}
        className="grid transition-[grid-template-rows] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-4 rounded-b-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
