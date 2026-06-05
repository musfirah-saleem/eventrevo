// // client/src/pages/auth/RegisterPage.js
// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import toast from 'react-hot-toast';
// import { Loader2, Users, Music2 } from 'lucide-react';
// import * as yup from 'yup';

// export default function RegisterPage() {
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const [role, setRole] = useState('customer');

//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     password: '',
//     stageName: '',
//   });

//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     setForm({
//       name: '',
//       email: '',
//       password: '',
//       stageName: '',
//     });
//     setErrors({});
//   }, []);

//   const schema = yup.object().shape({
//     name: yup
//       .string()
//       .trim()
//       .required('name is required')
//       .min(2, 'Full name must be at least 2 characters')
//       .matches(/^[A-Za-z\s]+$/, 'Full name can only contain letters and spaces'),

//     email: yup
//       .string()
//       .trim()
//       .required('Email is required')
//       .email('Please enter a valid email address')
//       .matches(
//         /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//         'Please enter a valid email address'
//       ),

//     password: yup
//       .string()
//       .required('Password is required')
//       .min(8, 'Password must be at least 8 characters')
//       .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
//       .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
//       .matches(/[0-9]/, 'Password must contain at least one number')
//       .matches(
//         /[!@#$%^&*(),.?":{}|<>]/,
//         'Password must contain at least one special character'
//       ),

//     stageName: yup.string().when('$role', {
//       is: 'dj',
//       then: schema =>
//         schema
//           .trim()
//           .required('Stage name is required for DJs')
//           .min(2, 'Stage name must be at least 2 characters'),
//       otherwise: schema => schema.notRequired(),
//     }),
//   });

//   const handleChange = (field, value) => {
//     setForm(prev => ({
//       ...prev,
//       [field]: value,
//     }));

//     setErrors(prev => ({
//       ...prev,
//       [field]: '',
//     }));
//   };

//   const validateField = async field => {
//     try {
//       await schema.validateAt(field, form, {
//         context: { role },
//       });

//       setErrors(prev => {
//         const updatedErrors = { ...prev };
//         delete updatedErrors[field];
//         return updatedErrors;
//       });
//     } catch (error) {
//       setErrors(prev => ({
//         ...prev,
//         [field]: error.message,
//       }));
//     }
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     try {
//       const validatedData = await schema.validate(form, {
//         abortEarly: false,
//         context: { role },
//       });

//       setErrors({});
//       setLoading(true);

//       const payload = {
//         ...validatedData,
//         role,
//       };

//       if (role !== 'dj') {
//         delete payload.stageName;
//       }

//       const user = await register(payload);

//       toast.success('Account created! Welcome to EventRevo 🎉');

//       navigate(user.role === 'dj' ? '/dashboard/dj' : '/dashboard/customer');
//     } catch (error) {
//       if (error.name === 'ValidationError') {
//         const validationErrors = {};

//         error.inner.forEach(err => {
//           if (err.path && !validationErrors[err.path]) {
//             validationErrors[err.path] = err.message;
//           }
//         });

//         setErrors(validationErrors);
//         return;
//       }

//       toast.error(error.response?.data?.error || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roleCardStyle = r => ({
//     padding: '1rem',
//     border: `1px solid ${
//       role === r ? 'var(--lime)' : 'rgba(255,255,255,.1)'
//     }`,
//     background: role === r ? 'var(--lime-dim)' : 'transparent',
//     cursor: 'pointer',
//     textAlign: 'left',
//     borderRadius: 2,
//     transition: 'all .2s',
//     color: 'var(--white)',
//   });

//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '80px 1.5rem 3rem',
//         position: 'relative',
//       }}
//     >
//       <div
//         style={{
//           position: 'absolute',
//           width: 600,
//           height: 600,
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%,-50%)',
//           borderRadius: '50%',
//           background:
//             'radial-gradient(circle,rgba(168,255,62,.05) 0%,transparent 70%)',
//           pointerEvents: 'none',
//         }}
//       />

//       <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
//         <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
//           <span
//             style={{
//               fontFamily: "'Bebas Neue'",
//               fontSize: '1.8rem',
//               letterSpacing: '.18em',
//               cursor: 'pointer',
//             }}
//             onClick={() => navigate('/')}
//           >
//             EVENT<span style={{ color: 'var(--lime)' }}>REVO</span>
//           </span>
//         </div>

//         <div className="card" style={{ padding: '2rem' }}>
//           <h2
//             style={{
//               fontFamily: "'Bebas Neue'",
//               fontSize: '2.2rem',
//               letterSpacing: '.04em',
//               marginBottom: '.2rem',
//             }}
//           >
//             Create Account
//           </h2>

//           <p
//             style={{
//               color: 'var(--muted)',
//               fontSize: '.85rem',
//               marginBottom: '1.4rem',
//             }}
//           >
//             Join Canberra&apos;s #1 DJ platform
//           </p>

