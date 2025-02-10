export const Callout = ({ emoji = null, text = null, children }) => (
  <div className="bg-emerald-50 dark:bg-[#333] dark:text-gray-300 flex items-start p-3 my-6 text-base text-emerald-400">
    <span className="block w-6 text-center mr-2 scale-[1.2]">{emoji}</span>
    <span className="block grow">{text ?? children}</span>
  </div>
);
