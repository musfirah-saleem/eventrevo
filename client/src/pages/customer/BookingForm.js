
// client/src/pages/customer/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { djAPI, bookingAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import * as yup from 'yup';

const EVENT_TYPES = [
  'Wedding',
  'Corporate / EOFY',
  'Birthday',
  'Private Party',
  'NYE Party',
  'Festival',
  'Club Night',
  'Anniversary',
  'Other',
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const getTodayDate = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const calculateDuration = (startTime, endTime) => {
  if (!TIME_REGEX.test(startTime || '') || !TIME_REGEX.test(endTime || '')) {
    return 0;
  }

  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);

  let duration = eh + em / 60 - (sh + sm / 60);

  if (duration <= 0) {
    duration += 24;
  }

  return duration;
};

export default function BookingForm() {
  const { djId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dj, setDj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    eventType: '',
    eventDate: '',
    startTime: '19:00',
    endTime: '23:00',
    location: '',
    notes: '',
    guestCount: '',
    guestName: '',
    guestEmail: '',
  });

  const today = getTodayDate();

  useEffect(() => {
    setPageLoading(true);

    djAPI
      .getOne(djId)
      .then(r => {
        setDj(r.data.data);
      })
      .catch(() => {
        toast.error('DJ not found');
      })
      .finally(() => {
        setPageLoading(false);
      });
  }, [djId]);

  const schema = yup.object().shape({
    eventType: yup
      .string()
      .required('Please select an event type')
      .oneOf(EVENT_TYPES, 'Please select a valid event type'),

    eventDate: yup
      .string()
      .required('Event date is required')
      .test(
        'not-past',
        'Event date cannot be in the past',
        value => Boolean(value) && value >= today
      ),

    startTime: yup
      .string()
      .required('Start time is required')
      .matches(TIME_REGEX, 'Please enter a valid start time'),

    endTime: yup
      .string()
      .required('End time is required')
      .matches(TIME_REGEX, 'Please enter a valid end time')
      .test('minimum-duration', function (value) {
        const { startTime } = this.parent;
        const minimumHours = this.options.context?.minimumHours;

        if (
          !startTime ||
          !value ||
          !TIME_REGEX.test(startTime) ||
          !TIME_REGEX.test(value) ||
          !minimumHours
        ) {
          return true;
        }

        const duration = calculateDuration(startTime, value);

        if (duration < minimumHours) {
          return this.createError({
            message: `Minimum booking is ${minimumHours} hours`,
          });
        }

        return true;
      }),

    location: yup
      .string()
      .trim()
      .required('Venue / location is required')
      .min(3, 'Location must be at least 3 characters')
      .max(150, 'Location cannot be more than 150 characters'),

    notes: yup
      .string()
      .trim()
      .max(500, 'Notes cannot be more than 500 characters'),

    guestCount: yup
      .string()
      .trim()
      .test(
        'is-number',
        'Guest count must be a number',
        value => !value || /^[0-9]+$/.test(value)
      )
      .test(
        'min-guests',
        'Guest count must be at least 1',
        value => !value || Number(value) >= 1
      )
      .test(
        'max-guests',
        'Guest count cannot be more than 100000',
        value => !value || Number(value) <= 100000
      ),

    guestName: yup.string().when('$isGuest', {
      is: true,
      then: schema =>
        schema
          .trim()
          .required('Your name is required')
          .min(2, 'Your name must be at least 2 characters')
          .matches(
            /^[A-Za-z\s.'-]+$/,
            'Name can only contain letters, spaces, dot, apostrophe, and hyphen'
          ),
      otherwise: schema => schema.notRequired(),
    }),

    guestEmail: yup.string().when('$isGuest', {
      is: true,
      then: schema =>
        schema
          .trim()
          .required('Your email is required')
          .email('Please enter a valid email address')
          .matches(
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            'Please enter a valid email address'
          ),
      otherwise: schema => schema.notRequired(),
    }),
  });

  const duration = calculateDuration(form.startTime, form.endTime);
  const total = dj?.hourlyRate ? Math.round(dj.hourlyRate * duration) : 0;
  const depositPercentage =
    dj?.advanceBookingPercentage && dj.advanceBookingPercentage > 0
      ? dj.advanceBookingPercentage
      : 20;
  const minimumAdvanceAmount = Number(dj?.minimumAdvanceAmount || 0);
  const requiredDepositAmount = Math.max(
    total * (depositPercentage / 100),
    minimumAdvanceAmount
  );
  const deposit = Math.round(requiredDepositAmount);

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    setErrors(prev => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];

      if (field === 'startTime') {
        delete updatedErrors.endTime;
      }

      return updatedErrors;
    });

    setApiError('');
  };

  const validateField = async field => {
    try {
      await schema.validateAt(field, form, {
        context: {
          isGuest: !user,
          minimumHours: dj?.minimumHours,
        },
      });

      setErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    e.stopPropagation();

    setApiError('');

    try {
      const validatedData = await schema.validate(form, {
        abortEarly: false,
        context: {
          isGuest: !user,
          minimumHours: dj?.minimumHours,
        },
      });

      setErrors({});
      setLoading(true);

      const payload = {
        djProfileId: djId,
        eventType: validatedData.eventType,
        eventDate: validatedData.eventDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        location: validatedData.location.trim(),
        notes: validatedData.notes?.trim() || '',
        guestCount: validatedData.guestCount
          ? Number(validatedData.guestCount)
          : undefined,
      };

      if (!user) {
        payload.guestName = validatedData.guestName.trim();
        payload.guestEmail = validatedData.guestEmail.trim();
      }

      await bookingAPI.create(payload);

      toast.success('Booking request sent! 🎉');

      navigate(user ? '/dashboard/customer' : '/');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};

        error.inner.forEach(err => {
          if (err.path && !validationErrors[err.path]) {
            validationErrors[err.path] = err.message;
          }
        });

        setErrors(validationErrors);
        toast.error('Please fix the highlighted fields');
        return;
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to submit booking request';

      setApiError(message);
      toast.error(message);

      // Form values are not cleared here.
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '5rem',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!dj) {
    return (
      <div style={{ paddingTop: 80, textAlign: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>DJ not found.</p>
        <Link to="/djs" className="btn btn-lime btn-sm">
          Browse DJs
        </Link>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Link
          to={`/djs/${djId}`}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
        >
          <ArrowLeft size={13} /> Back to profile
        </Link>

        <div className="eyebrow" style={{ marginBottom: '.5rem' }}>
          <div className="eyebrow-line" />
          <span className="eyebrow-text">Booking Enquiry</span>
        </div>

        <h1
          style={{
            fontFamily: "'Bebas Neue'",
            fontSize: '3rem',
            letterSpacing: '.03em',
            lineHeight: 1,
            marginBottom: '.5rem',
          }}
        >
          Book <span style={{ color: 'var(--lime)' }}>{dj.stageName}</span>
        </h1>

        <p
          style={{
            color: 'var(--muted)',
            fontSize: '.85rem',
            marginBottom: '2rem',
          }}
        >
          Fill in your event details. The DJ reviews and responds within 24–48
          hours.
        </p>

        {!user && (
          <div
            style={{
              background: 'rgba(168,255,62,.05)',
              border: '1px solid rgba(168,255,62,.18)',
              padding: '.9rem 1rem',
              fontSize: '.8rem',
              color: '#c4ff7a',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              borderRadius: 2,
            }}
          >
            💡{' '}
            <Link to="/register" style={{ color: 'var(--lime)' }}>
              Create a free account
            </Link>{' '}
            to track your booking, receive notifications, and pay your deposit
            online.
          </div>
        )}

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

        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          {/* Fake fields reduce browser autofill */}
          <input
            type="text"
            name="fake-booking-name"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />

          <input
            type="email"
            name="fake-booking-email"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '.65rem',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--lime)',
                marginBottom: '1rem',
              }}
            >
              📅 Event Details
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="eventType">
                Event Type *
              </label>

              <select
                id="eventType"
                name="booking_event_type"
                className="form-input form-select"
                value={form.eventType}
                onChange={e => handleChange('eventType', e.target.value)}
                onBlur={() => validateField('eventType')}
                autoComplete="off"
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {errors.eventType && (
                <div className="form-error">{errors.eventType}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="eventDate">
                  Event Date *
                </label>

                <input
                  id="eventDate"
                  type="date"
                  name="booking_event_date"
                  className="form-input"
                  min={today}
                  value={form.eventDate}
                  onChange={e => handleChange('eventDate', e.target.value)}
                  onBlur={() => validateField('eventDate')}
                  autoComplete="off"
                />

                {errors.eventDate && (
                  <div className="form-error">{errors.eventDate}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="guestCount">
                  Approx. Guests
                </label>

                <input
                  id="guestCount"
                  type="text"
                  name="booking_guest_count"
                  className="form-input"
                  value={form.guestCount}
                  onChange={e => handleChange('guestCount', e.target.value)}
                  onBlur={() => validateField('guestCount')}
                  placeholder="e.g. 80"
                  inputMode="numeric"
                  autoComplete="off"
                />

                {errors.guestCount && (
                  <div className="form-error">{errors.guestCount}</div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="startTime">
                  Start Time *
                </label>

                <input
                  id="startTime"
                  type="time"
                  name="booking_start_time"
                  className="form-input"
                  value={form.startTime}
                  onChange={e => handleChange('startTime', e.target.value)}
                  onBlur={() => validateField('startTime')}
                  autoComplete="off"
                />

                {errors.startTime && (
                  <div className="form-error">{errors.startTime}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endTime">
                  End Time *
                </label>

                <input
                  id="endTime"
                  type="time"
                  name="booking_end_time"
                  className="form-input"
                  value={form.endTime}
                  onChange={e => handleChange('endTime', e.target.value)}
                  onBlur={() => validateField('endTime')}
                  autoComplete="off"
                />

                {errors.endTime && (
                  <div className="form-error">{errors.endTime}</div>
                )}
              </div>
            </div>

            {duration > 0 && (
              <div
                style={{
                  background: 'var(--lime-dim)',
                  border: '1px solid rgba(168,255,62,.2)',
                  padding: '.8rem 1rem',
                  fontSize: '.82rem',
                  borderRadius: 2,
                }}
              >
                <span style={{ color: 'var(--muted)' }}>Duration: </span>
                <span style={{ color: 'var(--lime)', fontWeight: 500 }}>
                  {duration.toFixed(1)} hours
                </span>

                {total > 0 && (
                  <span style={{ color: 'var(--muted)', marginLeft: '1rem' }}>
                    Est. total:{' '}
                    <span style={{ color: 'var(--white)', fontWeight: 500 }}>
                      A${total}
                    </span>{' '}
                    · Deposit:{' '}
                    <span style={{ color: 'var(--lime)' }}>A${deposit}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div
              style={{
                fontSize: '.65rem',
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'var(--lime)',
                marginBottom: '1rem',
              }}
            >
              📍 Venue & Notes
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                Venue / Location *
              </label>

              <input
                id="location"
                type="text"
                name="booking_location"
                className="form-input"
                value={form.location}
                onChange={e => handleChange('location', e.target.value)}
                onBlur={() => validateField('location')}
                placeholder="e.g. The Street Theatre, Civic ACT"
                autoComplete="off"
              />

              {errors.location && (
                <div className="form-error">{errors.location}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Additional Notes
              </label>

              <textarea
                id="notes"
                name="booking_notes"
                className="form-input form-textarea"
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                onBlur={() => validateField('notes')}
                placeholder="Music preferences, theme, special requests..."
                autoComplete="off"
              />

              {errors.notes && <div className="form-error">{errors.notes}</div>}
            </div>
          </div>

          {!user && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
              <div
                style={{
                  fontSize: '.65rem',
                  letterSpacing: '.18em',
                  textTransform: 'uppercase',
                  color: 'var(--lime)',
                  marginBottom: '1rem',
                }}
              >
                👤 Your Details (Guest)
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="guestName">
                    Your Name *
                  </label>

                  <input
                    id="guestName"
                    type="text"
                    name="booking_guest_name"
                    className="form-input"
                    value={form.guestName}
                    onChange={e => handleChange('guestName', e.target.value)}
                    onBlur={() => validateField('guestName')}
                    placeholder="Full name"
                    autoComplete="off"
                  />

                  {errors.guestName && (
                    <div className="form-error">{errors.guestName}</div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="guestEmail">
                    Your Email *
                  </label>

                  <input
                    id="guestEmail"
                    type="text"
                    name="booking_guest_email"
                    className="form-input"
                    value={form.guestEmail}
                    onChange={e => handleChange('guestEmail', e.target.value)}
                    onBlur={() => validateField('guestEmail')}
                    placeholder="you@example.com"
                    autoComplete="off"
                    inputMode="email"
                  />

                  {errors.guestEmail && (
                    <div className="form-error">{errors.guestEmail}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-lime btn-full"
            style={{ padding: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={14}
                  style={{ animation: 'spin .8s linear infinite' }}
                />{' '}
                Submitting...
              </>
            ) : (
              'Send Booking Request'
            )}
          </button>

          <p
            style={{
              fontSize: '.7rem',
              color: 'var(--muted)',
              textAlign: 'center',
              marginTop: '.8rem',
            }}
          >
            No payment required now. Your required advance deposit of A${deposit} will be due when the DJ confirms.
          </p>
        </form>
      </div>
    </div>
  );
}