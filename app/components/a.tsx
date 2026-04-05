import Link from "next/link";

export function A({ children, className = "", href, ...props }) {
  const linkClass = `border-b text-[var(--color-blue)] border-[var(--color-rule)] transition-[border-color] duration-100 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:border-[var(--color-blue)] active:opacity-80 motion-reduce:active:opacity-100 ${className}`;
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
