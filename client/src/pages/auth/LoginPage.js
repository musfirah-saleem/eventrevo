// client/src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const Logo = () => (
  <div style={{ textAlign:'center', marginBottom:'1.8rem', cursor:'pointer' }}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" height="60" style={{ display:'block', margin:'0 auto' }}>
      <defs><filter id="ga"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <ellipse cx="100" cy="52" rx="58" ry="55" fill="none" stroke="#2a3d2a" strokeWidth="11"/>
      <line x1="42" y1="52" x2="42" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round"/>
      <line x1="158" y1="52" x2="158" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round"/>
      <rect x="34" y="84" width="16" height="22" rx="8" fill="#2a3d2a"/><rect x="150" y="84" width="16" height="22" rx="8" fill="#2a3d2a"/>
      <g filter="url(#ga)">
        {[67,73,79,85,91,97,103,109,115,121,127].map((x,i)=>{
          const h=[26,32,36,30,34,28,36,30,26,22,26],t=[19,13,9,15,11,17,9,15,19,23,19];
          return <rect key={x} x={x} y={t[i]} width="4" height={h[i]} rx="2" fill="#a8ff3e"/>;
        })}
      </g>
      <text x="100" y="82" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#d0d8c8" stroke="#090c09" strokeWidth="3" paintOrder="stroke">Event</text>
      <text x="100" y="109" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#d0d8c8" stroke="#090c09" strokeWidth="3" paintOrder="stroke">Rev</text>
      <text x="134" y="109" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#a8ff3e" stroke="#090c09" strokeWidth="3" paintOrder="stroke">o</text>
      <circle cx="138" cy="101" r="8" fill="#1e2e1e"/><circle cx="138" cy="101" r="3" fill="#a8ff3e"/>
    </svg>
    <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.2em', display:'block', marginTop:'.4rem' }}>
      EVENT<span style={{ color:'#a8ff3e' }}>REVO</span>
    </span>
  </div>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      if (user.role === 'dj') navigate('/dashboard/dj');
      else if (user.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/customer');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 1.5rem 3rem', position:'relative' }}>
      <div style={{ position:'absolute', width:600, height:600, top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:'50%', background:'radial-gradient(circle,rgba(168,255,62,.05) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        <Logo />
        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.2rem', letterSpacing:'.04em', marginBottom:'.2rem' }}>Welcome Back</h2>
          <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'1.6rem' }}>Sign in to your EventRevo account</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
              <div className="form-hint" style={{ textAlign:'right' }}>
                <Link to="/forgot-password" style={{ color:'var(--lime)', textDecoration:'none', fontSize:'.72rem' }}>Forgot password?</Link>
              </div>
            </div>
            <button type="submit" className="btn btn-lime btn-full" disabled={loading} style={{ marginTop:'.5rem' }}>
              {loading ? <><Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'.82rem', marginTop:'1.2rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'var(--lime)', textDecoration:'underline', textUnderlineOffset:3 }}>Sign up free</Link>
        </p>
        <p style={{ textAlign:'center', marginTop:'.5rem' }}>
          <Link to="/djs" style={{ color:'var(--muted)', fontSize:'.75rem', textDecoration:'none' }}>← Browse DJs without signing in</Link>
        </p>
      </div>
    </div>
  );
}
