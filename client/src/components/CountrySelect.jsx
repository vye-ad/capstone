import { useEffect, useRef, useState } from 'react';
import { listCountries, getCountry } from '../lib/countries.js';

export default function CountrySelect({ id, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setSelectedLabel('');
      return;
    }
    getCountry(value)
      .then((data) => setSelectedLabel(data.country.nameEn))
      .catch(() => {});
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;
    const handle = setTimeout(() => {
      listCountries(query.trim() ? { q: query.trim() } : { featured: 'true' }).then((data) =>
        setOptions(data.countries)
      );
    }, 250);
    return () => clearTimeout(handle);
  }, [query, open]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        id={id}
        value={open ? query : selectedLabel}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full border-b border-hairline bg-transparent py-2 text-ink outline-none placeholder:text-muted"
      />
      {open && options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto border border-hairline bg-paper">
          {options.map((c) => (
            <li key={c.cca2}>
              <button
                type="button"
                onClick={() => {
                  onChange(c.cca2);
                  setSelectedLabel(c.nameEn);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-2 py-1 text-left text-ink hover:bg-hairline/20"
              >
                <img src={c.flagSvgUrl} alt="" className="h-3 w-5" />
                {c.nameEn}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
