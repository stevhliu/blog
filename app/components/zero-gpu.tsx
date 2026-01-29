export function ZeroGPU() {
  return (
    <span className="inline-flex items-center align-text-bottom">
      <span className="relative inline-block px-2 py-0.5 text-xs font-semibold">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 60 20"
          preserveAspectRatio="none"
        >
          <rect
            width="54"
            height="18"
            rx="3"
            transform="matrix(1 0 -.27564 .96126 6 1)"
            fill="currentColor"
            className="text-gray-200 dark:text-gray-800"
          />
        </svg>
        <span className="relative text-gray-600 dark:text-gray-400">ZeroGPU</span>
      </span>
    </span>
  );
}
