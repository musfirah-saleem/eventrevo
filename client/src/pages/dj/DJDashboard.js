// client/src/pages/dj/DJDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { StatCard, BookingRow, EmptyState, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, Clock, DollarSign, User, Image } from 'lucide-react';

export default function DJDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getAll().then(r => setBookings(r.data.data||[])).catch(()=>toast.error('Failed to load bookings')).finally(()=>setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await bookingAPI.updateStatus(id, action);
      setBookings(prev => prev.map(b => b._id===id ? {...b, status: action==='confirm'?'confirmed':action==='decline'?'declined':b.status} : b));
      toast.success(action==='confirm'?'Booking confirmed! Customer notified.':'Booking declined.');
    } catch { toast.error('Action failed'); }
  };

  const pending   = bookings.filter(b=>b.status==='pending');
  const confirmed = bookings.filter(b=>b.status==='confirmed');
  const revenue   = confirmed.reduce((s,b)=>s+(b.totalAmount||0),0);

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <div style={{ marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:'.5rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">DJ Dashboard</span></div>
            <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', lineHeight:1 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <div style={{ display:'flex', gap:'.6rem' }}>
            <Link to="/dashboard/dj/profile" className="btn btn-outline btn-sm"><User size={13}/> Edit Profile</Link>
            <Link to="/dashboard/dj/media" className="btn btn-outline btn-sm"><Image size={13}/> Media</Link>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'.75rem', marginBottom:'2rem' }}>
          <StatCard icon={<Clock size={18}/>} value={pending.length} label="Pending" color="#eab308" />
          <StatCard icon={<CheckCircle size={18}/>} value={confirmed.length} label="Confirmed" color="var(--green)" />
          <StatCard icon={<Calendar size={18}/>} value={bookings.length} label="All Time" />
          <StatCard icon={<DollarSign size={18}/>} value={`A$${revenue.toLocaleString()}`} label="Revenue" color="var(--lime)" />
        </div>

        {loading ? <PageLoader/> : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom:'2rem' }}>
                <h3 style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.04em', marginBottom:'.8rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#eab308', display:'inline-block', animation:'pulse 1.5s ease infinite' }}/>
                  Pending Requests ({pending.length})
                </h3>
                {pending.map(b=><BookingRow key={b._id} booking={b} role="dj" onAction={handleAction}/>)}
              </div>
            )}
            {!bookings.length ? (
              <EmptyState icon="🎧" title="No Bookings Yet" desc="Complete your profile to start appearing in search results" actionTo="/dashboard/dj/profile" actionLabel="Complete Profile →"/>
            ) : (
              <>
                <h3 style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.04em', marginBottom:'.8rem' }}>All Bookings</h3>
                {bookings.map(b=><BookingRow key={b._id} booking={b} role="dj" onAction={handleAction}/>)}
              </>
            )}
          </>
        )}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </main>
    </div>
  );
}
