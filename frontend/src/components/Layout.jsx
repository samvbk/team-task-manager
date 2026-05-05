import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  projects:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  chevron:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>,
  user:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
};

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <span className="logo-text">Task<span>Flow</span></span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.dashboard} Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icons.projects} Projects
          </NavLink>

          {/* Logout as a nav item */}
          <div className="nav-section-label" style={{ marginTop: 16 }}>Account</div>
          <button id="sidebar-logout-btn" className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            {icons.logout} Sign Out
          </button>
        </nav>

        {/* User panel at the bottom — click to open dropdown */}
        <div className="sidebar-user" ref={menuRef} style={{ position: 'relative' }}>
          <button
            id="user-menu-trigger"
            onClick={() => setUserMenuOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', cursor: 'pointer', flex: 1, padding: 0, borderRadius: 'var(--radius)', transition: 'var(--transition)' }}
            title="Account menu"
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info" style={{ textAlign: 'left' }}>
              <div className="user-name">{user?.name}</div>
              <div className={`user-role ${isAdmin ? 'admin' : ''}`}>{user?.role}</div>
            </div>
            <span style={{ color: 'var(--text-muted)', display: 'flex', transform: userMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'var(--transition)' }}>
              {icons.chevron}
            </span>
          </button>

          {/* Dropdown menu */}
          {userMenuOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 200,
            }}>
              {/* User info header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="user-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>{initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className={`badge badge-${isAdmin ? 'admin' : 'member'}`}>{user?.role}</span>
                </div>
              </div>

              {/* Logout option */}
              <button
                id="dropdown-logout-btn"
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', background: 'transparent', border: 'none',
                  cursor: 'pointer', color: 'var(--danger)', fontSize: 14, fontWeight: 600,
                  fontFamily: 'inherit', transition: 'var(--transition)', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-soft)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ width: 18, height: 18, display: 'flex' }}>{icons.logout}</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
