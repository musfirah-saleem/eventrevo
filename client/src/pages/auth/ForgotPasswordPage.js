import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 1.5rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:'1.8rem' }}>
          <Link to="/" style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', letterSpacing:'.18em', textDecoration:'none', color:'#eef5e8' }}>EVENT<span style={{ color:'#a8ff3e' }}>REVO</span></Link>
        </div>
        <div className="card" style={{ padding:'2rem' }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <CheckCircle size={40} style={{ color:'var(--lime)', margin:'0 auto 1rem' }} />
              <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', marginBottom:'.5rem' }}>Check Your Email</h2>
              <p style={{ color:'var(--muted)', fontSize:'.85rem', lineHeight:1.7 }}>We sent a password reset link to <strong>{email}</strong>. Check your inbox and spam folder.</p>
              <Link to="/login" className="btn btn-outline" style={{ marginTop:'1.5rem', display:'inline-flex' }}>Back to Login</Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'2rem', marginBottom:'.25rem' }}>Forgot Password</h2>
              <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'1.5rem' }}>Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <button type="submit" className="btn btn-lime btn-full" disabled={loading}>
                  {loading ? <><Loader2 size={14} style={{animation:'spin .8s linear infinite'}}/> Sending...</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
        <p style={{ textAlign:'center', marginTop:'1rem' }}>
          <Link to="/login" style={{ color:'var(--muted)', fontSize:'.8rem', textDecoration:'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
