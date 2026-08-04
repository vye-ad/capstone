import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { updateProfile } from '../lib/profile.js';
import { SUPPORTED_LOCALES } from '../lib/i18n.js';

export default function LocaleSwitcher() {
  const { t, i18n } = useTranslation();
  const { setUser } = useAuth();

  async function handleChange(e) {
    try {
      const data = await updateProfile({ locale: e.target.value });
      setUser(data.user);
    } catch {
      // language didn't actually change server-side — leave the select as-is
    }
  }

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      aria-label={t('countryDetail.language')}
      className="bg-transparent text-utility lg:text-utility-lg text-ink underline"
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}
