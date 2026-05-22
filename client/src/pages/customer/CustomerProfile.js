// import React, { useState, useRef } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { userAPI } from '../../utils/api';
// import DashSidebar from '../../components/layout/DashSidebar';
// import toast from 'react-hot-toast';
// import { uploadAPI } from '../../utils/api';
// import { Upload, Loader2 } from 'lucide-react';

// export default function CustomerProfile() {
//   const { user, updateUser } = useAuth();
//   const [form, setForm] = useState({ name:user?.name||'', phone:user?.phone||'', location:user?.location||'' });
//   const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);
//   const fileRef = useRef();
//   const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

//   const handleSave = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       const res = await fetch('/api/users/me', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('er_token')}`}, body:JSON.stringify(form) });
//       const data = await res.json();
//       updateUser(data.data);
//       toast.success('Profile saved!');
//     } catch { toast.error('Save failed'); } finally { setSaving(false); }
//   };

//   const handleUpload = async (e) => {
//     const file = e.target.files?.[0]; if(!file) return;
//     setUploading(true);
//     const fd = new FormData(); fd.append('image', file);
//     try {
//       const res = await uploadAPI.profileImage(fd);
//       updateUser({ avatar: res.data.url });
//       toast.success('Photo updated!');
//     } catch { toast.error('Upload failed'); } finally { setUploading(false); }
//   };

//   const handlePwSave = async (e) => {
//     e.preventDefault(); setSaving(true);
//     try {
//       await fetch('/api/users/me/password', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('er_token')}`}, body:JSON.stringify(pwForm) });
//       toast.success('Password updated!');
//       setPwForm({ currentPassword:'', newPassword:'' });
//     } catch { toast.error('Failed'); } finally { setSaving(false); }
//   };

//   return (
//     <div className="dash-layout">
//       <DashSidebar/>
//       <main className="dash-main">
//         <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'2rem' }}>My Profile</h1>

//         <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
//           <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>👤 Personal Information</div>
//           <div style={{ display:'flex', alignItems:'center', gap:'1.2rem', marginBottom:'1.5rem' }}>
//             <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', flexShrink:0 }} onClick={()=>fileRef.current?.click()}>
//               {user?.avatar ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', color:'var(--lime)' }}>{initials}</span>}
//             </div>
//             <div>
//               <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleUpload}/>
//               <button className="btn btn-outline btn-sm" onClick={()=>fileRef.current?.click()} disabled={uploading}>
//                 {uploading ? <><Loader2 size={12} style={{animation:'spin .8s linear infinite'}}/> Uploading...</> : <><Upload size={12}/> Upload Photo</>}
//               </button>
//               <p style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:'.3rem' }}>JPG, PNG up to 5MB</p>
//             </div>
//           </div>
//           <form onSubmit={handleSave}>
//             <div className="form-row">
//               <div className="form-group"><label className="form-label">Full Name</label><input type="text" className="form-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
//               <div className="form-group"><label className="form-label">Phone</label><input type="tel" className="form-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+61 4xx xxx xxx"/></div>
//             </div>
//             <div className="form-group"><label className="form-label">Location</label><input type="text" className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
//             <button type="submit" className="btn btn-lime" disabled={saving}>{saving?'Saving...':'Save Changes'}</button>
//           </form>
//         </div>

//         <div className="card" style={{ padding:'1.5rem' }}>
//           <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem', borderBottom:'1px solid var(--border)', paddingBottom:'.5rem' }}>🔒 Change Password</div>
//           <form onSubmit={handlePwSave}>
//             <div className="form-row">
//               <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} placeholder="••••••••"/></div>
//               <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} placeholder="At least 8 chars"/></div>
//             </div>
//             <button type="submit" className="btn btn-outline btn-sm" disabled={saving}>Update Password</button>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// }


