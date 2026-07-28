import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const STATUS_DOT_CLASS = {
  UPCOMING: 'bg-status-upcoming',
  ONGOING: 'bg-status-ongoing',
  COMPLETED: 'bg-status-completed',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function TripRow({ trip, expanded, onToggle, onDeleteClick }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-pill border border-hairline px-4 py-3">
      <div className="grid grid-cols-6 items-center gap-4">
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
          §10.8 wants this converted to the user's currency via the cached
          exchange rate — deferred to the currency task (needs GET /api/rates).
        */}
        <span className="text-ink">
          {trip.budgetCurrency}
          {trip.budgetAmount}
        </span>
        <span className="flex gap-4 text-muted">
          <Link to={`/trips/${trip.id}/edit`}>{t('myTrips.edit')}</Link>
          <button type="button" onClick={onDeleteClick}>
            {t('myTrips.delete')}
          </button>
        </span>
        <button type="button" onClick={onToggle} className="justify-self-end text-ink">
          {expanded ? '⌃' : '⌄'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-hairline pt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-ink">
              <img src={trip.country.flagSvgUrl} alt={trip.country.nameEn} className="h-4 w-6" />
              {trip.country.nameEn}
            </span>
            <span className="flex items-center gap-2 text-ink">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[trip.status]}`} />
              {t(`createTrip.status_${trip.status}`)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-muted">{t('createTrip.startDay')}</p>
              <p className="text-muted">{formatDate(trip.startDate)}</p>
            </div>
            <div>
              <p className="text-muted">{t('createTrip.endDay')}</p>
              <p className="text-muted">{formatDate(trip.endDate)}</p>
            </div>
            <div>
              <p className="text-muted">{t('createTrip.budget')}</p>
              <p className="text-muted">
                {trip.budgetCurrency} {trip.budgetAmount}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted">{t('createTrip.tripDetails')}</p>
              <p className="text-muted">
                {trip.transportType ? t(`createTrip.transport_${trip.transportType}`) : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted">{t('createTrip.notes')}</p>
              <p className="text-muted">{trip.notes || '—'}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted">{t('createTrip.accommodationDetails')}</p>
            <p className="text-muted">
              {trip.accommodationType ? t(`createTrip.accommodation_${trip.accommodationType}`) : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
