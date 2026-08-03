import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { localizedCountryName } from '../lib/countryName.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { useRates } from '../lib/useRates.js';
import { convertAmount, formatCurrency } from '../lib/currency.js';

const STATUS_DOT_CLASS = {
  UPCOMING: 'bg-status-upcoming',
  ONGOING: 'bg-status-ongoing',
  COMPLETED: 'bg-status-completed',
};

function formatDate(iso, locale) {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function TripRow({ trip, expanded, onToggle, onDeleteClick }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { rates } = useRates();
  const prefersReducedMotion = useReducedMotion();

  const convertedBudget = convertAmount(trip.budgetAmount, trip.budgetCurrency, user.currency, rates);
  const formattedBudget = formatCurrency(convertedBudget, user.currency, i18n.language);
  const countryName = localizedCountryName(trip.country, i18n.language);
  const dateRange = `${formatDate(trip.startDate, i18n.language)} - ${formatDate(trip.endDate, i18n.language)}`;

  const statusBadge = (
    <span className="flex items-center gap-2 text-ink">
      <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[trip.status]}`} />
      {t(`createTrip.status_${trip.status}`)}
    </span>
  );
  const flagAndName = (
    <span className="flex items-center gap-2 text-ink">
      <img src={trip.country.flagSvgUrl} alt="" className="h-4 w-6" />
      {countryName}
    </span>
  );
  const actions = (
    <span className="flex gap-4 text-muted">
      <Link to={`/trips/${trip.id}/edit`}>{t('myTrips.edit')}</Link>
      <button type="button" onClick={onDeleteClick}>
        {t('myTrips.delete')}
      </button>
    </span>
  );
  const chevron = (
    <button type="button" onClick={onToggle} className="text-ink">
      {expanded ? '⌃' : '⌄'}
    </button>
  );

  return (
    <div
      className={`border border-hairline px-4 py-3 ${
        // `rounded-pill` (border-radius: 9999px) clamps to half the box's
        // shorter side — fine for the short collapsed row, but once expanded
        // content makes the row much taller than it is wide, that clamp
        // produces a stadium shape whose curved caps cut into the corner
        // content. A fixed radius doesn't have that problem at any height.
        expanded ? 'rounded-3xl' : 'rounded-pill'
      }`}
    >
      {/* §13: a five-column table doesn't survive a narrow viewport — this
          is a genuinely different card layout below lg, not a scaled table. */}
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-ink">{dateRange}</span>
          {flagAndName}
        </div>
        <div className="flex items-center justify-between">
          {statusBadge}
          <span className="text-ink">{formattedBudget}</span>
        </div>
        <div className="flex items-center justify-between">
          {actions}
          {chevron}
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-6 lg:items-center lg:gap-4">
        <span className="text-ink">{dateRange}</span>
        {flagAndName}
        {statusBadge}
        <span className="text-ink">{formattedBudget}</span>
        {actions}
        <span className="justify-self-end">{chevron}</span>
      </div>

      {/* §13: expanding a row is a height transition in place, never a pan —
          it's not a navigation, so the route-transition treatment doesn't apply. */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-hairline pt-4">
              <div className="flex items-center justify-between">
                {flagAndName}
                {statusBadge}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-muted">{t('createTrip.startDay')}</p>
                  <p className="text-muted">{formatDate(trip.startDate, i18n.language)}</p>
                </div>
                <div>
                  <p className="text-muted">{t('createTrip.endDay')}</p>
                  <p className="text-muted">{formatDate(trip.endDate, i18n.language)}</p>
                </div>
                <div>
                  <p className="text-muted">{t('createTrip.budget')}</p>
                  <p className="text-muted">{formattedBudget}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
