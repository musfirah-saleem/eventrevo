// client/src/components/ui/index.js

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Clock, DollarSign } from 'lucide-react';

// ── Status Badge
export function StatusBadge({ status }) {
  const map = {
    pending:       'badge-pending',
    confirmed:     'badge-confirmed',
    declined:      'badge-declined',
    completed:     'badge-completed',
    cancelled:     'badge-cancelled',
    approved:      'badge-approved',
    pending_review:'badge-pending_review',
    rejected:      'badge-rejected',
    unpaid:        'badge-unpaid',
    deposit_paid:  'badge-deposit_paid',
    fully_paid:    'badge-approved',
  };
  const labels = {
    pending:'Pending', confirmed:'Confirmed', declined:'Declined',
    completed:'Completed', cancelled:'Cancelled', approved:'Approved',
    pending_review:'Under Review', rejected:'Rejected',
    unpaid:'Unpaid', deposit_paid:'Advance Paid', fully_paid:'Fully Paid',
  };
  return <span className={`badge ${map[status] || 'badge-pending'}`}>{labels[status] || status}</span>;
}

// ── Stat Card
export function StatCard({ icon, value, label, color }) {
  return (
    <div className="card" style={{ padding:'1.2rem' }}>
      <div style={{ fontSize:'1.1rem', marginBottom:'.7rem', color: color || 'var(--lime)' }}>{icon}</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'2.2rem', lineHeight:1, marginBottom:'.15rem', color: color || 'var(--white)' }}>{value}</div>
      <div style={{ fontSize:'.65rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)' }}>{label}</div>
    </div>
  );
}

