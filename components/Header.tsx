export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
        <span className="font-display text-lg tracking-tight text-ink">
          Direct<span className="text-signal">.</span>
        </span>
        <span className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft/70 sm:block">
          Career pages, not job boards
        </span>
      </div>
    </header>
  );
}
