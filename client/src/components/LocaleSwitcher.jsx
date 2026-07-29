import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { updateProfile } from '../lib/profile.js';
import { SUPPORTED_LOCALES } from '../lib/i18n.js';

export default function LocaleSwitcher() {
  const { i18n } = useTranslation();
  const { setUser } = useAuth();

  async function handleChange(e) {
    const data = await updateProfile({ locale: e.target.value });
    setUser(data.user);
  }

  return (
    <select value={i18n.language} onChange={handleChange} className="bg-transparent text-ink underline">
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l}>
          {l}
        </option>
      ))}
    </select>
  );
}
