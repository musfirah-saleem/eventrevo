// // // client/src/components/layout/DashSidebar.js
// // import React from 'react';
// // import { Link, useLocation } from 'react-router-dom';
// // import { useAuth } from '../../context/AuthContext';
// // import { Calendar, User, Image, Clock, LayoutDashboard, Search, LogOut } from 'lucide-react';

// // const CustomerLinks = () => {
// //   const { pathname } = useLocation();

















// //   const { user } = useAuth();

// //   // For admins we show a slimmed down customer section where the
// //   // "My Bookings" item becomes a DJ list entry and the separate
// //   // "Browse DJs" link is hidden (admins shouldn't book).
// //   const linksForAdmin = [
// //     { to: '/dashboard/customer', icon: <LayoutDashboard size={14} />, label: 'Overview' },
// //     { to: '/dashboard/customer/bookings', icon: <Search size={14} />, label: 'DJs' },
// //     { to: '/dashboard/customer/profile', icon: <User size={14} />, label: 'My Profile' },
// //   ];

// //   const linksForCustomer = [
// //     { to: '/dashboard/customer', icon: <LayoutDashboard size={14} />, label: 'Overview' },
// //     { to: '/dashboard/customer/bookings', icon: <Calendar size={14} />, label: 'My Bookings' },
// //     { to: '/dashboard/customer/profile', icon: <User size={14} />, label: 'My Profile' },
// //     { to: '/djs', icon: <Search size={14} />, label: 'Browse DJs' },
// //   ];

// //   const links = user?.role === 'admin' ? linksForAdmin : linksForCustomer;

// //   return (
// //     <>
// //       <span className="sidebar-label">Customer</span>
// //       {links.map(({ to, icon, label }) => (
// //         <Link key={to} to={to} className={`sidebar-link ${pathname === to ? 'active' : ''}`}>
// //           {icon} {label}
// //         </Link>
// //       ))}
// //     </>
// //   );
// // };

// // const DJLinks = () => {
// //   const { pathname } = useLocation();
// //   return (
// //     <>
// //       <span className="sidebar-label">DJ Panel</span>
// //       {[
// //         { to: '/dashboard/dj', icon: <LayoutDashboard size={14} />, label: 'Overview' },
// //         { to: '/dashboard/dj/bookings', icon: <Calendar size={14} />, label: 'Bookings' },
// //         { to: '/dashboard/dj/profile', icon: <User size={14} />, label: 'My Profile' },
// //         { to: '/dashboard/dj/media', icon: <Image size={14} />, label: 'Media & Links' },
// //         { to: '/dashboard/dj/availability', icon: <Clock size={14} />, label: 'Availability' },
// //         { to: '/djs', icon: <Search size={14} />, label: 'View Marketplace' },
// //       ].map(({ to, icon, label }) => (
// //         <Link key={to} to={to} className={`sidebar-link ${pathname === to ? 'active' : ''}`}>
// //           {icon} {label}
// //         </Link>
// //       ))}
// //     </>
// //   );
// // };

// // export default function DashSidebar() {
// //   const { user, logout } = useAuth();
// //   const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// //   return (
// //     <aside className="dash-sidebar">
// //       <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
// //         <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
// //           <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--lime-dim)', border: '1px solid rgba(168,255,62,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue'", color: 'var(--lime)', fontSize: '.9rem', flexShrink: 0 }}>
// //             {initials}
// //           </div>
// //           <div>
// //             <div style={{ fontSize: '.82rem', fontWeight: 500 }}>{user?.name}</div>
// //             <div style={{ fontSize: '.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{user?.role}</div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="sidebar-section">
// //         {user?.role === 'dj' ? <DJLinks /> : <CustomerLinks />}
// //       </div>

// //       <div className="sidebar-section" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
// //         <button className="sidebar-link" onClick={logout}>
// //           <LogOut size={14} /> Sign Out
// //         </button>
// //       </div>
// //     </aside>
// //   );
// // }



// // client/src/components/layout/DashSidebar.js
// import React, { useEffect, useState } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { Calendar, User, Image, Clock, LayoutDashboard, Search, LogOut, Menu, X } from 'lucide-react';

// const CustomerLinks = ({ onNavigate }) => {
//   const { pathname } = useLocation();
//   const { user } = useAuth();

//   const linksForAdmin = [
//     { to: '/dashboard/customer', icon: <LayoutDashboard size={16} />, label: 'Overview' },
//     { to: '/dashboard/customer/bookings', icon: <Search size={16} />, label: 'DJs' },
//     { to: '/dashboard/customer/profile', icon: <User size={16} />, label: 'My Profile' },
//   ];

