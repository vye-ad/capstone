import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { listTrips } from '../lib/trips.js';
import LocaleCurrencySwitcher from '../components/LocaleCurrencySwitcher.jsx';
import HeaderMenu from '../components/HeaderMenu.jsx';
import GlobeView from '../components/GlobeView.jsx';
import { localizedCountryName } from '../lib/countryName.js';

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function wholeDaysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  // undefined = still loading, null = confirmed no upcoming trips
  const [nearestTrip, setNearestTrip] = useState(undefined);

  useEffect(() => {
    listTrips({ status: 'upcoming' })
      .then((data) => {
        if (data.trips.length === 0) {
          setNearestTrip(null);
          return;
        }
        const nearest = data.trips.reduce((soonest, trip) =>
          new Date(trip.startDate) < new Date(soonest.startDate) ? trip : soonest
        );
        setNearestTrip(nearest);
      })
      .catch(() => setNearestTrip(null));
  }, []);

  let daysUntil = 0;
  let tripLength = 0;
  if (nearestTrip) {
    const today = todayUTC();
    daysUntil = wholeDaysBetween(today, new Date(nearestTrip.startDate));
    tripLength = wholeDaysBetween(new Date(nearestTrip.startDate), new Date(nearestTrip.endDate)) + 1;
  }

  return (
    <main className="flex min-h-screen flex-col px-4 py-6">
      <div className="flex items-center justify-between">
        <div className="text-[32px] text-ink">xpdtr</div>
        <HeaderMenu>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="text-ink underline">
              {t('pages.admin')}
            </Link>
          )}
          <LocaleCurrencySwitcher />
          <button type="button" onClick={logout} className="text-ink underline">
            {t('common.signOut')}
          </button>
        </HeaderMenu>
      </div>

      {/* §13: the compass layout doesn't fit narrow screens — stack the
          links vertically below lg instead of scaling the desktop layout. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 lg:hidden">
        <GlobeView mode="rotate" size={96} />
        <Link to="/profile" className="text-ink underline">
          {t('home.nav.profile')}
        </Link>
        <Link to="/explore" className="text-ink underline">
          {t('home.nav.explore')}
        </Link>
        <Link to="/trips" className="text-ink underline">
          {t('home.nav.myTrips')}
        </Link>
        <Link to="/trips/new" className="text-xl text-ink underline">
          +
        </Link>
      </div>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <div className="grid grid-cols-3 grid-rows-3 items-center justify-items-center gap-6">
          <div />
          <Link to="/profile" className="text-ink underline">
            {t('home.nav.profile')}
          </Link>
          <div />
          <Link to="/explore" className="text-ink underline">
            {t('home.nav.explore')}
          </Link>
          <GlobeView mode="rotate" size={96} />
          <Link to="/trips" className="text-ink underline">
            {t('home.nav.myTrips')}
          </Link>
          <div />
          <Link to="/trips/new" className="text-xl text-ink underline">
            +
          </Link>
          <div />
        </div>
      </div>

      <div className="flex justify-end text-right text-muted">
        {nearestTrip === undefined ? null : nearestTrip === null ? (
          <p>
            {t('home.noUpcomingTrips')}{' '}
            <Link to="/trips/new" className="underline">
              {t('home.planATrip')}
            </Link>
          </p>
        ) : (
          <div>
            <p>{t('home.welcomeBack', { name: user.name })}</p>
            <p>{t('home.upcomingTrips')}</p>
            <p>
              <img
                src={nearestTrip.country.flagSvgUrl}
                alt=""
                className="inline h-4 w-6 align-middle"
              />{' '}
              {localizedCountryName(nearestTrip.country, i18n.language)} {t('home.inDays', { count: daysUntil })}{' '}
              {t('home.forDays', { count: tripLength })}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
