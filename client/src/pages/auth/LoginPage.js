// // client/src/pages/auth/LoginPage.js
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import toast from 'react-hot-toast';
// import { Loader2 } from 'lucide-react';
// import * as yup from 'yup';

// const Logo = () => (
//   <div style={{ textAlign: 'center', marginBottom: '1.8rem', cursor: 'pointer' }}>
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 200 120"
//       height="60"
//       style={{ display: 'block', margin: '0 auto' }}
//     >
//       <defs>
//         <filter id="ga">
//           <feGaussianBlur stdDeviation="2.5" result="b" />
//           <feMerge>
//             <feMergeNode in="b" />
//             <feMergeNode in="SourceGraphic" />
//           </feMerge>
//         </filter>
//       </defs>

//       <ellipse cx="100" cy="52" rx="58" ry="55" fill="none" stroke="#2a3d2a" strokeWidth="11" />
//       <line x1="42" y1="52" x2="42" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round" />
//       <line x1="158" y1="52" x2="158" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round" />
//       <rect x="34" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />
//       <rect x="150" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />

//       <g filter="url(#ga)">
//         {[67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127].map((x, i) => {
//           const h = [26, 32, 36, 30, 34, 28, 36, 30, 26, 22, 26];
//           const t = [19, 13, 9, 15, 11, 17, 9, 15, 19, 23, 19];

//           return (
//             <rect
//               key={x}
//               x={x}
//               y={t[i]}
//               width="4"
//               height={h[i]}
//               rx="2"
//               fill="#a8ff3e"
//             />
//           );
//         })}
//       </g>

//       <text
//         x="100"
//         y="82"
//         textAnchor="middle"
//         fontFamily="Arial Black,sans-serif"
//         fontSize="27"
//         fontWeight="900"
//         fill="#d0d8c8"
//         stroke="#090c09"
//         strokeWidth="3"
//         paintOrder="stroke"
//       >
//         Event
//       </text>

//       <text
//         x="100"
//         y="109"
//         textAnchor="middle"
//         fontFamily="Arial Black,sans-serif"
//         fontSize="27"
//         fontWeight="900"
//         fill="#d0d8c8"
//         stroke="#090c09"
//         strokeWidth="3"
//         paintOrder="stroke"
//       >
//         Rev
//       </text>

//       <text
//         x="134"
//         y="109"
//         textAnchor="middle"
//         fontFamily="Arial Black,sans-serif"
//         fontSize="27"
//         fontWeight="900"
//         fill="#a8ff3e"
//         stroke="#090c09"
//         strokeWidth="3"
//         paintOrder="stroke"
//       >
//         o
//       </text>

//       <circle cx="138" cy="101" r="8" fill="#1e2e1e" />
//       <circle cx="138" cy="101" r="3" fill="#a8ff3e" />
//     </svg>

//     <span
//       style={{
//         fontFamily: "'Bebas Neue'",
//         fontSize: '1.4rem',
//         letterSpacing: '.2em',
//         display: 'block',
//         marginTop: '.4rem',
//       }}
//     >
//       EVENT<span style={{ color: '#a8ff3e' }}>REVO</span>
//     </span>
//   </div>
// );

// export default function LoginPage() {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: '',
//     password: '',
//   });

//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const schema = yup.object().shape({
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
//       .min(8, 'Password must be at least 8 characters'),
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

//     setApiError('');
//   };

//   const validateField = async field => {
//     try {
//       await schema.validateAt(field, form);

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
//     e.stopPropagation();

//     setApiError('');

//     try {
//       const validatedData = await schema.validate(form, {
//         abortEarly: false,
//       });

//       setErrors({});
//       setLoading(true);

//       const user = await login(
//         validatedData.email.trim(),
//         validatedData.password
//       );

//       toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);

//       if (user.role === 'dj') {
//         navigate('/dashboard/dj');
//       } else if (user.role === 'admin') {
//         navigate('/dashboard/admin');
//       } else {
//         navigate('/dashboard/customer');
//       }
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

//       let message = 'Wrong email or password';

//       if (error.response?.status === 404) {
//         message = 'User not found';
//       } else if (error.response?.status === 401) {
//         message = 'Wrong email or password';
//       } else if (error.response?.data?.error) {
//         message = error.response.data.error;
//       } else if (error.response?.data?.message) {
//         message = error.response.data.message;
//       } else if (error.message) {
//         message = error.message;
//       }

