// client/src/pages/admin/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../utils/api';
import { StatusBadge, StatCard, PageLoader } from '../../components/ui';
import DashSidebar from '../../components/layout/DashSidebar';
import toast from 'react-hot-toast';
import { Users, Music2, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [djs, setDjs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  
  useEffect(() => {
    Promise.all([adminAPI.getDJs(), adminAPI.getBookings(), adminAPI.getStats()])
      .then(([djRes, bkRes, stRes]) => {
        setDjs(djRes.data.data || []);
        setBookings(bkRes.data.data || []);
        setStats(stRes.data.data);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleDJStatus = async (id, status) => {
    try {
      await adminAPI.updateDJStatus(id, status);
      setDjs(prev => prev.map(d => d._id === id ? { ...d, status } : d));
      toast.success(`DJ ${status}`);
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="dash-layout">
      <DashSidebar />
      <main className="dash-main">
        <div style={{ marginBottom: '2rem' }}>
          <div className="eyebrow" style={{ marginBottom: '.5rem' }}><div className="eyebrow-line" /><span className="eyebrow-text">Admin Panel</span></div>
          <h1 style={{ fontFamily: "'Bebas Neue'", fontSize: '2.8rem', letterSpacing: '.04em', lineHeight: 1 }}>Control Centre</h1>
        </div>

        {loading ? <PageLoader /> : (
          <>
            {/* Stats */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: '.75rem', marginBottom: '2rem' }}>
                <StatCard icon={<Music2 size={18} />} value={stats.approvedDJs} label="Active DJs" color="var(--lime)" />
                <StatCard icon={<Users size={18} />} value={stats.customers} label="Customers" color="var(--blue)" />
                <StatCard icon={<Calendar size={18} />} value={stats.totalBookings} label="Bookings" />
                <StatCard icon={<DollarSign size={18} />} value={`A$${(stats.totalRevenue || 0).toLocaleString()}`} label="Total Revenue" color="var(--lime)" />
              </div>
            )}

            {/* Tab nav */}
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '.5rem' }}>
              {['overview', 'djs', 'bookings'].map(t => (
                <button key={t} className={`btn btn-sm ${tab === t ? 'btn-lime' : 'btn-ghost'}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>

            {/* DJs Panel */}
            {(tab === 'overview' || tab === 'djs') && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', letterSpacing: '.04em', marginBottom: '.8rem' }}>
                  DJ Profiles {djs.filter(d => d.status === 'pending_review').length > 0 && (
                    <span className="badge badge-pending_review" style={{ marginLeft: '.5rem' }}>{djs.filter(d => d.status === 'pending_review').length} pending</span>
                  )}
                </h3>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Stage Name', 'Email', 'Rate', 'Status', 'Created', 'Actions'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', padding: '.75rem 1rem' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {djs.map(dj => (
                        <tr key={dj._id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.88rem', fontWeight: 500 }}>{dj.stageName}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: 'var(--muted)' }}>{dj.user?.email}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem' }}>{dj.hourlyRate ? `A$${dj.hourlyRate}/hr` : '—'}</td>
                          <td style={{ padding: '.75rem 1rem' }}><StatusBadge status={dj.status} /></td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.78rem', color: 'var(--muted)' }}>{new Date(dj.createdAt).toLocaleDateString('en-AU')}</td>
                          <td style={{ padding: '.75rem 1rem' }}>
                            <div style={{ display: 'flex', gap: '.35rem' }}>
                              {dj.status !== 'approved' && (
                                <button className="btn btn-success btn-sm" onClick={() => handleDJStatus(dj._id, 'approved')}>
                                  <CheckCircle size={11} /> Approve
                                </button>
                              )}
                              {dj.status !== 'rejected' && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDJStatus(dj._id, 'rejected')}>
                                  <XCircle size={11} /> Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Panel */}
            {(tab === 'overview' || tab === 'bookings') && (
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', letterSpacing: '.04em', marginBottom: '.8rem' }}>Recent Bookings</h3>
                <div className="card" style={{ overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Customer', 'DJ', 'Event', 'Date', 'Amount', 'Status'].map(h => (
                          <th key={h} style={{ textAlign: 'left', fontSize: '.6rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', padding: '.75rem 1rem' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 30).map(b => (
                        <tr key={b._id} style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.85rem' }}>{b.customer?.name || b.guestName}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.85rem' }}>{b.djProfile?.stageName}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: 'var(--muted)' }}>{b.eventType}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.78rem', color: 'var(--muted)' }}>{new Date(b.eventDate).toLocaleDateString('en-AU')}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.85rem', color: 'var(--lime)' }}>A${(b.totalAmount || 0).toFixed(0)}</td>
                          <td style={{ padding: '.75rem 1rem' }}><StatusBadge status={b.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
