import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { updateProfile } from '../lib/profile.js';
import { SUPPORTED_CURRENCIES } from '../schemas/trip.js';

export default function CurrencySwitcher() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  async function handleChange(e) {
    try {
      const data = await updateProfile({ currency: e.target.value });
      setUser(data.user);
    } catch {
      // currency didn't actually change server-side — leave the select as-is
    }
  }

  return (
    <select
      value={user.currency}
      onChange={handleChange}
      aria-label={t('countryDetail.currency')}
      className="bg-transparent text-utility lg:text-utility-lg text-ink underline"
    >
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c.toLowerCase()}
        </option>
      ))}
    </select>
  );
}
