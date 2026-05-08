import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed or link expired');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 1.5rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:'1.8rem' }}>
          <Link to="/" style={{ fontFamily:"'Bebas Neue'", fontSize:'1.6rem', letterSpacing:'.18em', textDecoration:'none', color:'#eef5e8' }}>EVENT<span style={{ color:'#a8ff3e' }}>REVO</span></Link>
        </div>
        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'2rem', marginBottom:'.25rem' }}>New Password</h2>
          <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'1.5rem' }}>Choose a new password for your account.</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" />
            </div>
            <button type="submit" className="btn btn-lime btn-full" disabled={loading}>
              {loading ? <><Loader2 size={14} style={{animation:'spin .8s linear infinite'}}/> Resetting...</> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
