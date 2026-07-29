import { useAuth } from '../lib/AuthContext.jsx';
import { updateProfile } from '../lib/profile.js';
import { SUPPORTED_CURRENCIES } from '../schemas/trip.js';

export default function CurrencySwitcher() {
  const { user, setUser } = useAuth();

  async function handleChange(e) {
    const data = await updateProfile({ currency: e.target.value });
    setUser(data.user);
  }

  return (
    <select value={user.currency} onChange={handleChange} className="bg-transparent text-ink underline">
      {SUPPORTED_CURRENCIES.map((c) => (
        <option key={c} value={c}>
          {c.toLowerCase()}
        </option>
      ))}
    </select>
  );
}
