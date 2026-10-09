import { useEffect, useState } from 'react';
import { ArrowUpRight, Leaf, LogOut, Menu, X } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { authRequest, clearAuth, dashboardFor, getAuth } from '../api';
import './Navbar.css';

export default function Navbar() {
  const [account, setAccount] = useState(getAuth);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const sync = () => setAccount(getAuth());
    window.addEventListener('hireme-auth', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('hireme-auth', sync); window.removeEventListener('storage', sync); };
  }, []);
  const verified = account?.verificationStatus === 'verified';
  const company = account?.role === 'company';
  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setError('');
    try {
      await authRequest('/auth/logout', { method: 'POST' });
      clearAuth();
      setOpen(false);
      navigate('/');
    } catch (err) { setError(err.message); }
    finally { setSigningOut(false); }
  };
  const navClass = ({ isActive }) => `tb-nav-item ${isActive ? 'active' : ''}`;
  return <header className="tb-navbar">
    <div className="tb-navbar-container">
      <Link to="/" className="tb-brand" aria-label="HireMe home" onClick={() => setOpen(false)}><span className="tb-logo-icon"><Leaf size={19} strokeWidth={1.8} /></span><span className="tb-brand-title">hireme<span>.</span></span></Link>
      <nav className={`tb-nav-links ${open ? 'is-open' : ''}`} aria-label="Main navigation" onClick={() => setOpen(false)}>
        {verified ? <>
          <NavLink to={dashboardFor(account.role)} className={navClass}>Overview</NavLink>
          {company && <NavLink to="/hire" className={navClass}>Find talent</NavLink>}
          <NavLink to={company ? '/company-chat' : '/dev-chat'} className={navClass}>Messages</NavLink>
          <NavLink to={company ? '/company-profile' : '/dev-profile'} className={navClass}>Profile</NavLink>
        </> : <><NavLink to="/" end className={navClass}>Home</NavLink>{account ? <NavLink to="/waiting-review" className={navClass}>Account review</NavLink> : <NavLink to="/login" className={navClass}>For developers</NavLink>}</>}
      </nav>
      <div className="tb-navbar-actions">{account ? <><span className="tb-account-name">{company ? account.companyName : account.name}</span><button type="button" className="tb-signout" onClick={signOut} disabled={signingOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button></> : <Link to="/company-login" className="tb-create-btn">Find talent <ArrowUpRight size={15} /></Link>}<button type="button" className="tb-menu" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'}>{open ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div>{error && <div className="tb-nav-error" role="alert">{error}</div>}
  </header>;
}
