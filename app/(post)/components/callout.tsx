interface CalloutProps {
  text?: string | null;
  children?: React.ReactNode;
  type?: 'default' | 'tip' | 'warning';
}

const CALLOUT_STYLES = {
  default: {
    container: 'bg-emerald-50 dark:bg-[#333] dark:text-gray-300',
    text: 'text-emerald-500'
  },
  tip: {
    container: 'bg-green-50 dark:bg-green-900/20 dark:text-gray-300',
    text: 'text-green-400 dark:text-green-400'
  },
  warning: {
    container: 'bg-rose-50 dark:bg-rose-900/20 dark:text-gray-300',
    text: 'text-rose-600 dark:text-rose-400'
  }
} as const;

export const Callout = ({ text = null, children, type = 'default' }: CalloutProps) => {
  const styles = CALLOUT_STYLES[type];
  
  return (
    <div className={`${styles.container} flex items-start p-3 my-6 text-base ${styles.text} border border-transparent rounded-lg`}>
      {children}
      {text && <span className="block grow">{text}</span>}
    </div>
  );
};

export const Tip = ({ text = null, children }: Omit<CalloutProps, 'type' | 'emoji'>) => (
  <Callout type="tip">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb-icon lucide-lightbulb w-4 h-4 flex-shrink-0 mr-2 mt-1">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
    <div className="block grow">{text ?? children}</div>
  </Callout>
);

export const Warning = ({ text = null, children }: Omit<CalloutProps, 'type'>) => (
  <Callout type="warning">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert-icon lucide-circle-alert w-4 h-4 flex-shrink-0 mr-2 mt-1">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
    <div className="block grow">{text ?? children}</div>
  </Callout>
);
