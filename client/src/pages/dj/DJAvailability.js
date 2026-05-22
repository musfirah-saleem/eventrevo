// client/src/pages/dj/DJAvailability.js
import React, { useState, useEffect } from 'react';
import { djAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Trash2, Save, Loader2 } from 'lucide-react';
import * as yup from 'yup';

const DAYS = [
  { label: 'Sunday', val: 0 },
  { label: 'Monday', val: 1 },
  { label: 'Tuesday', val: 2 },
  { label: 'Wednesday', val: 3 },
  { label: 'Thursday', val: 4 },
  { label: 'Friday', val: 5 },
  { label: 'Saturday', val: 6 },
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const getTodayDate = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const normalizeDate = date => {
  if (!date) return '';

  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    return date.slice(0, 10);
  }

  return new Date(date).toISOString().split('T')[0];
};

export default function DJAvailability() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [weekly, setWeekly] = useState(
    DAYS.map(day => ({
      dayOfWeek: day.val,
      isAvailable: day.val === 5 || day.val === 6,
      startTime: '18:00',
      endTime: '02:00',
    }))
  );

  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [errors, setErrors] = useState({});
  const [blockErrors, setBlockErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [blockApiError, setBlockApiError] = useState('');

  const today = getTodayDate();

  const availabilitySchema = yup.object().shape({
    weeklyAvailability: yup
      .array()
      .of(
        yup.object().shape({
          dayOfWeek: yup
            .number()
            .required('Day is required')
            .min(0, 'Invalid day')
            .max(6, 'Invalid day'),

          isAvailable: yup.boolean().required(),

          startTime: yup.string().when('isAvailable', {
            is: true,
            then: schema =>
              schema
                .required('Start time is required')
                .matches(TIME_REGEX, 'Please enter a valid start time'),
            otherwise: schema => schema.notRequired(),
          }),

          endTime: yup.string().when('isAvailable', {
            is: true,
            then: schema =>
              schema
                .required('End time is required')
                .matches(TIME_REGEX, 'Please enter a valid end time')
                .test(
                  'different-from-start',
                  'End time must be different from start time',
                  function (value) {
                    const { startTime } = this.parent;

                    if (!startTime || !value) return true;

                    return startTime !== value;
                  }
                ),
            otherwise: schema => schema.notRequired(),
          }),
        })
      )
      .length(7, 'Weekly schedule must include all 7 days'),
  });

  const blockDateSchema = yup.object().shape({
    date: yup
      .string()
      .required('Please pick a date')
      .test(
        'not-past',
        'You cannot block a past date',
        value => Boolean(value) && value >= today
      ),

    reason: yup
      .string()
      .trim()
      .max(120, 'Reason cannot be more than 120 characters')
      .matches(
        /^[A-Za-z0-9\s.,'’/-]*$/,
        'Reason contains invalid characters'
      ),
  });

  useEffect(() => {
    djAPI
      .getMyProfile()
      .then(r => {
        const data = r.data.data;

        setProfile(data);

        if (data.weeklyAvailability?.length) {
          setWeekly(
            DAYS.map(day => {
              const existingDay = data.weeklyAvailability.find(
                item => item.dayOfWeek === day.val
              );

              return (
                existingDay || {
                  dayOfWeek: day.val,
                  isAvailable: false,
                  startTime: '18:00',
                  endTime: '02:00',
                }
              );
            })
          );
        }
      })
      .catch(() => {
        toast.error('Failed to load availability');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getValidationErrors = error => {
    const validationErrors = {};

    if (error.inner && error.inner.length) {
      error.inner.forEach(err => {
        if (err.path && !validationErrors[err.path]) {
          validationErrors[err.path] = err.message;
        }
      });
    } else if (error.path) {
      validationErrors[error.path] = error.message;
    }

    return validationErrors;
  };

  const clearWeeklyError = (idx, field) => {
    setErrors(prev => {
      const next = { ...prev };

      delete next[`weeklyAvailability[${idx}].${field}`];

      if (field === 'startTime') {
        delete next[`weeklyAvailability[${idx}].endTime`];
      }

      if (field === 'isAvailable') {
        delete next[`weeklyAvailability[${idx}].startTime`];
        delete next[`weeklyAvailability[${idx}].endTime`];
      }

      return next;
    });

    setApiError('');
  };

  const updateDay = (idx, field, value) => {
    setWeekly(prev =>
      prev.map((day, i) =>
        i === idx
          ? {
              ...day,
              [field]: value,
            }
          : day
      )
    );

    clearWeeklyError(idx, field);
  };

  const validateDayField = async (idx, field) => {
    try {
      await availabilitySchema.validateAt(
        `weeklyAvailability[${idx}].${field}`,
        {
          weeklyAvailability: weekly,
        }
      );

      setErrors(prev => {
        const next = { ...prev };
        delete next[`weeklyAvailability[${idx}].${field}`];
        return next;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`weeklyAvailability[${idx}].${field}`]: error.message,
      }));
    }
  };

  const handleBlockChange = (field, value) => {
    if (field === 'date') {
      setBlockDate(value);
    }

    if (field === 'reason') {
      setBlockReason(value);
    }

    setBlockErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    setBlockApiError('');
  };

  const validateBlockField = async field => {
    try {
      await blockDateSchema.validateAt(field, {
        date: blockDate,
        reason: blockReason,
      });

      setBlockErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (error) {
      setBlockErrors(prev => ({
        ...prev,
        [field]: error.message,
      }));
    }
  };

  const saveAvailability = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setApiError('');

    try {
      const validatedData = await availabilitySchema.validate(
        {
          weeklyAvailability: weekly,
        },
        {
          abortEarly: false,
        }
      );

      setErrors({});
      setSaving(true);

      await djAPI.updateAvailability({
        weeklyAvailability: validatedData.weeklyAvailability,
      });

      toast.success('Availability saved! ✓');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = getValidationErrors(error);
        setErrors(validationErrors);
        toast.error('Please fix the highlighted schedule fields');
        return;
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Save failed';

      setApiError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setBlockApiError('');

    try {
      const validatedData = await blockDateSchema.validate(
        {
          date: blockDate,
          reason: blockReason,
        },
        {
          abortEarly: false,
        }
      );

      const alreadyBlocked = (profile?.blockedDates || []).some(
        item => normalizeDate(item.date) === validatedData.date
      );

      if (alreadyBlocked) {
        setBlockErrors({
          date: 'This date is already blocked',
        });
        toast.error('This date is already blocked');
        return;
      }

      setBlockErrors({});
      setBlocking(true);

      const res = await djAPI.blockDate({
        date: validatedData.date,
        reason: validatedData.reason?.trim() || '',
      });

      setProfile(prev => ({
        ...prev,
        blockedDates: res.data.data,
      }));

      setBlockDate('');
      setBlockReason('');

      toast.success('Date blocked ✓');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = getValidationErrors(error);
        setBlockErrors(validationErrors);
        toast.error('Please fix the highlighted fields');
        return;
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to block date';

      setBlockApiError(message);
      toast.error(message);
    } finally {
      setBlocking(false);
    }
  };

  const removeBlock = async id => {
    setRemovingId(id);

    try {
      const res = await djAPI.unblockDate(id);

      setProfile(prev => ({
        ...prev,
        blockedDates: res.data.data,
      }));

      toast.success('Unblocked');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to unblock date');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dash-layout">
        <DashSidebar />
        <main className="dash-main">
          <PageLoader />
        </main>
      </div>
    );
  }

  return (
    <div className="dash-layout">
      <DashSidebar />

      <main className="dash-main">
        <h1
          style={{
            fontFamily: "'Bebas Neue'",
            fontSize: '2.8rem',
            letterSpacing: '.04em',
            marginBottom: '2rem',
          }}
        >
          Availability
        </h1>

        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: '.65rem',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--lime)',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '.5rem',
            }}
          >
            📅 Weekly Schedule
          </div>

          {apiError && (
            <div
              className="form-error"
              style={{
                background: 'rgba(255, 80, 80, 0.08)',
                border: '1px solid rgba(255, 80, 80, 0.25)',
                padding: '.75rem .9rem',
                borderRadius: 2,
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}
            >
              {apiError}
            </div>
          )}

          <form onSubmit={saveAvailability} autoComplete="off" noValidate>
            {weekly.map((day, idx) => {
              const startError =
                errors[`weeklyAvailability[${idx}].startTime`];
              const endError = errors[`weeklyAvailability[${idx}].endTime`];

              return (
                <div
                  key={day.dayOfWeek}
                  style={{
                    padding: '.65rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 100px 1fr',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '.85rem', fontWeight: 500 }}>
                      {DAYS[idx].label}
                    </span>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.4rem',
                        fontSize: '.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={e =>
                          updateDay(idx, 'isAvailable', e.target.checked)
                        }
                      />
                      Available
                    </label>

                    {day.isAvailable && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.5rem',
                        }}
                      >
                        <input
                          type="time"
                          className="form-input"
                          style={{
                            width: 100,
                            padding: '.4rem .6rem',
                            fontSize: '.8rem',
                          }}
                          value={day.startTime}
                          onChange={e =>
                            updateDay(idx, 'startTime', e.target.value)
                          }
                          onBlur={() => validateDayField(idx, 'startTime')}
                          autoComplete="off"
                        />

                        <span
                          style={{
                            fontSize: '.75rem',
                            color: 'var(--muted)',
                          }}
                        >
                          to
                        </span>

                        <input
                          type="time"
                          className="form-input"
                          style={{
                            width: 100,
                            padding: '.4rem .6rem',
                            fontSize: '.8rem',
                          }}
                          value={day.endTime}
                          onChange={e =>
                            updateDay(idx, 'endTime', e.target.value)
                          }
                          onBlur={() => validateDayField(idx, 'endTime')}
                          autoComplete="off"
                        />
                      </div>
                    )}
                  </div>

                  {(startError || endError) && (
                    <div
                      className="form-error"
                      style={{
                        marginTop: '.45rem',
                        marginLeft: 210,
                      }}
                    >
                      {startError || endError}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              className="btn btn-lime btn-sm"
              style={{ marginTop: '1rem' }}
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={13}
                  style={{ animation: 'spin .8s linear infinite' }}
                />
              ) : (
                <Save size={13} />
              )}

              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </form>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div
            style={{
              fontSize: '.65rem',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--lime)',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '.5rem',
            }}
          >
            🚫 Block Specific Dates
          </div>

          {blockApiError && (
            <div
              className="form-error"
              style={{
                background: 'rgba(255, 80, 80, 0.08)',
                border: '1px solid rgba(255, 80, 80, 0.25)',
                padding: '.75rem .9rem',
                borderRadius: 2,
                marginBottom: '1rem',
                lineHeight: 1.5,
              }}
            >
              {blockApiError}
            </div>
          )}

          <form onSubmit={addBlock} autoComplete="off" noValidate>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr auto',
                gap: '.8rem',
                marginBottom: '1rem',
                alignItems: 'start',
              }}
            >
              <div>
                <label className="form-label" htmlFor="blockDate">
                  Date
                </label>

                <input
                  id="blockDate"
                  type="date"
                  name="block_date"
                  className="form-input"
                  value={blockDate}
                  min={today}
                  onChange={e => handleBlockChange('date', e.target.value)}
                  onBlur={() => validateBlockField('date')}
                  autoComplete="off"
                />

                {blockErrors.date && (
                  <div className="form-error">{blockErrors.date}</div>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="blockReason">
                  Reason
                </label>

                <input
                  id="blockReason"
                  type="text"
                  name="block_reason"
                  className="form-input"
                  value={blockReason}
                  onChange={e => handleBlockChange('reason', e.target.value)}
                  onBlur={() => validateBlockField('reason')}
                  placeholder="e.g. Personal / Holiday"
                  autoComplete="off"
                />

                {blockErrors.reason && (
                  <div className="form-error">{blockErrors.reason}</div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-danger btn-sm"
                style={{ marginTop: '1.35rem' }}
                disabled={blocking}
              >
                {blocking ? 'Blocking...' : 'Block Date'}
              </button>
            </div>
          </form>

          {(profile?.blockedDates || []).length === 0 ? (
            <p style={{ fontSize: '.82rem', color: 'var(--muted)' }}>
              No dates blocked yet.
            </p>
          ) : (
            (profile.blockedDates || []).map(dateItem => (
              <div
                key={dateItem._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '.5rem .8rem',
                  background: 'rgba(239,68,68,.05)',
                  border: '1px solid rgba(239,68,68,.15)',
                  borderRadius: 2,
                  marginBottom: '.4rem',
                }}
              >
                <div>
                  <span style={{ fontSize: '.85rem', fontWeight: 500 }}>
                    {new Date(dateItem.date).toLocaleDateString('en-AU', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  {dateItem.reason && (
                    <span
                      style={{
                        fontSize: '.75rem',
                        color: 'var(--muted)',
                        marginLeft: '.6rem',
                      }}
                    >
                      {dateItem.reason}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeBlock(dateItem._id)}
                  disabled={removingId === dateItem._id}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--red)',
                    cursor: 'pointer',
                    fontSize: '.78rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '.3rem',
                    opacity: removingId === dateItem._id ? 0.6 : 1,
                  }}
                >
                  <Trash2 size={13} />
                  {removingId === dateItem._id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}