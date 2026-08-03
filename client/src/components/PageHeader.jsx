import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { useNavigationDirection } from '../lib/NavigationDirectionContext.jsx';
import LocaleCurrencySwitcher from './LocaleCurrencySwitcher.jsx';
import HeaderMenu from './HeaderMenu.jsx';

export default function PageHeader({ page }) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { goBack } = useNavigationDirection();

  return (
    <div className="flex items-center justify-between py-6">
      <button type="button" onClick={goBack} className="text-utility text-ink underline">
        {'< '}
        {t('common.back')}
      </button>
      <Link to="/home" className="text-utility text-ink">
        {t('common.wordmark')} | {page}
      </Link>
      <HeaderMenu>
        <LocaleCurrencySwitcher />
        <button type="button" onClick={logout} className="text-utility text-ink underline">
          {t('common.signOut')}
        </button>
      </HeaderMenu>
    </div>
  );
}