//       setApiError(message);
//       toast.error(message);

//       // Do not clear form here.
//       // Email and password will remain in the inputs.
//     } finally {
//       setLoading(false);
//     }
//   };

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

//       <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
//         <Logo />

//         <div className="card" style={{ padding: '2rem' }}>
//           <h2
//             style={{
//               fontFamily: "'Bebas Neue'",
//               fontSize: '2.2rem',
//               letterSpacing: '.04em',
//               marginBottom: '.2rem',
//             }}
//           >
//             Welcome Back
//           </h2>

//           <p
//             style={{
//               color: 'var(--muted)',
//               fontSize: '.85rem',
//               marginBottom: '1.6rem',
//             }}
//           >
//             Sign in to your EventRevo account
//           </p>

//           {apiError && (
//             <div
//               className="form-error"
//               style={{
//                 background: 'rgba(255, 80, 80, 0.08)',
//                 border: '1px solid rgba(255, 80, 80, 0.25)',
//                 padding: '.75rem .9rem',
//                 borderRadius: 2,
//                 marginBottom: '1rem',
//                 lineHeight: 1.5,
//               }}
//             >
//               {apiError}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} autoComplete="off" noValidate>
//             {/* Fake fields reduce browser saved-password autofill */}
//             <input
//               type="text"
//               name="fake-login-email"
//               autoComplete="off"
//               tabIndex={-1}
//               aria-hidden="true"
//               style={{
//                 position: 'absolute',
//                 left: '-9999px',
//                 width: 1,
//                 height: 1,
//                 opacity: 0,
//               }}
//             />

//             <input
//               type="password"
//               name="fake-login-password"
//               autoComplete="new-password"
//               tabIndex={-1}
//               aria-hidden="true"
//               style={{
//                 position: 'absolute',
//                 left: '-9999px',
//                 width: 1,
//                 height: 1,
//                 opacity: 0,
//               }}
//             />

//             <div className="form-group">
//               <label className="form-label" htmlFor="login_email">
//                 Email
//               </label>

//               <input
//                 id="login_email"
//                 type="text"
//                 name="login_email_no_autofill"
//                 className="form-input"
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={e => handleChange('email', e.target.value)}
//                 onBlur={() => validateField('email')}
//                 autoComplete="off"
//                 inputMode="email"
//               />

//               {errors.email && (
//                 <div className="form-error">{errors.email}</div>
//               )}
//             </div>

//             <div className="form-group">
//               <label className="form-label" htmlFor="login_password">
//                 Password
//               </label>

//               <input
//                 id="login_password"
//                 type="password"
//                 name="login_password_no_autofill"
//                 className="form-input"
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={e => handleChange('password', e.target.value)}
//                 onBlur={() => validateField('password')}
//                 autoComplete="new-password"
//               />

//               {errors.password && (
//                 <div className="form-error">{errors.password}</div>
//               )}

//               <div className="form-hint" style={{ textAlign: 'right' }}>
//                 <Link
//                   to="/forgot-password"
//                   style={{
//                     color: 'var(--lime)',
//                     textDecoration: 'none',
//                     fontSize: '.72rem',
//                   }}
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="btn btn-lime btn-full"
//               disabled={loading}
//               style={{ marginTop: '.5rem' }}
//             >
//               {loading ? (
//                 <>
//                   <Loader2
//                     size={14}
//                     style={{ animation: 'spin 0.8s linear infinite' }}
//                   />{' '}
//                   Signing in...
//                 </>
//               ) : (
//                 'Sign In'
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
//           Don&apos;t have an account?{' '}
//           <Link
//             to="/register"
//             style={{
//               color: 'var(--lime)',
//               textDecoration: 'underline',
//               textUnderlineOffset: 3,
//             }}
//           >
//             Sign up free
//           </Link>
//         </p>

//         <p style={{ textAlign: 'center', marginTop: '.5rem' }}>
//           <Link
//             to="/djs"
//             style={{
//               color: 'var(--muted)',
//               fontSize: '.75rem',
//               textDecoration: 'none',
//             }}
//           >
//             ← Browse DJs without signing in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }




// client/src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import * as yup from 'yup';

