// // client/src/components/layout/Navbar.js
// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';

// const Logo = () => (
//   <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" height="36" style={{ flexShrink:0 }}>
//       <defs><filter id="gn"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
//       <ellipse cx="100" cy="52" rx="58" ry="55" fill="none" stroke="#2a3d2a" strokeWidth="11"/>
//       <line x1="42" y1="52" x2="42" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round"/>
//       <line x1="158" y1="52" x2="158" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round"/>
//       <rect x="34" y="84" width="16" height="22" rx="8" fill="#2a3d2a"/>
//       <rect x="150" y="84" width="16" height="22" rx="8" fill="#2a3d2a"/>
//       <g filter="url(#gn)">
//         {[67,73,79,85,91,97,103,109,115,121,127].map((x,i)=>{
//           const heights=[26,32,36,30,34,28,36,30,26,22,26];
//           const tops=[19,13,9,15,11,17,9,15,19,23,19];
//           return <rect key={x} x={x} y={tops[i]} width="4" height={heights[i]} rx="2" fill="#a8ff3e"/>;
//         })}
//       </g>
//       <text x="100" y="82" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#d0d8c8" stroke="#090c09" strokeWidth="3" paintOrder="stroke">Event</text>
//       <text x="100" y="109" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#d0d8c8" stroke="#090c09" strokeWidth="3" paintOrder="stroke">Rev</text>
//       <text x="134" y="109" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="27" fontWeight="900" fill="#a8ff3e" stroke="#090c09" strokeWidth="3" paintOrder="stroke">o</text>
//       <circle cx="138" cy="101" r="8" fill="#1e2e1e"/>
//       <circle cx="138" cy="101" r="3" fill="#a8ff3e"/>
//     </svg>
//     <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.16em', color:'#eef5e8' }}>
//       EVENT<span style={{ color:'#a8ff3e' }}>REVO</span>
//     </span>
//   </Link>
// );

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const dashHref = user?.role === 'dj' ? '/dashboard/dj' : user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/customer';
//   const initials = user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '';

//   const navStyle = {
//     position: 'fixed', top:0, left:0, right:0, zIndex:500, height:'60px',
//     display:'flex', alignItems:'center', justifyContent:'space-between',
//     padding:'0 2rem', borderBottom:'1px solid var(--border)',
//     background:'rgba(9,12,9,0.88)', backdropFilter:'blur(20px)',
//   };

//   return (
//     <nav style={navStyle}>
//       <Logo />

//       {/* Desktop */}
//       <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }} className="desktop-nav">
//         <Link to="/djs" style={{ fontSize:'.72rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', textDecoration:'none' }}>Browse DJs</Link>
//         {user ? (
//           <>
//             <Link to={dashHref} style={{ fontSize:'.72rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', textDecoration:'none', display:'flex', alignItems:'center', gap:'.4rem' }}>
//               <LayoutDashboard size={13} /> Dashboard
//             </Link>
//             <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--lime-dim)', border:'1px solid rgba(168,255,62,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Bebas Neue'", fontSize:'.85rem', color:'var(--lime)', cursor:'pointer' }} onClick={() => navigate(dashHref)}>
//               {initials}
//             </div>
//             <button className="btn btn-outline btn-sm" onClick={logout} style={{ display:'flex', alignItems:'center', gap:'.35rem' }}>
//               <LogOut size={12} /> Sign Out
//             </button>
//           </>
//         ) : (
//           <>
//             <Link to="/login" style={{ fontSize:'.72rem', letterSpacing:'.15em', textTransform:'uppercase', color:'var(--muted)', textDecoration:'none' }}>Sign In</Link>
//             <Link to="/register" className="btn btn-lime btn-sm">Join Free</Link>
//           </>
//         )}
//       </div>

//       {/* Mobile toggle */}
//       <button style={{ display:'none', background:'none', border:'none', color:'var(--muted)', cursor:'pointer' }} className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
//         {menuOpen ? <X size={20} /> : <Menu size={20} />}
//       </button>

//       {/* Mobile menu */}
//       {menuOpen && (
//         <div style={{ position:'fixed', top:60, left:0, right:0, background:'var(--off)', borderBottom:'1px solid var(--border)', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', zIndex:499 }}>
//           <Link to="/djs" style={{ color:'var(--muted)', textDecoration:'none', fontSize:'.85rem' }} onClick={() => setMenuOpen(false)}>Browse DJs</Link>
//           {user ? (
//             <>
//               <Link to={dashHref} style={{ color:'var(--muted)', textDecoration:'none', fontSize:'.85rem' }} onClick={() => setMenuOpen(false)}>Dashboard</Link>
//               <button className="btn btn-danger btn-sm" onClick={() => { logout(); setMenuOpen(false); }}>Sign Out</button>
//             </>
//           ) : (
//             <>
//               <Link to="/login" className="btn btn-outline" onClick={() => setMenuOpen(false)}>Sign In</Link>
//               <Link to="/register" className="btn btn-lime" onClick={() => setMenuOpen(false)}>Join Free</Link>
//             </>
//           )}
//         </div>
//       )}

//       <style>{`
//         @media (max-width:768px) {
//           .desktop-nav { display:none!important; }
//           .mobile-menu-btn { display:flex!important; }
//         }
//       `}</style>
//     </nav>
//   );
// }



// client/src/components/layout/Navbar.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LayoutDashboard, LogOut, Home, Search } from 'lucide-react';

