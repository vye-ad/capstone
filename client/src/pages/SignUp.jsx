import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { registerSchema } from '../schemas/auth.js';
import { zodFieldErrors } from '../lib/zodFieldErrors.js';
import StaticGlobe from '../components/StaticGlobe.jsx';
import CountrySelect from '../components/CountrySelect.jsx';

export default function SignUp() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = { name, email, password, countryCode };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await register(parsed.data);
      navigate('/home');
    } catch (err) {
      setFieldErrors(err.fields ?? {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
      <div className="w-full text-left text-[32px] text-ink">xpdtr</div>
      <StaticGlobe />
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-6">
        <label className="flex flex-col gap-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('auth.name')}
            className="border-b border-hairline bg-transparent py-2 text-ink outline-none placeholder:text-muted"
          />
          {fieldErrors.name && <p className="text-sm text-danger">{fieldErrors.name}</p>}
        </label>
        <label className="flex flex-col gap-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            className="border-b border-hairline bg-transparent py-2 text-ink outline-none placeholder:text-muted"
          />
          {fieldErrors.email && <p className="text-sm text-danger">{fieldErrors.email}</p>}
        </label>
        <label className="flex flex-col gap-1">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            className="border-b border-hairline bg-transparent py-2 text-ink outline-none placeholder:text-muted"
          />
          {fieldErrors.password && <p className="text-sm text-danger">{fieldErrors.password}</p>}
        </label>
        <label className="flex flex-col gap-1">
          <CountrySelect
            id="countryCode"
            value={countryCode}
            onChange={setCountryCode}
            placeholder={t('auth.country')}
          />
          {fieldErrors.countryCode && (
            <p className="text-sm text-danger">{fieldErrors.countryCode}</p>
          )}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-pill border border-ink px-6 py-2 text-ink disabled:opacity-50"
        >
          {t('auth.createAccount')}
        </button>
      </form>
      <Link to="/signin" className="text-ink underline">
        {t('landing.signIn')}
      </Link>
    </div>
  );
}