const Logo = () => (
  <div className="auth-logo">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 120"
      className="auth-logo-svg"
    >
      <defs>
        <filter id="ga">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="100"
        cy="52"
        rx="58"
        ry="55"
        fill="none"
        stroke="#2a3d2a"
        strokeWidth="11"
      />
      <line
        x1="42"
        y1="52"
        x2="42"
        y2="90"
        stroke="#2a3d2a"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <line
        x1="158"
        y1="52"
        x2="158"
        y2="90"
        stroke="#2a3d2a"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <rect x="34" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />
      <rect x="150" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />

      <g filter="url(#ga)">
        {[67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127].map((x, i) => {
          const h = [26, 32, 36, 30, 34, 28, 36, 30, 26, 22, 26];
          const t = [19, 13, 9, 15, 11, 17, 9, 15, 19, 23, 19];

          return (
            <rect
              key={x}
              x={x}
              y={t[i]}
              width="4"
              height={h[i]}
              rx="2"
              fill="#a8ff3e"
            />
          );
        })}
      </g>

      <text
        x="100"
        y="82"
        textAnchor="middle"
        fontFamily="Arial Black,sans-serif"
        fontSize="27"
        fontWeight="900"
        fill="#d0d8c8"
        stroke="#090c09"
        strokeWidth="3"
        paintOrder="stroke"
      >
        Event
      </text>

      <text
        x="100"
        y="109"
        textAnchor="middle"
        fontFamily="Arial Black,sans-serif"
        fontSize="27"
        fontWeight="900"
        fill="#d0d8c8"
        stroke="#090c09"
        strokeWidth="3"
        paintOrder="stroke"
      >
        Rev
      </text>

      <text
        x="134"
        y="109"
        textAnchor="middle"
        fontFamily="Arial Black,sans-serif"
        fontSize="27"
        fontWeight="900"
        fill="#a8ff3e"
        stroke="#090c09"
        strokeWidth="3"
        paintOrder="stroke"
      >
        o
      </text>

      <circle cx="138" cy="101" r="8" fill="#1e2e1e" />
      <circle cx="138" cy="101" r="3" fill="#a8ff3e" />
    </svg>

    <span className="auth-logo-text">
      EVENT<span>REVO</span>
    </span>
  </div>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const schema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .required('Email is required')
      .email('Please enter a valid email address')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'),

    password: yup
      .string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
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

    setApiError('');
  };

  const validateField = async field => {
    try {
      await schema.validateAt(field, form);

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
      });

      setErrors({});
      setLoading(true);

      const user = await login(validatedData.email.trim(), validatedData.password);

      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);

      if (user.role === 'dj') {
        navigate('/dashboard/dj');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/customer');
      }
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

      let message = 'Wrong email or password';

      if (error.response?.status === 404) {
        message = 'User not found';
      } else if (error.response?.status === 401) {
        message = 'Wrong email or password';
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-bg-glow" />

      <section className="auth-shell" aria-label="Login form">
        <Logo />

        <div className="card auth-card">
          <h1 className="auth-title">Welcome Back</h1>

          <p className="auth-subtitle">Sign in to your EventRevo account</p>

          {apiError && <div className="form-error auth-api-error">{apiError}</div>}

          <form onSubmit={handleSubmit} autoComplete="off" noValidate>
            {/* Fake fields reduce browser saved-password autofill */}
            <input
              type="text"
              name="fake-login-email"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="auth-hidden-field"
            />

            <input
              type="password"
              name="fake-login-password"
              autoComplete="new-password"
              tabIndex={-1}
              aria-hidden="true"
              className="auth-hidden-field"
            />

            <div className="form-group">
              <label className="form-label" htmlFor="login_email">
                Email
              </label>

              <input
                id="login_email"
                type="text"
                name="login_email_no_autofill"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                onBlur={() => validateField('email')}
                autoComplete="off"
                inputMode="email"
              />

              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login_password">
                Password
              </label>

              <input
                id="login_password"
                type="password"
                name="login_password_no_autofill"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                onBlur={() => validateField('password')}
                autoComplete="new-password"
              />

              {errors.password && <div className="form-error">{errors.password}</div>}

              <div className="form-hint auth-forgot">
                <Link to="/forgot-password">Forgot password?</Link>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="auth-register-text">
          Don&apos;t have an account?{' '}
          <Link to="/register">Sign up free</Link>
        </p>

        <p className="auth-browse-text">
          <Link to="/djs">← Browse DJs without signing in</Link>
        </p>
      </section>
    </main>
  );
}