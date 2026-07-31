export const Code = ({ children }) => {
  return (
    <code
      className={`
        font-mono
        [:is(p,li)_&]:text-sm
        [:is(p,li)_&]:px-1.5
        [:is(p,li)_&]:py-0.5
        [:is(p,li)_&]:rounded-md
        [:is(p,li)_&]:bg-[var(--color-code-bg)]
        [:is(p,li)_&]:border
        [:is(p,li)_&]:border-[var(--color-code-border)]
      `}
    >
      {children}
    </code>
  );
};
