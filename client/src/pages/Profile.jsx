import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import CountrySelect from '../components/CountrySelect.jsx';
import { useAuth } from '../lib/AuthContext.jsx';
import { getStats, updateProfile, changePassword, uploadAvatar, deleteAvatar } from '../lib/profile.js';
import { getCountry } from '../lib/countries.js';
import { updateProfileSchema, changePasswordSchema } from '../schemas/profile.js';
import { zodFieldErrors } from '../lib/zodFieldErrors.js';

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function formatMemberSince(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [countryName, setCountryName] = useState(user.countryCode);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: user.name, email: user.email, countryCode: user.countryCode });
  const [fieldErrors, setFieldErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({});
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef(null);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    getStats().then((data) => setStats(data.stats));
    getCountry(user.countryCode)
      .then((data) => setCountryName(data.country.nameEn))
      .catch(() => {});
  }, [user.countryCode]);

  function startEditing() {
    setEditForm({ name: user.name, email: user.email, countryCode: user.countryCode });
    setFieldErrors({});
    setEditing(true);
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const parsed = updateProfileSchema.safeParse(editForm);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setSavingProfile(true);
    try {
      const data = await updateProfile(parsed.data);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      setFieldErrors(err.fields ?? {});
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(passwordForm);
    if (!parsed.success) {
      setPasswordFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setPasswordFieldErrors({});
    setChangingPassword(true);
    try {
      await changePassword(parsed.data);
      setShowPasswordModal(false);
      // §9: the server already cleared the cookie on success.
      setUser(null);
      navigate('/signin');
    } catch (err) {
      setPasswordFieldErrors(err.fields ?? {});
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleAvatarFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t('profile.avatarInvalidType'));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t('profile.avatarTooLarge'));
      return;
    }

    setAvatarError(null);
    setAvatarBusy(true);
    try {
      const data = await uploadAvatar(file);
      setUser((u) => ({ ...u, avatarUrl: data.avatarUrl }));
    } catch {
      setAvatarError(t('profile.avatarUploadFailed'));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarBusy(true);
    try {
      await deleteAvatar();
      setUser((u) => ({ ...u, avatarUrl: null, avatarPublicId: null }));
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.profile')} />

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-24 w-24 rounded-full border border-hairline object-cover"
            />
          ) : (
            <div role="presentation" className="h-24 w-24 rounded-full border border-hairline" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={avatarBusy}
            onClick={() => fileInputRef.current.click()}
            className="text-ink underline disabled:opacity-50"
          >
            {t('profile.uploadPicture')}
          </button>
          {user.avatarUrl && (
            <button
              type="button"
              disabled={avatarBusy}
              onClick={handleRemoveAvatar}
              className="text-muted underline disabled:opacity-50"
            >
              {t('profile.removePicture')}
            </button>
          )}
          {avatarError && <p className="text-sm text-danger">{avatarError}</p>}

          <div className="mt-6">
            <h2 className="text-ink">{t('profile.travelStatistics')}</h2>
            {stats && (
              <dl className="mt-2 flex flex-col gap-1 text-muted">
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.totalTrips')}:</dt>
                  <dd>{stats.totalTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.completedTrips')}:</dt>
                  <dd>{stats.completedTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.ongoingTrips')}:</dt>
                  <dd>{stats.ongoingTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.upcomingTrips')}:</dt>
                  <dd>{stats.upcomingTrips}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{t('profile.countriesVisited')}:</dt>
                  <dd>{stats.countriesVisited}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-muted">{t('profile.name')}</span>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none"
              />
              {fieldErrors.name && <p className="text-sm text-danger">{fieldErrors.name}</p>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted">{t('profile.email')}</span>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none"
              />
              {fieldErrors.email && <p className="text-sm text-danger">{fieldErrors.email}</p>}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted">{t('profile.country')}</span>
              <CountrySelect
                id="editCountryCode"
                value={editForm.countryCode}
                onChange={(v) => setEditForm((f) => ({ ...f, countryCode: v }))}
              />
              {fieldErrors.countryCode && <p className="text-sm text-danger">{fieldErrors.countryCode}</p>}
            </label>
            <div className="mt-2 flex gap-6">
              <button type="button" onClick={() => setEditing(false)} className="text-ink underline">
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-pill border border-ink px-6 py-2 text-ink disabled:opacity-50"
              >
                {t('profile.save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-ink">
              {t('profile.name')}: {user.name}
            </p>
            <p className="text-ink">
              {t('profile.email')}: {user.email}
            </p>
            <p className="text-ink">
              {t('profile.country')}: {countryName}
            </p>
            <p className="text-ink">
              {t('profile.memberSince')}: {formatMemberSince(user.createdAt)}
            </p>

            <div className="mt-4 flex gap-6">
              <button type="button" onClick={startEditing} className="text-ink underline">
                {t('profile.editProfile')}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="text-ink underline"
              >
                {t('profile.changePassword')}
              </button>
            </div>
          </div>
        )}
      </div>

      {showPasswordModal && (
        <Modal onClose={() => setShowPasswordModal(false)}>
          <form onSubmit={handleChangePassword} className="flex w-64 flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-muted">{t('profile.currentPassword')}</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))
                }
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none"
              />
              {passwordFieldErrors.currentPassword && (
                <p className="text-sm text-danger">{passwordFieldErrors.currentPassword}</p>
              )}
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-muted">{t('profile.newPassword')}</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none"
              />
              {passwordFieldErrors.newPassword && (
                <p className="text-sm text-danger">{passwordFieldErrors.newPassword}</p>
              )}
            </label>
            <div className="mt-2 flex justify-center gap-6">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-ink underline"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-pill border border-ink px-6 py-2 text-ink disabled:opacity-50"
              >
                {t('profile.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
