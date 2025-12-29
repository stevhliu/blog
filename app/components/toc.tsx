'use client';

import { useState } from 'react';

interface TOCItem {
  text: string;
  href: string;
}

interface TOCProps {
  items: TOCItem[];
  title?: string;
}

export function TOC({ items, title = "table of contents" }: TOCProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="my-8 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3 transition-colors flex items-center justify-between"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </span>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      
      {isExpanded && (
        <nav className="py-3">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors block py-1"
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
} 