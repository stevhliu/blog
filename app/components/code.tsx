export const Code = ({ children }) => {
  return (
    <code
      className={`
        [p_&]:text-sm
        [p_&]:px-1
        [p_&]:py-0.5
        [p_&]:rounded-sm
        [p_&]:bg-[#dad4c8]
      `}
    >
      {children}
    </code>
  );
};
