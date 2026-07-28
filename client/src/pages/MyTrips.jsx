import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import TripRow from '../components/TripRow.jsx';
import Modal from '../components/Modal.jsx';
import { listTrips, deleteTrip } from '../lib/trips.js';

const FILTERS = ['all', 'upcoming', 'ongoing', 'completed'];

export default function MyTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteTrip(deleteTarget.id);
      setTrips((prev) => prev.filter((trip) => trip.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
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
                onDeleteClick={() => setDeleteTarget(trip)}
              />
            ))}
          </div>
        </div>
      )}

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <p className="text-ink">
            {t('myTrips.deleteConfirm', { country: deleteTarget.country.nameEn })}
          </p>
          <p className="mt-1 text-muted">{t('myTrips.deleteWarning')}</p>
          <div className="mt-6 flex justify-center gap-6">
            <button type="button" onClick={() => setDeleteTarget(null)} className="text-ink underline">
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded-pill border border-danger px-6 py-2 text-danger disabled:opacity-50"
            >
              {t('myTrips.delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
