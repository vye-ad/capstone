import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import UsersTab from '../components/admin/UsersTab.jsx';
import DestinationsTab from '../components/admin/DestinationsTab.jsx';

export default function Admin() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('destinations');

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t('pages.admin')} />

      <div className="mt-4 flex gap-6">
        <button
          type="button"
          onClick={() => setTab('destinations')}
          className={`text-ink ${tab === 'destinations' ? 'underline' : ''}`}
        >
          {t('admin.tabDestinations')}
        </button>
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`text-ink ${tab === 'users' ? 'underline' : ''}`}
        >
          {t('admin.tabUsers')}
        </button>
      </div>

      <div className="mt-6">{tab === 'destinations' ? <DestinationsTab /> : <UsersTab />}</div>
    </div>
  );
}
