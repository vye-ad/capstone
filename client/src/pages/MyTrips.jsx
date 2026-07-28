import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import { listTrips } from '../lib/trips.js';

const STATUS_DOT_CLASS = {
  UPCOMING: 'bg-status-upcoming',
  ONGOING: 'bg-status-ongoing',
  COMPLETED: 'bg-status-completed',
};

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function MyTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    listTrips(filter === 'all' ? {} : { status: filter })
      .then((data) => setTrips(data.trips))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.myTrips')} />

      <div className="mt-4 flex gap-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`text-ink ${filter === f ? 'underline' : ''}`}
          >
            {t(`myTrips.filter_${f}`)}
          </button>
        ))}
      </div>

      {loading ? null : trips.length === 0 ? (
        <p className="mt-8 text-muted">
          {t('myTrips.empty')}{' '}
          <Link to="/trips/new" className="underline">
            {t('countryDetail.planATrip')}
          </Link>
        </p>
      ) : (
        <div className="mt-8">
          <div className="grid grid-cols-5 gap-4 px-4 text-muted">
            <span>{t('myTrips.date')}</span>
            <span>{t('myTrips.destination')}</span>
            <span>{t('myTrips.status')}</span>
            <span>{t('myTrips.budget')}</span>
            <span>{t('myTrips.actions')}</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="grid grid-cols-5 items-center gap-4 rounded-pill border border-hairline px-4 py-3"
              >
                <span className="text-ink">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
                <span className="flex items-center gap-2 text-ink">
                  <img src={trip.country.flagSvgUrl} alt={trip.country.nameEn} className="h-4 w-6" />
                  {trip.country.nameEn}
                </span>
                <span className="flex items-center gap-2 text-ink">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[trip.status]}`} />
                  {t(`createTrip.status_${trip.status}`)}
                </span>
                {/*
                  §10.8 wants this converted to the user's currency via the
                  cached exchange rate. That's GET /api/rates, a week 3 item
                  (§15/§11) — showing the amount in its stored currency for
                  now, same deferral as Country detail's rate line.
                */}
                <span className="text-ink">
                  {trip.budgetCurrency}
                  {trip.budgetAmount}
                </span>
                <span className="flex gap-4 text-muted">
                  {t('myTrips.edit')}
                  {t('myTrips.delete')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
