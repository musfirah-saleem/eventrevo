import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../../utils/api';
import DashSidebar from '../../components/layout/DashSidebar';
import { BookingRow, EmptyState, PageLoader } from '../../components/ui';
import toast from 'react-hot-toast';

export default function DJBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingAPI.getAll().then(r=>setBookings(r.data.data||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      await bookingAPI.updateStatus(id, action);
      setBookings(prev=>prev.map(b=>b._id===id?{...b,status:action==='confirm'?'confirmed':action==='decline'?'declined':b.status}:b));
      toast.success(action==='confirm'?'Confirmed!':'Declined.');
    } catch { toast.error('Failed'); }
  };

  const filtered = filter==='all' ? bookings : bookings.filter(b=>b.status===filter);

  return (
    <div className="dash-layout">
      <DashSidebar/>
      <main className="dash-main">
        <h1 style={{ fontFamily:"'Bebas Neue'", fontSize:'2.8rem', letterSpacing:'.04em', marginBottom:'1.5rem' }}>All Bookings</h1>
        <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {['all','pending','confirmed','declined','completed'].map(s=>(
            <button key={s} className={`btn btn-sm ${filter===s?'btn-lime':'btn-outline'}`} onClick={()=>setFilter(s)} style={{ textTransform:'capitalize' }}>{s}</button>
          ))}
        </div>
        {loading?<PageLoader/>:!filtered.length?<EmptyState icon="📋" title="No bookings" desc="Try a different filter"/>:filtered.map(b=><BookingRow key={b._id} booking={b} role="dj" onAction={handleAction}/>)}
      </main>
    </div>
  );
}