//           <div
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr 1fr',
//               gap: '.6rem',
//               marginBottom: '1.4rem',
//             }}
//           >
//             <button
//               type="button"
//               style={roleCardStyle('customer')}
//               onClick={() => {
//                 setRole('customer');
//                 setErrors({});
//                 setForm(prev => ({
//                   ...prev,
//                   stageName: '',
//                 }));
//               }}
//             >
//               <Users
//                 size={18}
//                 style={{
//                   color: role === 'customer' ? 'var(--lime)' : 'var(--muted)',
//                   marginBottom: '.5rem',
//                   display: 'block',
//                 }}
//               />
//               <span
//                 style={{
//                   fontSize: '.78rem',
//                   fontWeight: 500,
//                   display: 'block',
//                   marginBottom: '.15rem',
//                 }}
//               >
//                 I&apos;m booking a DJ
//               </span>
//               <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
//                 Event host · Customer
//               </span>
//             </button>

//             <button
//               type="button"
//               style={roleCardStyle('dj')}
//               onClick={() => {
//                 setRole('dj');
//                 setErrors({});
//               }}
//             >
//               <Music2
//                 size={18}
//                 style={{
//                   color: role === 'dj' ? 'var(--lime)' : 'var(--muted)',
//                   marginBottom: '.5rem',
//                   display: 'block',
//                 }}
//               />
//               <span
//                 style={{
//                   fontSize: '.78rem',
//                   fontWeight: 500,
//                   display: 'block',
//                   marginBottom: '.15rem',
//                 }}
//               >
//                 I&apos;m a DJ
//               </span>
//               <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
//                 List my services
//               </span>
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} autoComplete="off" noValidate>
//             <input
//               type="text"
//               name="fake-register-username"
//               autoComplete="username"
//               style={{ display: 'none' }}
//               tabIndex={-1}
//             />

//             <input
//               type="password"
//               name="fake-register-password"
//               autoComplete="new-password"
//               style={{ display: 'none' }}
//               tabIndex={-1}
//             />

//             <div className="form-group">
//               <label className="form-label">Full Name</label>
//               <input
//                 type="text"
//                 name="register_full_name"
//                 className="form-input"
//                 placeholder="Your name"
//                 value={form.name}
//                 onChange={e => handleChange('name', e.target.value)}
//                 onBlur={() => validateField('name')}
//                 autoComplete="off"
//               />
//               {errors.name && <div className="form-error">{errors.name}</div>}
//             </div>

//             {role === 'dj' && (
//               <div className="form-group">
//                 <label className="form-label">Stage Name</label>
//                 <input
//                   type="text"
//                   name="register_stage_name"
//                   className="form-input"
//                   placeholder="e.g. DJ Kastro"
//                   value={form.stageName}
//                   onChange={e => handleChange('stageName', e.target.value)}
//                   onBlur={() => validateField('stageName')}
//                   autoComplete="off"
//                 />
//                 {errors.stageName && (
//                   <div className="form-error">{errors.stageName}</div>
//                 )}
//                 <span className="form-hint">
//                   Shown publicly on the marketplace
//                 </span>
//               </div>
//             )}

//             <div className="form-group">
//               <label className="form-label">Email</label>
//               <input
//                 type="text"
//                 name="register_new_email"
//                 className="form-input"
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={e => handleChange('email', e.target.value)}
//                 onBlur={() => validateField('email')}
//                 autoComplete="off"
//                 inputMode="email"
//               />
//               {errors.email && <div className="form-error">{errors.email}</div>}
//             </div>

//             <div className="form-group">
//               <label className="form-label">Password</label>
//               <input
//                 type="password"
//                 name="register_new_password"
//                 className="form-input"
//                 placeholder="At least 8 characters"
//                 value={form.password}
//                 onChange={e => handleChange('password', e.target.value)}
//                 onBlur={() => validateField('password')}
//                 autoComplete="new-password"
//               />
//               {errors.password && (
//                 <div className="form-error">{errors.password}</div>
//               )}
//             </div>

//             {role === 'dj' && (
//               <div
//                 style={{
//                   background: 'rgba(168,255,62,.05)',
//                   border: '1px solid rgba(168,255,62,.15)',
//                   padding: '.8rem 1rem',
//                   fontSize: '.78rem',
//                   color: 'var(--muted2)',
//                   lineHeight: 1.6,
//                   borderRadius: 2,
//                   marginBottom: '1rem',
//                 }}
//               >
//                 🎧 DJ accounts are reviewed before going live on the
//                 marketplace. You&apos;ll be notified once approved.
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn btn-lime btn-full"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2
//                     size={14}
//                     style={{ animation: 'spin 0.8s linear infinite' }}
//                   />{' '}
//                   Creating...
//                 </>
//               ) : (
//                 'Create Account'
//               )}
//             </button>
//           </form>
//         </div>

