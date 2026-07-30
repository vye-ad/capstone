import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHeader from '../components/PageHeader.jsx';
import CountrySelect from '../components/CountrySelect.jsx';
import { useAuth } from '../lib/AuthContext.jsx';
import { createTrip, getTrip, updateTrip } from '../lib/trips.js';
import { deriveStatus } from '../lib/tripStatus.js';
import {
  tripCreateSchema,
  tripUpdateSchema,
  SUPPORTED_CURRENCIES,
  TRANSPORT_TYPES,
  ACCOMMODATION_TYPES,
  TRIP_STATUSES,
} from '../schemas/trip.js';
import { zodFieldErrors } from '../lib/zodFieldErrors.js';

const emptyForm = {
  countryCode: '',
  startDate: '',
  endDate: '',
  status: '',
  budgetAmount: '',
  budgetCurrency: '',
  transportType: '',
  accommodationType: '',
  notes: '',
};

export default function CreateEditTrip() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    ...emptyForm,
    countryCode: searchParams.get('country') ?? '',
    budgetCurrency: user?.currency ?? '',
  });
  const [loading, setLoading] = useState(isEditMode);
  // §7: an edit shouldn't reset statusIsManual unless the user actually
  // touches the status radio during THIS edit. If the trip was already a
  // manual override before this edit, don't auto-preview a derived value
  // either — that would show something the save won't actually apply.
  const [statusManuallySet, setStatusManuallySet] = useState(false);
  const [initialStatusIsManual, setInitialStatusIsManual] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    getTrip(id)
      .then((data) => {
        const trip = data.trip;
        setForm({
          countryCode: trip.countryCode,
          startDate: trip.startDate.slice(0, 10),
          endDate: trip.endDate.slice(0, 10),
          status: trip.status,
          budgetAmount: String(trip.budgetAmount),
          budgetCurrency: trip.budgetCurrency,
          transportType: trip.transportType ?? '',
          accommodationType: trip.accommodationType ?? '',
          notes: trip.notes ?? '',
        });
        setInitialStatusIsManual(trip.statusIsManual);
      })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [id, isEditMode, navigate]);

  const derivedStatus = deriveStatus(form.startDate, form.endDate);
  const autoSyncStatus = !statusManuallySet && !initialStatusIsManual;

  useEffect(() => {
    if (autoSyncStatus && derivedStatus) {
      setForm((f) => ({ ...f, status: derivedStatus }));
    }
  }, [derivedStatus, autoSyncStatus]);

  function setField(key, value) {
    setDirty(true);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCancel() {
    if (dirty && !window.confirm(t('common.confirmDiscard'))) return;
    navigate(-1);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      countryCode: form.countryCode,
      startDate: form.startDate,
      endDate: form.endDate,
      budgetAmount: form.budgetAmount === '' ? undefined : Number(form.budgetAmount),
      budgetCurrency: form.budgetCurrency,
      transportType: form.transportType || undefined,
      accommodationType: form.accommodationType || undefined,
      notes: form.notes || undefined,
    };

    // Create always sends status (required); edit only sends it when the
    // user actually chose one this session, so an edit that never touches
    // status can't flip statusIsManual (§7).
    if (!isEditMode || statusManuallySet) {
      payload.status = form.status;
    }

    const schema = isEditMode ? tripUpdateSchema : tripCreateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    setFormError(null);

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateTrip(id, parsed.data);
      } else {
        await createTrip(parsed.data);
      }
      navigate('/trips');
    } catch (err) {
      if (err.fields) setFieldErrors(err.fields);
      else setFormError(t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6">
        <PageHeader page={t(isEditMode ? 'pages.editTrip' : 'pages.createTrip')} />
        <p className="text-muted">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <PageHeader page={t(isEditMode ? 'pages.editTrip' : 'pages.createTrip')} />

      <form onSubmit={handleSubmit}>
        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.chooseDestination')}</span>
            <CountrySelect
              id="countryCode"
              value={form.countryCode}
              onChange={(v) => setField('countryCode', v)}
              placeholder={t('createTrip.chooseDestination')}
            />
            {fieldErrors.countryCode && <p className="text-sm text-danger">{fieldErrors.countryCode}</p>}
          </label>

          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-muted">{t('createTrip.startDay')}</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              />
              {fieldErrors.startDate && <p className="text-sm text-danger">{fieldErrors.startDate}</p>}
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-muted">{t('createTrip.endDay')}</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              />
              {fieldErrors.endDate && <p className="text-sm text-danger">{fieldErrors.endDate}</p>}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.status')}</span>
            <div className="flex gap-4">
              {TRIP_STATUSES.map((s) => (
                <label key={s} className="flex items-center gap-1 text-ink">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={form.status === s}
                    onChange={() => {
                      setStatusManuallySet(true);
                      setField('status', s);
                    }}
                  />
                  {t(`createTrip.status_${s}`)}
                </label>
              ))}
            </div>
            {fieldErrors.status && <p className="text-sm text-danger">{fieldErrors.status}</p>}
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.budget')}</span>
            <div className="flex gap-2">
              <select
                value={form.budgetCurrency}
                onChange={(e) => setField('budgetCurrency', e.target.value)}
                className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              >
                <option value="" disabled>
                  --
                </option>
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.budgetAmount}
                onChange={(e) => setField('budgetAmount', e.target.value)}
                className="flex-1 border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              />
            </div>
            {fieldErrors.budgetAmount && <p className="text-sm text-danger">{fieldErrors.budgetAmount}</p>}
            {fieldErrors.budgetCurrency && (
              <p className="text-sm text-danger">{fieldErrors.budgetCurrency}</p>
            )}
          </label>
        </div>

        <div className="flex flex-1 flex-col gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.tripDetails')}</span>
            <select
              value={form.transportType}
              onChange={(e) => setField('transportType', e.target.value)}
              className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              <option value="">{t('createTrip.transportType')}</option>
              {TRANSPORT_TYPES.map((tt) => (
                <option key={tt} value={tt}>
                  {t(`createTrip.transport_${tt}`)}
                </option>
              ))}
            </select>
            {fieldErrors.transportType && (
              <p className="text-sm text-danger">{fieldErrors.transportType}</p>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.accommodationDetails')}</span>
            <select
              value={form.accommodationType}
              onChange={(e) => setField('accommodationType', e.target.value)}
              className="border-b border-hairline bg-transparent py-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            >
              <option value="">{t('createTrip.accommodationType')}</option>
              {ACCOMMODATION_TYPES.map((at) => (
                <option key={at} value={at}>
                  {t(`createTrip.accommodation_${at}`)}
                </option>
              ))}
            </select>
            {fieldErrors.accommodationType && (
              <p className="text-sm text-danger">{fieldErrors.accommodationType}</p>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-muted">{t('createTrip.notes')}</span>
            <textarea
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              maxLength={2000}
              rows={4}
              className="border border-hairline bg-transparent p-2 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            />
            {fieldErrors.notes && <p className="text-sm text-danger">{fieldErrors.notes}</p>}
          </label>
        </div>
        </div>

        {formError && <p className="mt-4 text-center text-danger">{formError}</p>}

        <div className="mt-8 flex justify-center gap-6">
          <button type="button" onClick={handleCancel} className="text-ink underline">
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-pill border border-ink px-6 py-2 text-ink disabled:opacity-50"
          >
            {t('createTrip.submit')} {'>'}
          </button>
        </div>
      </form>
    </div>
  );
}
