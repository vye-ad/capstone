import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../lib/AuthContext.jsx';
import { getStats } from '../lib/profile.js';
import { getCountry } from '../lib/countries.js';

function formatMemberSince(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [countryName, setCountryName] = useState(user.countryCode);

  useEffect(() => {
    getStats().then((data) => setStats(data.stats));
    getCountry(user.countryCode)
      .then((data) => setCountryName(data.country.nameEn))
      .catch(() => {});
  }, [user.countryCode]);

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.profile')} />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <div role="presentation" className="h-24 w-24 rounded-full border border-hairline" />
          <button type="button" className="text-ink underline">
            {t('profile.uploadPicture')}
          </button>

          <div className="mt-6">
            <h2 className="text-ink">{t('profile.travelStatistics')}</h2>
            {stats && (
              <dl className="mt-2 flex flex-col gap-1 text-muted">
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.totalTrips')}:</dt>
                  <dd>{stats.totalTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.completedTrips')}:</dt>
                  <dd>{stats.completedTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.ongoingTrips')}:</dt>
                  <dd>{stats.ongoingTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.upcomingTrips')}:</dt>
                  <dd>{stats.upcomingTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.countriesVisited')}:</dt>
                  <dd>{stats.countriesVisited}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-ink">
            {t('profile.name')}: {user.name}
          </p>
          <p className="text-ink">
            {t('profile.email')}: {user.email}
          </p>
          <p className="text-ink">
            {t('profile.country')}: {countryName}
          </p>
          <p className="text-ink">
            {t('profile.memberSince')}: {formatMemberSince(user.createdAt)}
          </p>

          <div className="mt-4 flex gap-6">
            <button type="button" className="text-ink underline">
              {t('profile.editProfile')}
            </button>
            <button type="button" className="text-ink underline">
              {t('profile.changePassword')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