// ── DJ Card
export function DJCard({ dj }) {
  const initials = dj.stageName?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const colors = ['#c9a84c','#5b8cf8','#ec4899','#22c55e','#a78bfa'];
  const bg = ['rgba(201,168,76,.15)','rgba(91,140,248,.15)','rgba(236,72,153,.12)','rgba(34,197,94,.12)','rgba(167,139,250,.12)'];
  const idx = (dj.stageName?.charCodeAt(0) || 0) % 5;

  return (
    <Link to={`/djs/${dj._id}`} className="card card-hover" style={{ display:'block', textDecoration:'none', overflow:'hidden' }}>
      <div style={{ aspectRatio:'4/3', background:`linear-gradient(135deg,${bg[idx]},transparent)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
        {dj.profileImage
          ? <img src={dj.profileImage} alt={dj.stageName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontFamily:"'Bebas Neue'", fontSize:'3rem', color:colors[idx] }}>{initials}</span>
        }
        <div style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,.75)', border:'1px solid rgba(168,255,62,.3)', padding:'2px 7px', fontSize:'.58rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--lime)' }}>Verified</div>
      </div>
      <div style={{ padding:'1rem' }}>
        <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.35rem', letterSpacing:'.05em', marginBottom:'.15rem' }}>{dj.stageName}</div>
        <div style={{ fontSize:'.75rem', color:'var(--muted)', marginBottom:'.6rem', display:'flex', alignItems:'center', gap:'.3rem' }}>
          <MapPin size={10} /> {dj.location}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'.3rem', marginBottom:'.8rem' }}>
          {dj.genres?.slice(0,3).map(g => <span key={g} className="tag">{g}</span>)}
          {dj.genres?.length > 3 && <span className="tag">+{dj.genres.length-3}</span>}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'.7rem', borderTop:'1px solid var(--border)' }}>
          <span style={{ fontSize:'.78rem', color:'var(--lime)', display:'flex', alignItems:'center', gap:'.25rem' }}>
            <Star size={11} fill="currentColor" /> {dj.averageRating?.toFixed(1) || '5.0'}
            <span style={{ color:'var(--muted)', fontSize:'.68rem' }}>({dj.totalReviews})</span>
          </span>
          <span style={{ fontSize:'.88rem', fontWeight:500, display:'flex', alignItems:'center', gap:'.25rem' }}>
            <DollarSign size={12} style={{ color:'var(--lime)' }} />
            {dj.hourlyRate ? `A$${dj.hourlyRate}/hr` : 'POA'}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Loading Spinner (full page)
export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  );
}

// ── Empty State
export function EmptyState({ icon, title, desc, action, actionLabel, actionTo }) {
  return (
    <div className="card" style={{ padding:'4rem 2rem', textAlign:'center' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>{icon}</div>
      <div style={{ fontFamily:"'Bebas Neue'", fontSize:'1.8rem', color:'var(--muted)', marginBottom:'.5rem' }}>{title}</div>
      <p style={{ fontSize:'.85rem', color:'var(--muted)', marginBottom:'1.5rem', maxWidth:300, margin:'0 auto 1.5rem' }}>{desc}</p>
      {actionTo && <Link to={actionTo} className="btn btn-lime">{actionLabel}</Link>}
      {action && <button className="btn btn-lime" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

// ── Booking Row
export function BookingRow({ booking, role, onAction }) {
  const isCustomer = role === 'customer';
  const party = isCustomer ? booking.djProfile : booking.customer;
  const name = isCustomer ? booking.djProfile?.stageName : booking.customer?.name;

  return (
    <div className="card" style={{ padding:'1rem 1.2rem', marginBottom:'.6rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', borderColor: booking.status==='pending'?'rgba(234,179,8,.18)':booking.status==='confirmed'?'rgba(34,197,94,.12)':'var(--border)' }}>
      <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue'", color:'var(--lime)', fontSize:'.9rem', flexShrink:0 }}>
        {name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'.9rem', fontWeight:500, marginBottom:'.15rem' }}>{name}</div>
        <div style={{ fontSize:'.75rem', color:'var(--muted)' }}>
          {booking.eventType} · {new Date(booking.eventDate).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'})} · {booking.startTime}–{booking.endTime}
        </div>
        <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:'.1rem' }}>{booking.location}</div>
        <div style={{ marginTop:'.4rem', display:'flex', gap:'.4rem', flexWrap:'wrap' }}>
          <StatusBadge status={booking.status} />
          {booking.paymentStatus !== 'unpaid' && <StatusBadge status={booking.paymentStatus} />}
        </div>
      </div>
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <div style={{ fontSize:'.95rem', fontWeight:500, color:'var(--lime)', marginBottom:'.3rem' }}>A${booking.totalAmount?.toFixed(0)}</div>
        {(Number(booking.amountPaid || 0) > 0 || Number(booking.remainingAmount || 0) > 0) && (
          <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginBottom: '.35rem' }}>
            Paid A${Number(booking.amountPaid || 0).toFixed(0)} · Remaining A${Math.max(Number(booking.remainingAmount || 0), 0).toFixed(0)}
          </div>
        )}
        <div style={{ display:'flex', gap:'.35rem', justifyContent:'flex-end', flexWrap:'wrap' }}>
          {role === 'dj' && booking.status === 'pending' && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => onAction(booking._id,'confirm')}>✓ Confirm</button>
              <button className="btn btn-danger btn-sm" onClick={() => onAction(booking._id,'decline')}>✗ Decline</button>
            </>
          )}
          {role === 'customer' && booking.status === 'confirmed' && booking.paymentStatus === 'unpaid' && (
            <Link to={`/checkout/${booking._id}`} className="btn btn-lime btn-sm">Pay Deposit</Link>
          )}
          {role === 'customer' && booking.status === 'confirmed' && booking.paymentStatus === 'deposit_paid' && (
            <Link to={`/checkout/${booking._id}`} className="btn btn-lime btn-sm">Pay Remaining</Link>
          )}
          {role === 'customer' && booking.status === 'pending' && (
            <button className="btn btn-danger btn-sm" onClick={() => onAction(booking._id,'cancel')}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