//         <p
//           style={{
//             textAlign: 'center',
//             color: 'var(--muted)',
//             fontSize: '.82rem',
//             marginTop: '1.2rem',
//           }}
//         >
//           Already have an account?{' '}
//           <Link
//             to="/login"
//             style={{
//               color: 'var(--lime)',
//               textDecoration: 'underline',
//               textUnderlineOffset: 3,
//             }}
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


// client/src/pages/auth/RegisterPage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Users, Music2 } from 'lucide-react';
import * as yup from 'yup';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    stageName: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      name: '',
      email: '',
      password: '',
      stageName: '',
    });
    setErrors({});
  }, []);

  const schema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .required('Name is required')
      .min(2, 'Full name must be at least 2 characters')
      .matches(/^[A-Za-z\s]+$/, 'Full name can only contain letters and spaces'),

    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Please enter a valid email address')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),

    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),

    stageName: yup.string().when('$role', {
      is: 'dj',
      then: schema =>
        schema
          .trim()
          .required('Stage name is required for DJs')
          .min(2, 'Stage name must be at least 2 characters'),
      otherwise: schema => schema.notRequired(),
    }),
  });

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [field]: '',
    }));
  };

  const validateField = async field => {
    try {
      await schema.validateAt(field, form, {
        context: { role },
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

  const selectRole = selectedRole => {
    setRole(selectedRole);
    setErrors({});

    if (selectedRole !== 'dj') {
      setForm(prev => ({
        ...prev,
        stageName: '',
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const validatedData = await schema.validate(form, {
        abortEarly: false,
        context: { role },
      });

      setErrors({});
      setLoading(true);

      const payload = {
        ...validatedData,
        role,
      };

      if (role !== 'dj') {
        delete payload.stageName;
      }

      const user = await register(payload);

      toast.success('Account created! Welcome to EventRevo 🎉');

      navigate(user.role === 'dj' ? '/dashboard/dj' : '/dashboard/customer');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = {};

        error.inner.forEach(err => {
          if (err.path && !validationErrors[err.path]) {
            validationErrors[err.path] = err.message;
          }
        });

        setErrors(validationErrors);
        return;
      }

      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page--register">
      <div className="auth-bg-glow" />

      <section className="auth-shell auth-shell--register" aria-label="Create account form">
        <div className="auth-simple-logo">
          <button type="button" onClick={() => navigate('/')}>
            EVENT<span>REVO</span>
          </button>
        </div>

        <div className="card auth-card">
          <h1 className="auth-title">Create Account</h1>

          <p className="auth-subtitle">Join Canberra&apos;s #1 DJ platform</p>

          <div className="auth-role-grid" role="group" aria-label="Choose account type">
            <button
              type="button"
              className={`auth-role-card ${role === 'customer' ? 'active' : ''}`}
              onClick={() => selectRole('customer')}
              aria-pressed={role === 'customer'}
            >
              <Users size={18} className="auth-role-icon" />

              <span className="auth-role-title">Customer</span>

              <span className="auth-role-desc">
                Book DJs for weddings, parties and events.
              </span>
            </button>

            <button
              type="button"
              className={`auth-role-card ${role === 'dj' ? 'active' : ''}`}
              onClick={() => selectRole('dj')}
              aria-pressed={role === 'dj'}
            >
              <Music2 size={18} className="auth-role-icon" />

              <span className="auth-role-title">DJ / Talent</span>

              <span className="auth-role-desc">
                Create a profile and receive booking enquiries.
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="register_name">
                Full Name
              </label>

              <input
                id="register_name"
                type="text"
                name="register_name"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                onBlur={() => validateField('name')}
                autoComplete="name"
              />

              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {role === 'dj' && (
              <div className="form-group">
                <label className="form-label" htmlFor="register_stage_name">
                  Stage Name
                </label>

                <input
                  id="register_stage_name"
                  type="text"
                  name="register_stage_name"
                  className="form-input"
                  placeholder="DJ name / artist name"
                  value={form.stageName}
                  onChange={e => handleChange('stageName', e.target.value)}
                  onBlur={() => validateField('stageName')}
                  autoComplete="off"
                />

                {errors.stageName && (
                  <div className="form-error">{errors.stageName}</div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="register_email">
                Email
              </label>

              <input
                id="register_email"
                type="text"
                name="register_email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => validateField('email')}
                autoComplete="email"
                inputMode="email"
              />

              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register_password">
                Password
              </label>

              <input
                id="register_password"
                type="password"
                name="register_password"
                className="form-input"
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => validateField('password')}
                autoComplete="new-password"
              />

              {errors.password && (
                <div className="form-error">{errors.password}</div>
              )}

              <div className="form-hint">
                Use 8+ characters with uppercase, lowercase, number and symbol.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-lime btn-full auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="auth-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <p className="auth-register-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        <p className="auth-browse-text">
          <Link to="/djs">← Browse DJs without signing in</Link>
        </p>
      </section>
    </main>
  );
}