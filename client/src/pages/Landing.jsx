import { Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import StaticGlobe from '../components/StaticGlobe.jsx';

export default function Landing() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <h1 className="text-wordmark lg:text-wordmark-lg font-normal text-ink">{t('common.wordmark')}</h1>
      <StaticGlobe />
      <div className="flex flex-col gap-4">
        <Link to="/signin" className="text-ink underline">
          {t('landing.signIn')}
        </Link>
        <Link to="/signup" className="text-ink underline">
          {t('landing.signUp')}
        </Link>
      </div>
    </main>
  );
}
