export const Code = ({ children }) => {
  return (
    <code
      className={`
        [:is(p,li)_&]:text-sm
        [:is(p,li)_&]:px-1
        [:is(p,li)_&]:py-0.5
        [:is(p,li)_&]:rounded-sm
        [:is(p,li)_&]:bg-[#dad4c8]
      `}
    >
      {children}
    </code>
  );
};
