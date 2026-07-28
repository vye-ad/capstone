import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import TripRow from '../components/TripRow.jsx';
import { listTrips } from '../lib/trips.js';

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

export default function MyTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    listTrips(filter === 'all' ? {} : { status: filter })
      .then((data) => setTrips(data.trips))
      .finally(() => setLoading(false));
  }, [filter]);

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
          <div className="grid grid-cols-6 gap-4 px-4 text-muted">
            <span>{t('myTrips.date')}</span>
            <span>{t('myTrips.destination')}</span>
            <span>{t('myTrips.status')}</span>
            <span>{t('myTrips.budget')}</span>
            <span>{t('myTrips.actions')}</span>
            <span />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {trips.map((trip) => (
              <TripRow
                key={trip.id}
                trip={trip}
                expanded={expandedIds.has(trip.id)}
                onToggle={() => toggleExpanded(trip.id)}
                onDeleteClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