// client/src/pages/customer/CustomerProfile.js
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashSidebar from '../../components/layout/DashSidebar';
import toast from 'react-hot-toast';
import { uploadAPI } from '../../utils/api';
import { Upload, Loader2 } from 'lucide-react';
import * as yup from 'yup';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export default function CustomerProfile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [profileApiError, setProfileApiError] = useState('');
  const [passwordApiError, setPasswordApiError] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || '',
    });
  }, [user]);

  const initials =
    user?.name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const profileSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .required('Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(60, 'Full name cannot be more than 60 characters')
      .matches(
        /^[A-Za-z\s.'-]+$/,
        'Full name can only contain letters, spaces, dot, apostrophe, and hyphen'
      ),

    phone: yup
      .string()
      .trim()
      .test(
        'valid-phone',
        'Please enter a valid phone number',
        value => !value || /^[+0-9\s()-]{7,20}$/.test(value)
      ),

    location: yup
      .string()
      .trim()
      .max(100, 'Location cannot be more than 100 characters'),
  });

  const passwordSchema = yup.object().shape({
    currentPassword: yup
      .string()
      .required('Current password is required'),

    newPassword: yup
      .string()
      .required('New password is required')
      .min(8, 'New password must be at least 8 characters')
      .matches(/[a-z]/, 'New password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'New password must contain at least one number')
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        'New password must contain at least one special character'
      )
      .notOneOf(
        [yup.ref('currentPassword')],
        'New password must be different from current password'
      ),
  });

  const handleProfileChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    setErrors(prev => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];
      return updatedErrors;
    });

    setProfileApiError('');
  };

  const handlePasswordChange = (field, value) => {
    setPwForm(prev => ({
      ...prev,
      [field]: value,
    }));

    setPwErrors(prev => {
      const updatedErrors = { ...prev };
      delete updatedErrors[field];
      return updatedErrors;
    });

    setPasswordApiError('');
  };

  const validateProfileField = async field => {
    try {
      await profileSchema.validateAt(field, form);

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

  const validatePasswordField = async field => {
    try {
      await passwordSchema.validateAt(field, pwForm);

      setPwErrors(prev => {
        const updatedErrors = { ...prev };
        delete updatedErrors[field];
        return updatedErrors;
      });
    } catch (error) {
      setPwErrors(prev => ({
        ...prev,
        [field]: error.message,
      }));
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    e.stopPropagation();

    setProfileApiError('');

    try {
      const validatedData = await profileSchema.validate(form, {
        abortEarly: false,
      });

      setErrors({});
      setSavingProfile(true);

      const payload = {
        name: validatedData.name.trim(),
        phone: validatedData.phone?.trim() || '',
        location: validatedData.location?.trim() || '',
      };

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('er_token')}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Failed to save profile'
        );
      }

      updateUser(data.data || payload);
      toast.success('Profile saved!');
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

      const message = error.message || 'Save failed';
      setProfileApiError(message);
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpload = async e => {
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

      updateUser({
        ...user,
        avatar: res.data.url,
      });

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

  const handlePwSave = async e => {
    e.preventDefault();
    e.stopPropagation();

    setPasswordApiError('');

    try {
      const validatedData = await passwordSchema.validate(pwForm, {
        abortEarly: false,
      });

      setPwErrors({});
      setSavingPassword(true);

      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('er_token')}`,
        },
        body: JSON.stringify({
          currentPassword: validatedData.currentPassword,
          newPassword: validatedData.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Failed to update password'
        );
      }

      toast.success('Password updated!');

      setPwForm({
        currentPassword: '',
        newPassword: '',
      });
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};

        error.inner.forEach(err => {
          if (err.path && !validationErrors[err.path]) {
            validationErrors[err.path] = err.message;
          }
        });

        setPwErrors(validationErrors);
        toast.error('Please fix the highlighted fields');
        return;
      }

      const message = error.message || 'Failed to update password';
      setPasswordApiError(message);
      toast.error(message);

      // Password values stay in inputs if API fails.
    } finally {
      setSavingPassword(false);
    }
  };

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
          My Profile
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
            👤 Personal Information
          </div>

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
                width: 72,
                height: 72,
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
              {user?.avatar ? (
                <img
                  src={user.avatar}
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
                    fontSize: '1.6rem',
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
                onChange={handleUpload}
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
                JPG, PNG up to 5MB
              </p>
            </div>
          </div>

          {profileApiError && (
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
              {profileApiError}
            </div>
          )}

          <form onSubmit={handleSave} autoComplete="off" noValidate>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="profile_name">
                  Full Name
                </label>

                <input
                  id="profile_name"
                  type="text"
                  name="customer_profile_name"
                  className="form-input"
                  value={form.name}
                  onChange={e => handleProfileChange('name', e.target.value)}
                  onBlur={() => validateProfileField('name')}
                  autoComplete="off"
                  placeholder="Your full name"
                />

                {errors.name && (
                  <div className="form-error">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile_phone">
                  Phone
                </label>

                <input
                  id="profile_phone"
                  type="text"
                  name="customer_profile_phone"
                  className="form-input"
                  value={form.phone}
                  onChange={e => handleProfileChange('phone', e.target.value)}
                  onBlur={() => validateProfileField('phone')}
                  placeholder="+61 4xx xxx xxx"
                  autoComplete="off"
                  inputMode="tel"
                />

                {errors.phone && (
                  <div className="form-error">{errors.phone}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile_location">
                Location
              </label>

              <input
                id="profile_location"
                type="text"
                name="customer_profile_location"
                className="form-input"
                value={form.location}
                onChange={e => handleProfileChange('location', e.target.value)}
                onBlur={() => validateProfileField('location')}
                autoComplete="off"
                placeholder="e.g. Canberra, ACT"
              />

              {errors.location && (
                <div className="form-error">{errors.location}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-lime"
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
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
            🔒 Change Password
          </div>

          {passwordApiError && (
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
              {passwordApiError}
            </div>
          )}

          <form onSubmit={handlePwSave} autoComplete="off" noValidate>
            {/* Fake fields reduce browser saved password autofill */}
            <input
              type="text"
              name="fake-profile-email"
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
              type="password"
              name="fake-profile-password"
              autoComplete="new-password"
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="current_password">
                  Current Password
                </label>

                <input
                  id="current_password"
                  type="password"
                  name="customer_current_password"
                  className="form-input"
                  value={pwForm.currentPassword}
                  onChange={e =>
                    handlePasswordChange('currentPassword', e.target.value)
                  }
                  onBlur={() => validatePasswordField('currentPassword')}
                  placeholder="••••••••"
                  autoComplete="off"
                />

                {pwErrors.currentPassword && (
                  <div className="form-error">
                    {pwErrors.currentPassword}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new_password">
                  New Password
                </label>

                <input
                  id="new_password"
                  type="password"
                  name="customer_new_password"
                  className="form-input"
                  value={pwForm.newPassword}
                  onChange={e =>
                    handlePasswordChange('newPassword', e.target.value)
                  }
                  onBlur={() => validatePasswordField('newPassword')}
                  placeholder="At least 8 chars"
                  autoComplete="new-password"
                />

                {pwErrors.newPassword && (
                  <div className="form-error">{pwErrors.newPassword}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-outline btn-sm"
              disabled={savingPassword}
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}