const LogoContent = ({ idSuffix = 'desktop' }) => {
  const filterId = `gn-${idSuffix}`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 120"
        height="36"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="100" cy="52" rx="58" ry="55" fill="none" stroke="#2a3d2a" strokeWidth="11" />
        <line x1="42" y1="52" x2="42" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round" />
        <line x1="158" y1="52" x2="158" y2="90" stroke="#2a3d2a" strokeWidth="11" strokeLinecap="round" />
        <rect x="34" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />
        <rect x="150" y="84" width="16" height="22" rx="8" fill="#2a3d2a" />

        <g filter={`url(#${filterId})`}>
          {[67, 73, 79, 85, 91, 97, 103, 109, 115, 121, 127].map((x, i) => {
            const heights = [26, 32, 36, 30, 34, 28, 36, 30, 26, 22, 26];
            const tops = [19, 13, 9, 15, 11, 17, 9, 15, 19, 23, 19];

            return (
              <rect
                key={x}
                x={x}
                y={tops[i]}
                width="4"
                height={heights[i]}
                rx="2"
                fill="#a8ff3e"
              />
            );
          })}
        </g>

        <text
          x="100"
          y="82"
          textAnchor="middle"
          fontFamily="Arial Black,sans-serif"
          fontSize="27"
          fontWeight="900"
          fill="#d0d8c8"
          stroke="#090c09"
          strokeWidth="3"
          paintOrder="stroke"
        >
          Event
        </text>

        <text
          x="100"
          y="109"
          textAnchor="middle"
          fontFamily="Arial Black,sans-serif"
          fontSize="27"
          fontWeight="900"
          fill="#d0d8c8"
          stroke="#090c09"
          strokeWidth="3"
          paintOrder="stroke"
        >
          Rev
        </text>

        <text
          x="134"
          y="109"
          textAnchor="middle"
          fontFamily="Arial Black,sans-serif"
          fontSize="27"
          fontWeight="900"
          fill="#a8ff3e"
          stroke="#090c09"
          strokeWidth="3"
          paintOrder="stroke"
        >
          o
        </text>

        <circle cx="138" cy="101" r="8" fill="#1e2e1e" />
        <circle cx="138" cy="101" r="3" fill="#a8ff3e" />
      </svg>

      <span className="navbar-logo-text">
        EVENT<span>REVO</span>
      </span>
    </>
  );
};

const LogoLink = () => (
  <Link to="/" className="navbar-logo-link">
    <LogoContent idSuffix="desktop" />
  </Link>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileCardOpen, setMobileCardOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const dashHref =
    user?.role === 'dj'
      ? '/dashboard/dj'
      : user?.role === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/customer';

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 500,
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(9,12,9,0.88)',
    backdropFilter: 'blur(20px)',
  };

  useEffect(() => {
    setMobileCardOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleDrawerState = event => {
      setDrawerOpen(Boolean(event.detail?.open));
    };

    window.addEventListener('dashboard-drawer-state', handleDrawerState);

    return () => {
      window.removeEventListener('dashboard-drawer-state', handleDrawerState);
    };
  }, []);

  const toggleDashboardDrawer = () => {
    window.dispatchEvent(new CustomEvent('dashboard-drawer-toggle'));
  };

  const closeMobileCard = () => {
    setMobileCardOpen(false);
  };

  const handleLogout = () => {
    closeMobileCard();
    logout();
  };

  return (
    <nav
      style={navStyle}
      className={`site-navbar ${isDashboardRoute && user ? 'site-navbar-dashboard' : ''}`}
    >
      {/* Mobile dashboard drawer button - left side */}
      {isDashboardRoute && user && (
        <button
          type="button"
          className="mobile-dashboard-drawer-btn"
          onClick={toggleDashboardDrawer}
          aria-label={drawerOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
          aria-expanded={drawerOpen}
        >
          {drawerOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      )}

      {/* Desktop logo - left side */}
      <div className="navbar-logo-desktop">
        <LogoLink />
      </div>

      {/* Desktop menu */}
      <div className="desktop-nav">
        <Link to="/djs" className="navbar-link">
          Browse DJs
        </Link>

        {user ? (
          <>
            <Link to={dashHref} className="navbar-link navbar-link-icon">
              <LayoutDashboard size={13} />
              Dashboard
            </Link>

            <button
              type="button"
              className="navbar-user-avatar"
              onClick={() => navigate(dashHref)}
              aria-label="Go to dashboard"
            >
              {user?.name
                ?.split(' ')
                .map(w => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </button>

            <button
              className="btn btn-outline btn-sm"
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Sign In
            </Link>

            <Link to="/register" className="btn btn-lime btn-sm">
              Join Free
            </Link>
          </>
        )}
      </div>

      {/* Mobile logo - right side. Click opens card */}
      <button
        type="button"
        className="mobile-logo-menu-btn"
        onClick={() => setMobileCardOpen(open => !open)}
        aria-label="Open site menu"
        aria-expanded={mobileCardOpen}
      >
        <LogoContent idSuffix="mobile" />
      </button>

      {/* Small screen backdrop */}
      <button
        type="button"
        className={`mobile-logo-card-backdrop ${mobileCardOpen ? 'show' : ''}`}
        onClick={closeMobileCard}
        aria-label="Close menu"
      />

      {/* Small screen card/dropdown */}
      <div className={`mobile-logo-card ${mobileCardOpen ? 'show' : ''}`}>
        <Link to="/" className="mobile-logo-card-link" onClick={closeMobileCard}>
          <Home size={15} />
          Home
        </Link>

        <Link to="/djs" className="mobile-logo-card-link" onClick={closeMobileCard}>
          <Search size={15} />
          Browse DJs
        </Link>

        {user ? (
          <>
            <Link to={dashHref} className="mobile-logo-card-link" onClick={closeMobileCard}>
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            <button
              type="button"
              className="mobile-logo-card-link danger"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mobile-logo-card-link" onClick={closeMobileCard}>
              Sign In
            </Link>

            <Link to="/register" className="mobile-logo-card-btn" onClick={closeMobileCard}>
              Join Free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}