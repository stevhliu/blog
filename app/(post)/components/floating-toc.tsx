'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
  text: string;
  href: string;
}

interface FloatingTOCProps {
  items: TOCItem[];
  title?: string;
}

const COLORS = ['green', 'blue', 'purple', 'pink', 'orange', 'teal', 'indigo', 'rose'] as const;
type Color = typeof COLORS[number];

const COLOR_CLASSES: Record<Color, { active: string; hover: string }> = {
  green: {
    active: 'text-green-400 bg-green-50 dark:bg-green-900/20',
    hover: 'hover:text-green-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
  },
  blue: {
    active: 'text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    hover: 'hover:text-blue-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  purple: {
    active: 'text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    hover: 'hover:text-purple-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
  },
  pink: {
    active: 'text-pink-400 bg-pink-50 dark:bg-pink-900/20',
    hover: 'hover:text-pink-400 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
  },
  orange: {
    active: 'text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    hover: 'hover:text-orange-400 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
  },
  teal: {
    active: 'text-teal-400 bg-teal-50 dark:bg-teal-900/20',
    hover: 'hover:text-teal-400 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20'
  },
  indigo: {
    active: 'text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
    hover: 'hover:text-indigo-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
  },
  rose: {
    active: 'text-rose-400 bg-rose-50 dark:bg-rose-900/20',
    hover: 'hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
  }
};

export function FloatingTOC({ items, title = "Contents" }: FloatingTOCProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [currentColor, setCurrentColor] = useState<Color>('green');

  const getRandomColor = (): Color => 
    COLORS[Math.floor(Math.random() * COLORS.length)];

  // Show TOC after scrolling down a bit
  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      const sections = items.map(item => item.href.substring(1));
      
      const activeSectionFound = sections.find(sectionId => {
        const element = document.getElementById(sectionId);
        if (!element) return false;
        
        const elementTop = element.offsetTop;
        const elementBottom = elementTop + element.offsetHeight;
        return scrollPosition >= elementTop && scrollPosition < elementBottom;
      }) || '';
      
      setActiveSection(activeSectionFound);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  if (!isVisible) return null;

  const colorClasses = COLOR_CLASSES[currentColor];

  return (
    <div className="fixed top-20 left-4 md:left-8 z-50">
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'sm:w-60 md:w-72' : ''}`}
        onMouseEnter={() => {
          setIsExpanded(true);
          setCurrentColor(getRandomColor());
        }}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          width: isExpanded ? '240px' : 'auto',
          overflow: 'hidden'
        }}
      >
        <div className="p-2">
          <svg
            className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        </div>
        
        {isExpanded && (
          <div className="mt-2">
            <div className="max-h-96 overflow-y-auto">
              <nav>
                <ul className="space-y-1 p-2">
                  {items.map((item, index) => {
                    const sectionId = item.href.substring(1);
                    const isActive = activeSection === sectionId;
                    
                    return (
                      <li key={index}>
                        <a
                          href={item.href}
                          className={`block py-1 px-2 rounded text-sm transition-all duration-200 ${
                            isActive
                              ? `${colorClasses.active} font-medium`
                              : `text-gray-600 dark:text-gray-300 ${colorClasses.hover}`
                          }`}
                        >
                          {item.text}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 