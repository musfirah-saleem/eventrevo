// client/src/pages/customer/CustomerDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { StatCard, BookingRow, EmptyState, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle, Clock, Music2 } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getAll()
      .then(r => setBookings(r.data.data || []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await bookingAPI.updateStatus(id, action);
      setBookings(prev => prev.map(b => b._id === id ? {...b, status: action==='cancel'?'cancelled':b.status} : b));
      toast.success('Booking updated');
    } catch { toast.error('Action failed'); }
  };

  const pending   = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="dash-layout">
      <DashSidebar />
      <main className="dash-main">
        <div style={{ marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom:'.5rem' }}><div className="eyebrow-line"/><span className="eyebrow-text">Customer Dashboard</span></div>
            <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', lineHeight:1 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <Link to="/djs" className="btn btn-lime"><Music2 size={14}/> Book a DJ</Link>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:'.75rem', marginBottom:'2rem' }}>
          <StatCard icon={<Calendar size={18}/>} value={bookings.length} label="Total Bookings" />
          <StatCard icon={<CheckCircle size={18}/>} value={confirmed.length} label="Confirmed" color="var(--green)" />
          <StatCard icon={<Clock size={18}/>} value={pending.length} label="Pending" color="#eab308" />
        </div>

        {loading ? <PageLoader /> : !bookings.length ? (
          <EmptyState icon="🎧" title="No Bookings Yet" desc="Browse Canberra's best DJs and book your next event" actionTo="/djs" actionLabel="Browse DJs →" />
        ) : (
          <>
            {pending.length > 0 && (
              <div style={{ marginBottom:'2rem' }}>
                <h3 style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.04em', marginBottom:'.8rem', display:'flex', alignItems:'center', gap:'.6rem' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:'#eab308', display:'inline-block' }}/>
                  Awaiting Response ({pending.length})
                </h3>
                {pending.map(b => <BookingRow key={b._id} booking={b} role="customer" onAction={handleAction}/>)}
              </div>
            )}
            <h3 style={{ fontFamily:"'Bebas Neue'", fontSize:'1.4rem', letterSpacing:'.04em', marginBottom:'.8rem' }}>All Bookings</h3>
            {bookings.map(b => <BookingRow key={b._id} booking={b} role="customer" onAction={handleAction}/>)}
          </>
        )}
      </main>
    </div>
  );
}
