// client/src/pages/dj/DJProfileEdit.js
import React, { useState, useEffect, useRef } from 'react';
import { djAPI, uploadAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Upload, Loader2, Save } from 'lucide-react';
import * as yup from 'yup';

const ALL_GENRES = [
  'House',
  'Techno',
  'Drum & Bass',
  'Hip-Hop',
  'R&B',
  'Afrobeats',
  'Latin',
  'Pop / Top 40',
  'Commercial Dance',
  'Classic Hits',
  'Electro',
  'Funk / Soul',
  'Reggaeton',
  'Deep House',
  'Minimal',
  'Other',
];

const ALL_EVENTS = [
  'Wedding',
  'Corporate',
  'Birthday',
  'EOFY Party',
  'NYE Party',
  'Private Party',
  'Club Night',
  'Festival',
  'Anniversary',
  'Engagement',
  'Other',
];

const SOCIAL_FIELDS = [
  { key: 'instagram', prefix: 'instagram.com/', label: 'Instagram' },
  { key: 'facebook', prefix: 'facebook.com/', label: 'Facebook' },
  { key: 'soundcloud', prefix: 'soundcloud.com/', label: 'SoundCloud' },
  { key: 'spotify', prefix: 'open.spotify.com/artist/', label: 'Spotify' },
  { key: 'youtube', prefix: 'youtube.com/@', label: 'YouTube' },
  { key: 'mixcloud', prefix: 'mixcloud.com/', label: 'Mixcloud' },
  { key: 'tiktok', prefix: 'tiktok.com/@', label: 'TikTok' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

const SectionTitle = ({ children }) => (
  <div
    style={{
      fontSize: '.65rem',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: 'var(--lime)',
      marginBottom: '1rem',
      borderBottom: '1px solid var(--border)',
      paddingBottom: '.5rem',
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const numberField = label =>
  yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null) return undefined;
      return value;
    })
    .typeError(`${label} must be a number`);

const socialHandleSchema = label =>
  yup
    .string()
    .trim()
    .max(80, `${label} handle cannot be more than 80 characters`)
    .test(
      'not-full-url',
      `${label} field should contain handle only, not full URL`,
      value => !value || (!/^https?:\/\//i.test(value) && !/^www\./i.test(value))
    )
    .matches(
      /^[A-Za-z0-9._-]*$/,
      `${label} handle can only contain letters, numbers, dots, underscores, and hyphens`
    );

export default function DJProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const fileRef = useRef(null);

  const [form, setForm] = useState({
    stageName: '',
    bio: '',
    location: 'Canberra, ACT',
    hourlyRate: '',
    minimumHours: '2',
    packageDetails: '',
    genres: [],
    eventTypes: [],
    socials: {
      instagram: '',
      facebook: '',
      soundcloud: '',
      spotify: '',
      youtube: '',
      mixcloud: '',
      tiktok: '',
    },
  });

  const schema = yup.object().shape({
    stageName: yup
      .string()
      .trim()
      .required('Stage name is required')
      .min(2, 'Stage name must be at least 2 characters')
      .max(50, 'Stage name cannot be more than 50 characters')
      .matches(
        /^[A-Za-z0-9\s.'’&-]+$/,
        'Stage name can only contain letters, numbers, spaces, dot, apostrophe, &, and hyphen'
      ),

    location: yup
      .string()
      .trim()
      .required('Location is required')
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location cannot be more than 100 characters'),

    bio: yup
      .string()
      .trim()
      .max(1000, 'Bio cannot be more than 1000 characters')
      .test(
        'min-if-filled',
        'Bio must be at least 20 characters if provided',
        value => !value || value.length >= 20
      ),

    hourlyRate: numberField('Hourly rate')
      .required('Hourly rate is required')
      .integer('Hourly rate must be a whole number')
      .min(1, 'Hourly rate must be at least A$1')
      .max(10000, 'Hourly rate cannot be more than A$10,000'),

    minimumHours: numberField('Minimum hours')
      .required('Minimum hours is required')
      .integer('Minimum hours must be a whole number')
      .min(1, 'Minimum hours must be at least 1')
      .max(12, 'Minimum hours cannot be more than 12'),

    packageDetails: yup
      .string()
      .trim()
      .max(700, 'Package details cannot be more than 700 characters'),

    genres: yup
      .array()
      .of(yup.string().oneOf(ALL_GENRES))
      .min(1, 'Please select at least one music genre'),

    eventTypes: yup
      .array()
      .of(yup.string().oneOf(ALL_EVENTS))
      .min(1, 'Please select at least one event type'),

    socials: yup.object().shape({
      instagram: socialHandleSchema('Instagram'),
      facebook: socialHandleSchema('Facebook'),
      soundcloud: socialHandleSchema('SoundCloud'),
      spotify: socialHandleSchema('Spotify'),
      youtube: socialHandleSchema('YouTube'),
      mixcloud: socialHandleSchema('Mixcloud'),
      tiktok: socialHandleSchema('TikTok'),
    }),
  });

  useEffect(() => {
    djAPI
      .getMyProfile()
      .then(r => {
        const d = r.data.data;

        setProfile(d);

        setForm({
          stageName: d.stageName || '',
          bio: d.bio || '',
          location: d.location || 'Canberra, ACT',
          hourlyRate: d.hourlyRate ? String(d.hourlyRate) : '',
          minimumHours: d.minimumHours ? String(d.minimumHours) : '2',
          packageDetails: d.packageDetails || '',
          genres: d.genres || [],
          eventTypes: d.eventTypes || [],
          socials: {
            instagram: d.socials?.instagram || '',
            facebook: d.socials?.facebook || '',
            soundcloud: d.socials?.soundcloud || '',
            spotify: d.socials?.spotify || '',
            youtube: d.socials?.youtube || '',
            mixcloud: d.socials?.mixcloud || '',
            tiktok: d.socials?.tiktok || '',
          },
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const clearError = field => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    setApiError('');
  };

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    clearError(field);
  };

  const handleSocialChange = (key, value) => {
    setForm(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [key]: value,
      },
    }));

    clearError(`socials.${key}`);
  };

  const validateField = async field => {
    try {
      await schema.validateAt(field, form);

      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message,
      }));
    }
  };

  const toggleChip = (arr, value, key) => {
    const next = arr.includes(value)
      ? arr.filter(item => item !== value)
      : [...arr, value];

    setForm(prev => ({
      ...prev,
      [key]: next,
    }));

    clearError(key);
  };

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

  const handleSave = async e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setApiError('');

    try {
      const validatedData = await schema.validate(form, {
        abortEarly: false,
      });

      setErrors({});
      setSaving(true);

      const payload = {
        stageName: validatedData.stageName.trim(),
        bio: validatedData.bio?.trim() || '',
        location: validatedData.location.trim(),
        hourlyRate: Number(validatedData.hourlyRate),
        minimumHours: Number(validatedData.minimumHours),
        packageDetails: validatedData.packageDetails?.trim() || '',
        genres: validatedData.genres,
        eventTypes: validatedData.eventTypes,
        socials: {
          instagram: validatedData.socials.instagram?.trim() || '',
          facebook: validatedData.socials.facebook?.trim() || '',
          soundcloud: validatedData.socials.soundcloud?.trim() || '',
          spotify: validatedData.socials.spotify?.trim() || '',
          youtube: validatedData.socials.youtube?.trim() || '',
          mixcloud: validatedData.socials.mixcloud?.trim() || '',
          tiktok: validatedData.socials.tiktok?.trim() || '',
        },
      };

      const res = await djAPI.updateMyProfile(payload);

      setProfile(prev => ({
        ...prev,
        ...(res.data?.data || payload),
      }));

      toast.success('Profile saved! ✓');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = getValidationErrors(error);
        setErrors(validationErrors);
        toast.error('Please fix the highlighted fields');
        return;
      }

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Save failed';

      setApiError(message);
      toast.error(message);

      // Form values are not cleared here.
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async e => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image size must be less than 5MB');

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      return;
    }

    setUploading(true);

    const fd = new FormData();
    fd.append('image', file);

    try {
      const res = await uploadAPI.profileImage(fd);

      setProfile(prev => ({
        ...prev,
        profileImage: res.data.url,
      }));

      toast.success('Photo updated!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);

      if (fileRef.current) {
        fileRef.current.value = '';
      }
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

  const initials =
    form.stageName
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'DJ';

  return (
    <div className="dash-layout">
      <DashSidebar />

      <main className="dash-main">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: '.4rem' }}>
              <div className="eyebrow-line" />
              <span className="eyebrow-text">Edit DJ Profile</span>
            </div>

            <h1
              style={{
                fontFamily: "'Bebas Neue'",
                fontSize: '2.8rem',
                letterSpacing: '.04em',
                lineHeight: 1,
              }}
            >
              My Profile
            </h1>

            <p
              style={{
                fontSize: '.8rem',
                color: 'var(--muted)',
                marginTop: '.25rem',
              }}
            >
              Your public profile on the EventRevo marketplace
            </p>
          </div>

          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
            {profile?.status && (
              <span
                className={`badge ${
                  profile.status === 'approved'
                    ? 'badge-approved'
                    : 'badge-pending_review'
                }`}
              >
                {profile.status === 'approved'
                  ? 'Live on Marketplace'
                  : 'Pending Review'}
              </span>
            )}

            <button
              type="button"
              className="btn btn-lime"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2
                  size={14}
                  style={{ animation: 'spin .8s linear infinite' }}
                />
              ) : (
                <Save size={14} />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
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

        <form onSubmit={handleSave} autoComplete="off" noValidate>
          {/* Identity */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <SectionTitle>🎭 Identity</SectionTitle>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  background: 'var(--lime-dim)',
                  border: '1px solid rgba(168,255,62,.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={() => fileRef.current?.click()}
              >
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'Bebas Neue'",
                      fontSize: '1.8rem',
                      color: 'var(--lime)',
                    }}
                  >
                    {initials}
                  </span>
                )}
              </div>

              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2
                        size={12}
                        style={{ animation: 'spin .8s linear infinite' }}
                      />{' '}
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={12} /> Upload Photo
                    </>
                  )}
                </button>

                <p
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--muted)',
                    marginTop: '.3rem',
                  }}
                >
                  JPG, PNG up to 5MB. Shown on your public profile.
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="stageName">
                  Stage Name *
                </label>

                <input
                  id="stageName"
                  type="text"
                  name="dj_stage_name"
                  className="form-input"
                  value={form.stageName}
                  onChange={e => handleChange('stageName', e.target.value)}
                  onBlur={() => validateField('stageName')}
                  autoComplete="off"
                />

                {errors.stageName && (
                  <div className="form-error">{errors.stageName}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location *
                </label>

                <input
                  id="location"
                  type="text"
                  name="dj_location"
                  className="form-input"
                  value={form.location}
                  onChange={e => handleChange('location', e.target.value)}
                  onBlur={() => validateField('location')}
                  autoComplete="off"
                />

                {errors.location && (
                  <div className="form-error">{errors.location}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bio">
                Bio
              </label>

              <textarea
                id="bio"
                name="dj_bio"
                className="form-input form-textarea"
                style={{ minHeight: 110 }}
                value={form.bio}
                onChange={e => handleChange('bio', e.target.value)}
                onBlur={() => validateField('bio')}
                placeholder="Tell customers about your style, experience, and what makes you different..."
                autoComplete="off"
              />

              {errors.bio && <div className="form-error">{errors.bio}</div>}
            </div>
          </div>

          {/* Pricing */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <SectionTitle>💰 Pricing</SectionTitle>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="hourlyRate">
                  Hourly Rate (A$) *
                </label>

                <input
                  id="hourlyRate"
                  type="text"
                  name="dj_hourly_rate"
                  className="form-input"
                  value={form.hourlyRate}
                  onChange={e => handleChange('hourlyRate', e.target.value)}
                  onBlur={() => validateField('hourlyRate')}
                  placeholder="e.g. 200"
                  inputMode="numeric"
                  autoComplete="off"
                />

                {errors.hourlyRate && (
                  <div className="form-error">{errors.hourlyRate}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="minimumHours">
                  Minimum Hours *
                </label>

                <input
                  id="minimumHours"
                  type="text"
                  name="dj_minimum_hours"
                  className="form-input"
                  value={form.minimumHours}
                  onChange={e => handleChange('minimumHours', e.target.value)}
                  onBlur={() => validateField('minimumHours')}
                  inputMode="numeric"
                  autoComplete="off"
                />

                {errors.minimumHours && (
                  <div className="form-error">{errors.minimumHours}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="packageDetails">
                Package Details
              </label>

              <textarea
                id="packageDetails"
                name="dj_package_details"
                className="form-input"
                style={{ minHeight: 70, resize: 'none' }}
                value={form.packageDetails}
                onChange={e => handleChange('packageDetails', e.target.value)}
                onBlur={() => validateField('packageDetails')}
                placeholder="e.g. Wedding package includes ceremony + reception..."
                autoComplete="off"
              />

              {errors.packageDetails && (
                <div className="form-error">{errors.packageDetails}</div>
              )}
            </div>
          </div>

          {/* Genres */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <SectionTitle>🎵 Music Genres *</SectionTitle>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {ALL_GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  className={`genre-chip ${
                    form.genres.includes(genre) ? 'active' : ''
                  }`}
                  onClick={() => toggleChip(form.genres, genre, 'genres')}
                >
                  {genre}
                </button>
              ))}
            </div>

            {errors.genres && (
              <div className="form-error" style={{ marginTop: '.7rem' }}>
                {errors.genres}
              </div>
            )}
          </div>

          {/* Event Types */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <SectionTitle>🎉 Event Types *</SectionTitle>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {ALL_EVENTS.map(eventType => (
                <button
                  key={eventType}
                  type="button"
                  className={`genre-chip ${
                    form.eventTypes.includes(eventType) ? 'active' : ''
                  }`}
                  onClick={() =>
                    toggleChip(form.eventTypes, eventType, 'eventTypes')
                  }
                >
                  {eventType}
                </button>
              ))}
            </div>

            {errors.eventTypes && (
              <div className="form-error" style={{ marginTop: '.7rem' }}>
                {errors.eventTypes}
              </div>
            )}
          </div>

          {/* Socials */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <SectionTitle>🔗 Social & Platform Links</SectionTitle>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '.8rem',
              }}
            >
              {SOCIAL_FIELDS.map(({ key, prefix, label }) => (
                <div key={key} className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor={`social_${key}`}>
                    {label}
                  </label>

                  <div style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '.8rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '.68rem',
                        color: 'var(--muted)',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {prefix}
                    </span>

                    <input
                      id={`social_${key}`}
                      type="text"
                      name={`dj_social_${key}`}
                      className="form-input"
                      style={{
                        paddingLeft: `${prefix.length * 0.45 + 1.2}rem`,
                      }}
                      value={form.socials[key]}
                      onChange={e => handleSocialChange(key, e.target.value)}
                      onBlur={() => validateField(`socials.${key}`)}
                      placeholder="yourhandle"
                      autoComplete="off"
                    />
                  </div>

                  {errors[`socials.${key}`] && (
                    <div className="form-error">
                      {errors[`socials.${key}`]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-lime" disabled={saving}>
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>

            {/* <a
              href={`/djs/${profile?._id}`}
              className="btn btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Preview Profile →
            </a> */}
          </div>
        </form>
      </main>
    </div>
  );
}