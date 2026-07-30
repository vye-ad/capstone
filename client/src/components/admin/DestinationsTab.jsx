import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listCountriesAdmin,
  updateCountry,
  uploadCountryImage,
  createCity,
  deleteCity,
  createAttraction,
  deleteAttraction,
} from '../../lib/admin.js';
import { getCountry } from '../../lib/countries.js';

export default function DestinationsTab() {
  const { t } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCca2, setExpandedCca2] = useState(null);

  function reload() {
    setLoading(true);
    listCountriesAdmin()
      .then((data) => setCountries(data.countries))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleToggleFeatured(cca2, current) {
    await updateCountry(cca2, { isFeatured: !current });
    reload();
  }

  if (loading) return null;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-5 gap-4 px-2 text-muted">
          <span>{t('admin.destinations.name')}</span>
          <span>{t('admin.destinations.featured')}</span>
          <span>{t('admin.destinations.image')}</span>
          <span>{t('admin.destinations.cities')}</span>
          <span>{t('admin.destinations.attractions')}</span>
        </div>
        <div className="mt-2 flex flex-col gap-2">
          {countries.map((c) => (
            <DestinationRow
              key={c.cca2}
              country={c}
              expanded={expandedCca2 === c.cca2}
              onToggle={() => setExpandedCca2(expandedCca2 === c.cca2 ? null : c.cca2)}
              onToggleFeatured={() => handleToggleFeatured(c.cca2, c.isFeatured)}
              onChanged={reload}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DestinationRow({ country, expanded, onToggle, onToggleFeatured, onChanged }) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState(null);
  const [cityName, setCityName] = useState('');
  const [attractionName, setAttractionName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (expanded) {
      getCountry(country.cca2).then((data) => setDetail(data.country));
    }
  }, [expanded, country.cca2]);

  function refreshDetail() {
    getCountry(country.cca2).then((data) => setDetail(data.country));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      await uploadCountryImage(country.cca2, file);
      onChanged();
      refreshDetail();
    } finally {
      setUploading(false);
    }
  }

  async function handleAddCity(e) {
    e.preventDefault();
    if (!cityName.trim()) return;
    await createCity(country.cca2, cityName.trim());
    setCityName('');
    refreshDetail();
    onChanged();
  }

  async function handleRemoveCity(id) {
    await deleteCity(id);
    refreshDetail();
    onChanged();
  }

  async function handleAddAttraction(e) {
    e.preventDefault();
    if (!attractionName.trim()) return;
    await createAttraction(country.cca2, attractionName.trim());
    setAttractionName('');
    refreshDetail();
    onChanged();
  }

  async function handleRemoveAttraction(id) {
    await deleteAttraction(id);
    refreshDetail();
    onChanged();
  }

  return (
    <div className="rounded-pill border border-hairline px-4 py-2">
      <div className="grid grid-cols-5 items-center gap-4 text-ink">
        <button type="button" onClick={onToggle} className="flex items-center gap-2 text-left">
          <img src={country.flagSvgUrl} alt="" className="h-4 w-6" />
          {country.nameEn}
        </button>
        <input type="checkbox" checked={country.isFeatured} onChange={onToggleFeatured} />
        <span>
          {country.imageUrl ? (
            <img src={country.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            '—'
          )}
        </span>
        <span>{country.cityCount}</span>
        <span>{country.attractionCount}</span>
      </div>

      {expanded && detail && (
        <div className="mt-4 flex flex-col gap-4 border-t border-hairline pt-4">
          <label className="text-ink underline">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={uploading}
              className="hidden"
            />
            {t('admin.destinations.uploadImage')}
          </label>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <h4 className="text-muted">{t('admin.destinations.cities')}</h4>
              <ul>
                {detail.cities.map((city) => (
                  <li key={city.id} className="flex items-center justify-between text-ink">
                    {city.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(city.id)}
                      className="text-muted underline"
                    >
                      {t('myTrips.delete')}
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddCity} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  placeholder={t('admin.destinations.cityNamePlaceholder')}
                  className="border-b border-hairline bg-transparent text-ink outline-none"
                />
                <button type="submit" className="text-ink underline">
                  {t('admin.destinations.addCity')}
                </button>
              </form>
            </div>

            <div className="flex-1">
              <h4 className="text-muted">{t('admin.destinations.attractions')}</h4>
              <ul>
                {detail.attractions.map((a) => (
                  <li key={a.id} className="flex items-center justify-between text-ink">
                    {a.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttraction(a.id)}
                      className="text-muted underline"
                    >
                      {t('myTrips.delete')}
                    </button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddAttraction} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={attractionName}
                  onChange={(e) => setAttractionName(e.target.value)}
                  placeholder={t('admin.destinations.attractionNamePlaceholder')}
                  className="border-b border-hairline bg-transparent text-ink outline-none"
                />
                <button type="submit" className="text-ink underline">
                  {t('admin.destinations.addAttraction')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
