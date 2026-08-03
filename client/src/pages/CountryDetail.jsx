import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import GlobeView from '../components/GlobeView.jsx';
import { getCountry } from '../lib/countries.js';
import { localizedCountryName } from '../lib/countryName.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { useRates } from '../lib/useRates.js';
import { convertAmount } from '../lib/currency.js';

export default function CountryDetail() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { rates, isStale } = useRates();
  const { cca2 } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getCountry(cca2)
      .then((data) => setCountry(data.country))
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [cca2]);

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-6">
        <PageHeader page={t('pages.explore')} />
        <p className="text-muted">{t('common.loading')}</p>
      </main>
    );
  }

  if (notFound || !country) {
    return (
      <main className="min-h-screen px-4 py-6">
        <PageHeader page={t('pages.explore')} />
        <p className="text-muted">{t('explore.noResults')}</p>
      </main>
    );
  }

  const languages = Object.values(country.languages ?? {}).join(', ');
  const hasCities = country.cities.length > 0;
  const hasAttractions = country.attractions.length > 0;

  const rateValue =
    country.currencyCode && rates?.[country.currencyCode] && rates?.[user.currency]
      ? convertAmount(1, country.currencyCode, user.currency, rates)
      : null;
  const rateFormatted =
    rateValue !== null ? new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(rateValue) : null;

  return (
    <main className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.explore')} />

      <div className="flex items-center gap-2 text-heading font-medium text-ink">
        <img src={country.flagSvgUrl} alt="" className="h-4 w-6" />
        <span>{localizedCountryName(country, i18n.language)}</span>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/3">
          <img
            src={country.imageUrl}
            alt={localizedCountryName(country, i18n.language)}
            className="aspect-[2/3] w-full rounded object-cover"
          />
        </div>

        <div className="flex-1">
          <p className="text-ink">
            {t('countryDetail.language')}: {languages}
          </p>
          <p className="text-ink">
            {t('countryDetail.currency')}: {country.currencyName} ({country.currencySymbol})
            {rateFormatted !== null && (
              <>
                {' '}
                — 1 {country.currencyCode} = {rateFormatted} {user.currency}
                {isStale && <span className="text-muted"> ({t('common.staleRate')})</span>}
              </>
            )}
          </p>

          <div className="mt-6 flex gap-8">
            {hasCities && (
              <div>
                <h3 className="text-heading font-medium text-ink">{t('countryDetail.mainCities')}</h3>
                <ul>
                  {country.cities.map((city) => (
                    <li key={city.id} className="text-muted">
                      {city.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {hasAttractions && (
              <div>
                <h3 className="text-heading font-medium text-ink">{t('countryDetail.topAttractions')}</h3>
                <ul>
                  {country.attractions.map((attraction) => (
                    <li key={attraction.id} className="text-muted">
                      {attraction.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* §14: 3D globe, progressive enhancement — rotates to the country and
          highlights its border. Falls back to the static globe (narrow
          viewport / reduced motion / no WebGL); removing this block entirely
          changes nothing else on the page. */}
      {country.latitude != null && country.longitude != null && (
        <div className="mt-8 flex justify-center">
          <GlobeView
            mode="country"
            size={280}
            country={{
              cca3: country.cca3,
              nameEn: country.nameEn,
              latitude: country.latitude,
              longitude: country.longitude,
            }}
          />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link to={`/trips/new?country=${country.cca2}`} className="text-ink underline">
          {t('countryDetail.planATrip')} {'>'}
        </Link>
      </div>
    </main>
  );
}
