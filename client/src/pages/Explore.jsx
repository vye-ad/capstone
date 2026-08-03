import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import StaticGlobe from '../components/StaticGlobe.jsx';
import { listCountries } from '../lib/countries.js';
import { localizedCountryName } from '../lib/countryName.js';

export default function Explore() {
  const { t, i18n } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [query, setQuery] = useState('');
  // null = show featured list, array = show search results
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCountries({ featured: 'true' })
      .then((data) => setFeatured(data.countries))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const handle = setTimeout(() => {
      listCountries({ q: query.trim() })
        .then((data) => setResults(data.countries))
        .catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  const list = results ?? featured;
  const showingSearch = results !== null;

  return (
    <main className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.explore')} />

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('explore.searchPlaceholder')}
        aria-label={t('explore.searchPlaceholder')}
        className="w-full border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 placeholder:text-muted"
      />

      <div className="mt-8 flex gap-8">
        <div className="flex-1">
          {!showingSearch && (
            <h2 className="mb-4 text-heading font-medium text-ink">{t('explore.featuredDestinations')}</h2>
          )}
          {loading ? (
            <p className="text-muted">{t('common.loading')}</p>
          ) : list.length === 0 ? (
            <p className="text-muted">{t('explore.noResults')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {list.map((country) => (
                <Link
                  key={country.cca2}
                  to={`/explore/${country.cca2}`}
                  className="flex items-center gap-2 text-ink"
                >
                  <img src={country.flagSvgUrl} alt="" className="h-4 w-6" />
                  {localizedCountryName(country, i18n.language)}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <StaticGlobe />
        </div>
      </div>
    </main>
  );
}
