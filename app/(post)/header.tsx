export function Header({ title }: { title: string | null }) {
  if (title == null) return null;

  return (
    <header className="mb-0">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text)] text-balance">
        {title}
      </h1>

      <div className="mt-16 md:mt-[20vh] mb-0 h-px bg-[var(--color-rule)]" />
    </header>
  );
}
