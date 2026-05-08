// client/src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Users, Music2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name:'', email:'', password:'', stageName:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Account created! Welcome to EventRevo 🎉`);
      navigate(user.role === 'dj' ? '/dashboard/dj' : '/dashboard/customer');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const roleCardStyle = (r) => ({
    padding:'1rem', border:`1px solid ${role===r?'var(--lime)':'rgba(255,255,255,.1)'}`,
    background: role===r ? 'var(--lime-dim)' : 'transparent',
    cursor:'pointer', textAlign:'left', borderRadius:2, transition:'all .2s', color:'var(--white)',
  });

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 1.5rem 3rem', position:'relative' }}>
      <div style={{ position:'absolute', width:600, height:600, top:'50%', left:'50%', transform:'translate(-50%,-50%)', borderRadius:'50%', background:'radial-gradient(circle,rgba(168,255,62,.05) 0%,transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', maxWidth:440, position:'relative' }}>
        <div style={{ textAlign:'center', marginBottom:'1.8rem' }}>
          <span style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', letterSpacing:'.18em', cursor:'pointer' }} onClick={()=>navigate('/')}>
            EVENT<span style={{ color:'var(--lime)' }}>REVO</span>
          </span>
        </div>
        <div className="card" style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.2rem', letterSpacing:'.04em', marginBottom:'.2rem' }}>Create Account</h2>
          <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'1.4rem' }}>Join Canberra's #1 DJ platform</p>

          {/* Role picker */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.6rem', marginBottom:'1.4rem' }}>
            <button type="button" style={roleCardStyle('customer')} onClick={()=>setRole('customer')}>
              <Users size={18} style={{ color: role==='customer'?'var(--lime)':'var(--muted)', marginBottom:'.5rem', display:'block' }}/>
              <span style={{ fontSize:'.78rem', fontWeight:500, display:'block', marginBottom:'.15rem' }}>I'm booking a DJ</span>
              <span style={{ fontSize:'.65rem', color:'var(--muted)' }}>Event host · Customer</span>
            </button>
            <button type="button" style={roleCardStyle('dj')} onClick={()=>setRole('dj')}>
              <Music2 size={18} style={{ color: role==='dj'?'var(--lime)':'var(--muted)', marginBottom:'.5rem', display:'block' }}/>
              <span style={{ fontSize:'.78rem', fontWeight:500, display:'block', marginBottom:'.15rem' }}>I'm a DJ</span>
              <span style={{ fontSize:'.65rem', color:'var(--muted)' }}>List my services</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Your name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength={2} />
            </div>
            {role === 'dj' && (
              <div className="form-group">
                <label className="form-label">Stage Name</label>
                <input type="text" className="form-input" placeholder="e.g. DJ Kastro" value={form.stageName} onChange={e=>setForm({...form,stageName:e.target.value})} />
                <span className="form-hint">Shown publicly on the marketplace</span>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="At least 8 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} />
            </div>

            {role === 'dj' && (
              <div style={{ background:'rgba(168,255,62,.05)', border:'1px solid rgba(168,255,62,.15)', padding:'.8rem 1rem', fontSize:'.78rem', color:'var(--muted2)', lineHeight:1.6, borderRadius:2, marginBottom:'1rem' }}>
                🎧 DJ accounts are reviewed before going live on the marketplace. You'll be notified once approved.
              </div>
            )}

            <button type="submit" className="btn btn-lime btn-full" disabled={loading}>
              {loading ? <><Loader2 size={14} style={{ animation:'spin 0.8s linear infinite' }}/> Creating...</> : 'Create Account'}
            </button>
          </form>
        </div>
        <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'.82rem', marginTop:'1.2rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--lime)', textDecoration:'underline', textUnderlineOffset:3 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
