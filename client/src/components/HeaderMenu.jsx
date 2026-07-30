import { useState } from 'react';

// §13: collapse the locale/currency switcher and sign out into a menu below
// sm (640px) — the header's utility controls don't fit a narrow viewport
// inline the way they do in the desktop mockups.
export default function HeaderMenu({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="hidden items-center gap-4 sm:flex">{children}</div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-ink sm:hidden"
        aria-label="menu"
      >
        ☰
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 flex flex-col gap-3 border border-hairline bg-paper p-4 sm:hidden">
          {children}
        </div>
      )}
    </div>
  );
}