//   const linksForCustomer = [
//     { to: '/dashboard/customer', icon: <LayoutDashboard size={16} />, label: 'Overview' },
//     { to: '/dashboard/customer/bookings', icon: <Calendar size={16} />, label: 'My Bookings' },
//     { to: '/dashboard/customer/profile', icon: <User size={16} />, label: 'My Profile' },
//     { to: '/djs', icon: <Search size={16} />, label: 'Browse DJs' },
//   ];

//   const links = user?.role === 'admin' ? linksForAdmin : linksForCustomer;

//   return (
//     <>
//       <span className="sidebar-label">Customer</span>

//       {links.map(({ to, icon, label }) => (
//         <Link
//           key={to}
//           to={to}
//           onClick={onNavigate}
//           className={`sidebar-link ${pathname === to ? 'active' : ''}`}
//         >
//           <span className="sidebar-link-icon">{icon}</span>
//           <span className="sidebar-link-text">{label}</span>
//         </Link>
//       ))}
//     </>
//   );
// };

// const DJLinks = ({ onNavigate }) => {
//   const { pathname } = useLocation();

//   const links = [
//     { to: '/dashboard/dj', icon: <LayoutDashboard size={16} />, label: 'Overview' },
//     { to: '/dashboard/dj/bookings', icon: <Calendar size={16} />, label: 'Bookings' },
//     { to: '/dashboard/dj/profile', icon: <User size={16} />, label: 'My Profile' },
//     { to: '/dashboard/dj/media', icon: <Image size={16} />, label: 'Media & Links' },
//     { to: '/dashboard/dj/availability', icon: <Clock size={16} />, label: 'Availability' },
//     { to: '/djs', icon: <Search size={16} />, label: 'View Marketplace' },
//   ];

//   return (
//     <>
//       <span className="sidebar-label">DJ Panel</span>

//       {links.map(({ to, icon, label }) => (
//         <Link
//           key={to}
//           to={to}
//           onClick={onNavigate}
//           className={`sidebar-link ${pathname === to ? 'active' : ''}`}
//         >
//           <span className="sidebar-link-icon">{icon}</span>
//           <span className="sidebar-link-text">{label}</span>
//         </Link>
//       ))}
//     </>
//   );
// };

// export default function DashSidebar() {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const [drawerOpen, setDrawerOpen] = useState(false);

//   const initials = user?.name
//     ?.split(' ')
//     .map(w => w[0])
//     .join('')
//     .slice(0, 2)
//     .toUpperCase();

//   useEffect(() => {
//     setDrawerOpen(false);
//   }, [location.pathname]);

//   useEffect(() => {
//     document.body.classList.toggle('dashboard-drawer-open', drawerOpen);

//     return () => {
//       document.body.classList.remove('dashboard-drawer-open');
//     };
//   }, [drawerOpen]);

//   const closeDrawer = () => {
//     setDrawerOpen(false);
//   };

//   const handleLogout = () => {
//     closeDrawer();
//     logout();
//   };

//   return (
//     <>
//       <button
//         type="button"
//         className="dashboard-drawer-toggle"
//         onClick={() => setDrawerOpen(open => !open)}
//         aria-label={drawerOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
//         aria-expanded={drawerOpen}
//       >
//         {drawerOpen ? <X size={20} /> : <Menu size={20} />}
//       </button>

//       <button
//         type="button"
//         className={`dashboard-drawer-backdrop ${drawerOpen ? 'show' : ''}`}
//         onClick={closeDrawer}
//         aria-label="Close dashboard menu"
//       />

//       <aside className={`dash-sidebar ${drawerOpen ? 'is-open' : ''}`}>
//         <div className="dash-sidebar-user">
//           <div className="dash-sidebar-avatar">
//             {initials}
//           </div>

//           <div className="dash-sidebar-user-text">
//             <div className="dash-sidebar-name">{user?.name}</div>
//             <div className="dash-sidebar-role">{user?.role}</div>
//           </div>
//         </div>

//         <div className="sidebar-section">
//           {user?.role === 'dj'
//             ? <DJLinks onNavigate={closeDrawer} />
//             : <CustomerLinks onNavigate={closeDrawer} />}
//         </div>

//         <div className="sidebar-section sidebar-section-bottom">
//           <button className="sidebar-link" onClick={handleLogout}>
//             <span className="sidebar-link-icon">
//               <LogOut size={16} />
//             </span>
//             <span className="sidebar-link-text">Sign Out</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }




// client/src/components/layout/DashSidebar.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  User,
  Image,
  Clock,
  LayoutDashboard,
  Search,
  LogOut,
} from 'lucide-react';

const CustomerLinks = ({ onNavigate }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const linksForAdmin = [
    { to: '/dashboard/customer', icon: <LayoutDashboard size={16} />, label: 'Overview' },
    { to: '/dashboard/customer/bookings', icon: <Search size={16} />, label: 'DJs' },
    { to: '/dashboard/customer/profile', icon: <User size={16} />, label: 'My Profile' },
  ];

  const linksForCustomer = [
    { to: '/dashboard/customer', icon: <LayoutDashboard size={16} />, label: 'Overview' },
    { to: '/dashboard/customer/bookings', icon: <Calendar size={16} />, label: 'My Bookings' },
    { to: '/dashboard/customer/profile', icon: <User size={16} />, label: 'My Profile' },
    { to: '/djs', icon: <Search size={16} />, label: 'Browse DJs' },
  ];

  const links = user?.role === 'admin' ? linksForAdmin : linksForCustomer;

  return (
    <>
      <span className="sidebar-label">Customer</span>

      {links.map(({ to, icon, label }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={`sidebar-link ${pathname === to ? 'active' : ''}`}
        >
          <span className="sidebar-link-icon">{icon}</span>
          <span className="sidebar-link-text">{label}</span>
        </Link>
      ))}
    </>
  );
};

const DJLinks = ({ onNavigate }) => {
  const { pathname } = useLocation();

  const links = [
    { to: '/dashboard/dj', icon: <LayoutDashboard size={16} />, label: 'Overview' },
    { to: '/dashboard/dj/bookings', icon: <Calendar size={16} />, label: 'Bookings' },
    { to: '/dashboard/dj/profile', icon: <User size={16} />, label: 'My Profile' },
    { to: '/dashboard/dj/media', icon: <Image size={16} />, label: 'Media & Links' },
    { to: '/dashboard/dj/availability', icon: <Clock size={16} />, label: 'Availability' },
    { to: '/djs', icon: <Search size={16} />, label: 'View Marketplace' },
  ];

  return (
    <>
      <span className="sidebar-label">DJ Panel</span>

      {links.map(({ to, icon, label }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className={`sidebar-link ${pathname === to ? 'active' : ''}`}
        >
          <span className="sidebar-link-icon">{icon}</span>
          <span className="sidebar-link-text">{label}</span>
        </Link>
      ))}
    </>
  );
};

export default function DashSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const toggleDrawer = () => {
      setDrawerOpen(open => !open);
    };

    const openDrawer = () => {
      setDrawerOpen(true);
    };

    const closeDrawer = () => {
      setDrawerOpen(false);
    };

    window.addEventListener('dashboard-drawer-toggle', toggleDrawer);
    window.addEventListener('dashboard-drawer-open', openDrawer);
    window.addEventListener('dashboard-drawer-close', closeDrawer);

    return () => {
      window.removeEventListener('dashboard-drawer-toggle', toggleDrawer);
      window.removeEventListener('dashboard-drawer-open', openDrawer);
      window.removeEventListener('dashboard-drawer-close', closeDrawer);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dashboard-drawer-open', drawerOpen);

    window.dispatchEvent(
      new CustomEvent('dashboard-drawer-state', {
        detail: { open: drawerOpen },
      })
    );

    return () => {
      document.body.classList.remove('dashboard-drawer-open');
    };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    closeDrawer();
    logout();
  };

  return (
    <>
      <button
        type="button"
        className={`dashboard-drawer-backdrop ${drawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
        aria-label="Close dashboard menu"
      />

      <aside className={`dash-sidebar ${drawerOpen ? 'is-open' : ''}`}>
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-avatar">
            {initials}
          </div>

          <div className="dash-sidebar-user-text">
            <div className="dash-sidebar-name">{user?.name}</div>
            <div className="dash-sidebar-role">{user?.role}</div>
          </div>
        </div>

        <div className="sidebar-section">
          {user?.role === 'dj'
            ? <DJLinks onNavigate={closeDrawer} />
            : <CustomerLinks onNavigate={closeDrawer} />}
        </div>

        <div className="sidebar-section sidebar-section-bottom">
          <button className="sidebar-link" onClick={handleLogout}>
            <span className="sidebar-link-icon">
              <LogOut size={16} />
            </span>
            <span className="sidebar-link-text">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}