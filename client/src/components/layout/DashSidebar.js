// client/src/components/layout/DashSidebar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, Image, Clock, LayoutDashboard, Search, LogOut } from 'lucide-react';

const CustomerLinks = () => {
  const { pathname } = useLocation();
  return (
    <>
      <span className="sidebar-label">Customer</span>
      {[
        { to:'/dashboard/customer', icon:<LayoutDashboard size={14}/>, label:'Overview' },
        { to:'/dashboard/customer/bookings', icon:<Calendar size={14}/>, label:'My Bookings' },
        { to:'/dashboard/customer/profile', icon:<User size={14}/>, label:'My Profile' },
        { to:'/djs', icon:<Search size={14}/>, label:'Browse DJs' },
      ].map(({ to, icon, label }) => (
        <Link key={to} to={to} className={`sidebar-link ${pathname === to ? 'active' : ''}`}>
          {icon} {label}
        </Link>
      ))}
    </>
  );
};

const DJLinks = () => {
  const { pathname } = useLocation();
  return (
    <>
      <span className="sidebar-label">DJ Panel</span>
      {[
        { to:'/dashboard/dj', icon:<LayoutDashboard size={14}/>, label:'Overview' },
        { to:'/dashboard/dj/bookings', icon:<Calendar size={14}/>, label:'Bookings' },
        { to:'/dashboard/dj/profile', icon:<User size={14}/>, label:'My Profile' },
        { to:'/dashboard/dj/media', icon:<Image size={14}/>, label:'Media & Links' },
        { to:'/dashboard/dj/availability', icon:<Clock size={14}/>, label:'Availability' },
        { to:'/djs', icon:<Search size={14}/>, label:'View Marketplace' },
      ].map(({ to, icon, label }) => (
        <Link key={to} to={to} className={`sidebar-link ${pathname === to ? 'active' : ''}`}>
          {icon} {label}
        </Link>
      ))}
    </>
  );
};

export default function DashSidebar() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  return (
    <aside className="dash-sidebar">
      <div style={{ padding:'1rem 1.2rem', borderBottom:'1px solid var(--border)', marginBottom:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'.7rem' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.25)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue'", color:'var(--lime)', fontSize:'.9rem', flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize:'.82rem', fontWeight:500 }}>{user?.name}</div>
            <div style={{ fontSize:'.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.1em' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        {user?.role === 'dj' ? <DJLinks /> : <CustomerLinks />}
      </div>

      <div className="sidebar-section" style={{ marginTop:'auto', borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
        <button className="sidebar-link" onClick={logout}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
