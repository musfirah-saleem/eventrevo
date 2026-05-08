import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { BookingRow, PageLoader, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingAPI.getAll().then(r => setBookings(r.data.data || [])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await bookingAPI.updateStatus(id, action);
      setBookings(prev => prev.map(b => b._id===id ? {...b, status: action==='cancel'?'cancelled':b.status} : b));
      toast.success('Updated');
    } catch { toast.error('Action failed'); }
  };

  const filtered = filter==='all' ? bookings : bookings.filter(b=>b.status===filter);

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'1.5rem' }}>My Bookings</h1>
        <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {['all','pending','confirmed','completed','cancelled'].map(s=>(
            <button key={s} className={`btn btn-sm ${filter===s?'btn-lime':'btn-outline'}`} onClick={()=>setFilter(s)} style={{ textTransform:'capitalize' }}>{s}</button>
          ))}
        </div>
        {loading ? <div className="spinner"/> : !filtered.length ? (
          <EmptyState icon="📋" title="No bookings found" desc="Try a different filter or book a DJ" actionTo="/djs" actionLabel="Browse DJs"/>
        ) : filtered.map(b=><BookingRow key={b._id} booking={b} role="customer" onAction={handleAction}/>)}
      </main>
    </div>
  );
}
