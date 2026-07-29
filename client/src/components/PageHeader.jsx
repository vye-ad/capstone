import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import LocaleSwitcher from './LocaleSwitcher.jsx';

export default function PageHeader({ page }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4">
      <button type="button" onClick={() => navigate(-1)} className="text-ink underline">
        {'< '}
        {t('common.back')}
      </button>
      <div className="text-ink">
        {t('common.wordmark')} | {page}
      </div>
      <div className="flex items-center gap-4">
        <LocaleSwitcher />
        <button type="button" onClick={logout} className="text-ink underline">
          {t('common.signOut')}
        </button>
      </div>
    </div>
  );
}
