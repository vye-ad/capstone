import LocaleSwitcher from './LocaleSwitcher.jsx';
import CurrencySwitcher from './CurrencySwitcher.jsx';

// §10: "en | cad" — two independent controls, rendered adjacent with a pipe
// between them. They do not share state, so this is just layout, not logic.
export default function LocaleCurrencySwitcher() {
  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <span className="text-muted">|</span>
      <CurrencySwitcher />
    </div>
  );
}
