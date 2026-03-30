'use client';

import { useState, useEffect, useCallback, useMemo, useRef, startTransition } from 'react';

interface TOCItem {
  text: string;
  href: string;
  level?: 2 | 3;
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

const SCROLL_THRESHOLD = 100;
const SCROLL_OFFSET = 150;
const EXPANDED_WIDTH = '240px';

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 text-gray-500 transition-[color] duration-150"
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
        className={`block py-1 px-2 rounded text-sm transition-[color,background-color] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] ${
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
  const offsetCacheRef = useRef<Map<string, { top: number; bottom: number }>>(new Map());

  const getRandomColor = (): Color => 
    COLORS[Math.floor(Math.random() * COLORS.length)];

  const sectionIds = useMemo(() => items.map(item => item.href.substring(1)), [items]);

  const rebuildOffsetCache = useCallback(() => {
    const cache = new Map<string, { top: number; bottom: number }>();
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        cache.set(id, { top: el.offsetTop, bottom: el.offsetTop + el.offsetHeight });
      }
    }
    offsetCacheRef.current = cache;
  }, [sectionIds]);

  const findActiveSection = useCallback((scrollPosition: number) => {
    const cache = offsetCacheRef.current;
    return sectionIds.find(id => {
      const bounds = cache.get(id);
      if (!bounds) return false;
      return scrollPosition >= bounds.top && scrollPosition < bounds.bottom;
    }) || '';
  }, [sectionIds]);

  useEffect(() => {
    rebuildOffsetCache();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      startTransition(() => {
        setIsVisible(scrollY > SCROLL_THRESHOLD);
        setActiveSection(findActiveSection(scrollY + SCROLL_OFFSET));
      });
    };

    const handleResize = () => rebuildOffsetCache();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [findActiveSection, rebuildOffsetCache]);

  const toggle = () => {
    setIsExpanded(prev => {
      if (!prev) setCurrentColor(getRandomColor());
      return !prev;
    });
  };

  const handleMouseEnter = () => {
    setIsExpanded(true);
    setCurrentColor(getRandomColor());
  };

  const handleMouseLeave = () => setIsExpanded(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
    }
  };

  if (!isVisible) return null;

  const colorClasses = COLOR_CLASSES[currentColor];

  return (
    <div className="fixed top-20 left-4 md:left-8 z-50">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ width: isExpanded ? EXPANDED_WIDTH : 'auto', overflow: 'hidden' }}
        className="transition-[width,opacity] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)]"
      >
        <button
          onClick={toggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isExpanded}
          aria-label="Table of contents"
          className="p-2 rounded-lg"
        >
          <HamburgerIcon />
        </button>
        
        {isExpanded && (
          <div className="mt-2">
            <div className="max-h-[32rem] overflow-y-auto">
              <nav aria-label="Table of contents">
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