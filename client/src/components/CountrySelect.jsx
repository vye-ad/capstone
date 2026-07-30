import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listCountries, getCountry } from '../lib/countries.js';
import { localizedCountryName } from '../lib/countryName.js';

export default function CountrySelect({ id, value, onChange, placeholder }) {
  const { t, i18n } = useTranslation();
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
      .then((data) => setSelectedLabel(localizedCountryName(data.country, i18n.language)))
      .catch(() => {});
  }, [value, i18n.language]);

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
      {open && (options.length > 0 || query.trim()) && (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto border border-hairline bg-paper">
          {options.length === 0 ? (
            <li className="px-2 py-1 text-muted">{t('explore.noResults')}</li>
          ) : (
            options.map((c) => (
              <li key={c.cca2}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(c.cca2);
                    setSelectedLabel(localizedCountryName(c, i18n.language));
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-2 py-1 text-left text-ink hover:bg-hairline/20"
                >
                  <img src={c.flagSvgUrl} alt="" className="h-3 w-5" />
                  {localizedCountryName(c, i18n.language)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
