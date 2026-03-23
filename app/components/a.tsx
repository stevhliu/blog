import Link from "next/link";

export function A({ children, className = "", href, ...props }) {
  const linkClass = `border-b text-gray-600 border-gray-300 transition-[border-color] duration-100 hover:border-gray-600 dark:text-white dark:border-gray-500 dark:hover:border-white ${className}`;
  const externalProps = props.target === "_blank" ? { rel: "noopener noreferrer", ...props } : props;

  if (!href || href[0] === "#") {
    return (
      <a href={href || "#"} className={linkClass} {...externalProps}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClass} {...externalProps}>
      {children}
    </Link>
  );
}
