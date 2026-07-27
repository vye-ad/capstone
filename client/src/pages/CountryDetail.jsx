import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import { getCountry } from '../lib/countries.js';

export default function CountryDetail() {
  const { t } = useTranslation();
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

  if (loading) return null;

  if (notFound || !country) {
    return (
      <div className="min-h-screen px-4 py-6">
        <PageHeader page={t('pages.explore')} />
        <p className="text-muted">{t('explore.noResults')}</p>
      </div>
    );
  }

  const languages = Object.values(country.languages ?? {}).join(', ');
  const hasCities = country.cities.length > 0;
  const hasAttractions = country.attractions.length > 0;

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.explore')} />

      <div className="flex items-center gap-2 text-ink">
        <img src={country.flagSvgUrl} alt={country.flagAlt ?? country.nameEn} className="h-4 w-6" />
        <span>{country.nameEn}</span>
      </div>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <div className="md:w-1/3">
          <img
            src={country.imageUrl}
            alt={country.nameEn}
            className="aspect-[2/3] w-full rounded object-cover"
          />
        </div>

        <div className="flex-1">
          <p className="text-ink">
            {t('countryDetail.language')}: {languages}
          </p>
          {/*
            §10.6 wants "1 {code} = {rate} {user currency}" appended here.
            That needs GET /api/rates, which is a week 3 item (§15) — showing
            name/symbol only until that endpoint exists.
          */}
          <p className="text-ink">
            {t('countryDetail.currency')}: {country.currencyName} ({country.currencySymbol})
          </p>

          <div className="mt-6 flex gap-8">
            {hasCities && (
              <div>
                <h3 className="text-ink">{t('countryDetail.mainCities')}</h3>
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
                <h3 className="text-ink">{t('countryDetail.topAttractions')}</h3>
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

      <div className="mt-8 flex justify-center">
        <Link to={`/trips/new?country=${country.cca2}`} className="text-ink underline">
          {t('countryDetail.planATrip')} {'>'}
        </Link>
      </div>
    </div>
  );
}
