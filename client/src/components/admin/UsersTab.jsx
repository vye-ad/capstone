import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal.jsx';
import { useAuth } from '../../lib/AuthContext.jsx';
import { listUsers, updateUserRole, deleteUser } from '../../lib/admin.js';

function formatDate(iso, locale) {
  return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function UsersTab() {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  function reload() {
    setLoading(true);
    listUsers()
      .then((data) => setUsers(data.users))
      .catch(() => setActionError(t('common.somethingWentWrong')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleRoleChange(id, role) {
    setActionError(null);
    try {
      await updateUserRole(id, role);
      reload();
    } catch {
      setActionError(t('common.somethingWentWrong'));
    }
  }

  async function handleConfirmDelete() {
    setActionError(null);
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch {
      setActionError(t('common.somethingWentWrong'));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <p className="text-muted">{t('common.loading')}</p>;

  return (
    <div>
      {actionError && !deleteTarget && <p className="mb-2 text-danger">{actionError}</p>}
      {/* Not one of §13's named screens, but a 6-column table still can't
          survive a narrow viewport — scrolls as a unit rather than wrapping
          each row out of alignment with the header. */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-6 gap-4 px-2 text-muted">
            <span>{t('admin.users.name')}</span>
            <span>{t('admin.users.email')}</span>
            <span>{t('admin.users.country')}</span>
            <span>{t('admin.users.role')}</span>
            <span>{t('admin.users.memberSince')}</span>
            <span>{t('admin.users.tripCount')}</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-6 items-center gap-4 rounded-pill border border-hairline px-4 py-2 text-ink"
                >
                  <span>{u.name}</span>
                  <span>{u.email}</span>
                  <span>{u.countryName}</span>
                  <select
                    value={u.role}
                    disabled={isSelf}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-transparent disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <span>{formatDate(u.createdAt, i18n.language)}</span>
                  <div className="flex items-center justify-between">
                    <span>{u.tripCount}</span>
                    <button
                      type="button"
                      disabled={isSelf}
                      onClick={() => {
                        setActionError(null);
                        setDeleteTarget(u);
                      }}
                      className="text-muted underline disabled:opacity-50"
                    >
                      {t('admin.users.delete')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <p className="text-ink">{t('admin.users.deleteConfirm', { name: deleteTarget.name })}</p>
          <p className="mt-1 text-muted">{t('admin.users.deleteWarning')}</p>
          {actionError && <p className="mt-2 text-danger">{actionError}</p>}
          <div className="mt-6 flex justify-center gap-6">
            <button type="button" onClick={() => setDeleteTarget(null)} className="text-ink underline">
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="rounded-pill border border-danger px-6 py-2 text-danger disabled:opacity-50"
            >
              {t('admin.users.delete')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
