'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface TOCItem {
  text: string;
  href: string;
  level?: 2 | 3;
}

interface FloatingTOCProps {
  items: TOCItem[];
  title?: string;
}

// Color system
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

// Constants
const SCROLL_THRESHOLD = 100;
const SCROLL_OFFSET = 150;
const EXPANDED_WIDTH = '240px';

// Hamburger Icon Component
function HamburgerIcon() {
  return (
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
  );
}

// TOC Item Component
function TOCItem({ item, isActive, colorClasses }: { 
  item: TOCItem; 
  isActive: boolean; 
  colorClasses: { active: string; hover: string } 
}) {
  const isNested = item.level === 3;
  
  return (
    <li>
      <a
        href={item.href}
        className={`block py-1 px-2 rounded text-sm transition-all duration-200 ${
          isNested ? 'ml-4' : ''
        } ${
          isActive
            ? `${colorClasses.active} font-medium`
            : `text-gray-600 dark:text-gray-300 ${colorClasses.hover}`
        }`}
      >
        {item.text}
      </a>
    </li>
  );
}

export function FloatingTOC({ items, title = "Contents" }: FloatingTOCProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [currentColor, setCurrentColor] = useState<Color>('green');

  const getRandomColor = (): Color => 
    COLORS[Math.floor(Math.random() * COLORS.length)];

  // Memoize section IDs to avoid recreating array on each scroll
  const sectionIds = useMemo(() => items.map(item => item.href.substring(1)), [items]);

  const findActiveSection = useCallback((scrollPosition: number) => {
    return sectionIds.find(sectionId => {
      const element = document.getElementById(sectionId);
      if (!element) return false;
      
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      return scrollPosition >= elementTop && scrollPosition < elementBottom;
    }) || '';
  }, [sectionIds]);

  // Combined scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Update visibility
      setIsVisible(scrollY > SCROLL_THRESHOLD);
      
      // Update active section
      const scrollPosition = scrollY + SCROLL_OFFSET;
      setActiveSection(findActiveSection(scrollPosition));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [findActiveSection]);

  const handleMouseEnter = () => {
    setIsExpanded(true);
    setCurrentColor(getRandomColor());
  };

  const handleMouseLeave = () => setIsExpanded(false);

  if (!isVisible) return null;

  const colorClasses = COLOR_CLASSES[currentColor];

  return (
    <div className="fixed top-20 left-4 md:left-8 z-50">
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'sm:w-60 md:w-72' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: isExpanded ? EXPANDED_WIDTH : 'auto',
          overflow: 'hidden'
        }}
      >
        <div className="p-2">
          <HamburgerIcon />
        </div>
        
        {isExpanded && (
          <div className="mt-2">
            <div className="max-h-[32rem] overflow-y-auto">
              <nav>
                <ul className="space-y-1 p-2">
                  {items.map((item, index) => {
                    const sectionId = item.href.substring(1);
                    const isActive = activeSection === sectionId;
                    
                    return (
                      <TOCItem
                        key={index}
                        item={item}
                        isActive={isActive}
                        colorClasses={colorClasses}
                      />
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