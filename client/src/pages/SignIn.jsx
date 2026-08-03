import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext.jsx';
import { loginSchema } from '../schemas/auth.js';
import { zodFieldErrors } from '../lib/zodFieldErrors.js';
import StaticGlobe from '../components/StaticGlobe.jsx';

export default function SignIn() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});

    setSubmitting(true);
    try {
      await login(parsed.data);
      navigate('/home');
    } catch {
      // §9: identical message whether the email is unknown or the password
      // is wrong, so a failed login never reveals which one was incorrect.
      setFormError(t('auth.invalidCredentials'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 px-4 py-8">
      <Link to="/" className="w-full text-left text-wordmark text-ink">
        xpdtr
      </Link>
      <StaticGlobe />
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-6">
        <label className="flex flex-col gap-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.email')}
            aria-label={t('auth.email')}
            className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 placeholder:text-muted"
          />
          {fieldErrors.email && <p className="text-utility text-danger">{fieldErrors.email}</p>}
        </label>
        <label className="flex flex-col gap-1">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.password')}
            aria-label={t('auth.password')}
            className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 placeholder:text-muted"
          />
          {fieldErrors.password && <p className="text-utility text-danger">{fieldErrors.password}</p>}
        </label>
        {formError && <p className="text-danger">{formError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-pill border border-ink px-6 py-2 text-ink disabled:opacity-50"
        >
          {t('auth.enterAccount')}
        </button>
      </form>
      <Link to="/signup" className="text-ink underline">
        {t('landing.signUp')}
      </Link>
    </main>
  );
}
