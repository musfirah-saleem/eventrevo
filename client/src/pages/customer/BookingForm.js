// client/src/pages/customer/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { djAPI, bookingAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

const EVENT_TYPES = ['Wedding','Corporate / EOFY','Birthday','Private Party','NYE Party','Festival','Club Night','Anniversary','Other'];

export default function BookingForm() {
  const { djId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dj, setDj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    eventType:'', eventDate:'', startTime:'19:00', endTime:'23:00',
    location:'', notes:'', guestCount:'',
    guestName:'', guestEmail:'',
  });

  useEffect(() => { djAPI.getOne(djId).then(r => setDj(r.data.data)).catch(() => toast.error('DJ not found')); }, [djId]);

  const calcDuration = () => {
    const [sh,sm] = form.startTime.split(':').map(Number);
    const [eh,em] = form.endTime.split(':').map(Number);
    let d = (eh+em/60)-(sh+sm/60);
    if(d<=0) d+=24;
    return d;
  };
  const duration = calcDuration();
  const total = dj?.hourlyRate ? Math.round(dj.hourlyRate * duration) : 0;
  const deposit = Math.round(total * 0.2);
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventType) { toast.error('Please select an event type'); return; }
    if (dj && duration < dj.minimumHours) { toast.error(`Minimum booking is ${dj.minimumHours} hours`); return; }
    setLoading(true);
    try {
      const payload = { djProfileId: djId, ...form, guestCount: form.guestCount ? Number(form.guestCount) : undefined };
      if (!user) { if(!form.guestName||!form.guestEmail){toast.error('Name and email required');setLoading(false);return;} }
      const res = await bookingAPI.create(payload);
      toast.success('Booking request sent! 🎉');
      navigate(user ? '/dashboard/customer' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (!dj) return <div style={{ display:'flex', justifyContent:'center', padding:'5rem' }}><div className="spinner"/></div>;

  return (
    <div style={{ paddingTop:60, minHeight:'100vh' }}>
      <div style={{ maxWidth:600, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
        <Link to={`/djs/${djId}`} className="btn btn-ghost btn-sm" style={{ marginBottom:'1.5rem', display:'inline-flex' }}>
          <ArrowLeft size={13}/> Back to profile
        </Link>

        <div className="eyebrow" style={{ marginBottom:'.5rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Booking Enquiry</span></div>
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'3rem', letterSpacing:'.03em', lineHeight:1, marginBottom:'.5rem' }}>
          Book <span style={{ color:'var(--lime)' }}>{dj.stageName}</span>
        </h1>
        <p style={{ color:'var(--muted)', fontSize:'.85rem', marginBottom:'2rem' }}>Fill in your event details. The DJ reviews and responds within 24–48 hours.</p>

        {!user && (
          <div style={{ background:'rgba(168,255,62,.05)', border:'1px solid rgba(168,255,62,.18)', padding:'.9rem 1rem', fontSize:'.8rem', color:'#c4ff7a', lineHeight:1.6, marginBottom:'1.5rem', borderRadius:2 }}>
            💡 <Link to="/register" style={{ color:'var(--lime)' }}>Create a free account</Link> to track your booking, receive notifications, and pay your deposit online.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem' }}>📅 Event Details</div>
            <div className="form-group">
              <label className="form-label">Event Type *</label>
              <select className="form-input form-select" value={form.eventType} onChange={e=>setForm({...form,eventType:e.target.value})} required>
                <option value="">Select event type...</option>
                {EVENT_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Event Date *</label><input type="date" className="form-input" min={today} value={form.eventDate} onChange={e=>setForm({...form,eventDate:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Approx. Guests</label><input type="number" className="form-input" value={form.guestCount} onChange={e=>setForm({...form,guestCount:e.target.value})} placeholder="e.g. 80" min={1}/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start Time *</label><input type="time" className="form-input" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">End Time *</label><input type="time" className="form-input" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} required/></div>
            </div>
            {duration > 0 && (
              <div style={{ background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.2)', padding:'.8rem 1rem', fontSize:'.82rem', borderRadius:2 }}>
                <span style={{ color:'var(--muted)' }}>Duration: </span>
                <span style={{ color:'var(--lime)', fontWeight:500 }}>{duration.toFixed(1)} hours</span>
                {total > 0 && <span style={{ color:'var(--muted)', marginLeft:'1rem' }}>Est. total: <span style={{ color:'var(--white)', fontWeight:500 }}>A${total}</span> · Deposit: <span style={{ color:'var(--lime)' }}>A${deposit}</span></span>}
              </div>
            )}
          </div>

          <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
            <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem' }}>📍 Venue & Notes</div>
            <div className="form-group"><label className="form-label">Venue / Location *</label><input type="text" className="form-input" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. The Street Theatre, Civic ACT" required/></div>
            <div className="form-group"><label className="form-label">Additional Notes</label><textarea className="form-input form-textarea" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Music preferences, theme, special requests..."/></div>
          </div>

          {!user && (
            <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--lime)', marginBottom:'1rem' }}>👤 Your Details (Guest)</div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Your Name *</label><input type="text" className="form-input" value={form.guestName} onChange={e=>setForm({...form,guestName:e.target.value})} placeholder="Full name" required/></div>
                <div className="form-group"><label className="form-label">Your Email *</label><input type="email" className="form-input" value={form.guestEmail} onChange={e=>setForm({...form,guestEmail:e.target.value})} placeholder="you@example.com" required/></div>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-lime btn-full" style={{ padding:'1rem' }} disabled={loading}>
            {loading ? <><Loader2 size={14} style={{ animation:'spin .8s linear infinite' }}/> Submitting...</> : 'Send Booking Request'}
          </button>
          <p style={{ fontSize:'.7rem', color:'var(--muted)', textAlign:'center', marginTop:'.8rem' }}>No payment required now. 20% deposit due on confirmation.</p>
        </form>
      </div>
    </div>
  );
}
