import { Link } from 'react-router-dom'

/** Matches profile bottom nav; `active` highlights the current section. */
function MainNav({ active }) {
  const cls = (key) => (key === active ? 'nav-item active-nav' : 'nav-item')
  return (
    <nav className="bottom-nav" aria-label="Site sections">
      <Link to="/" className={cls('home')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1V10.5z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>Home</span>
      </Link>
      <Link to="/listings" className={cls('listings')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Subleases</span>
      </Link>
      <Link to="/tenants" className={cls('tenants')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M2 21v-1a5 5 0 0110 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M22 21v-1a4 4 0 00-5-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Tenants</span>
      </Link>
      <Link to="/add-listing" className={cls('add')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Add listing</span>
      </Link>
      <Link to="/profile" className={cls('profile')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 21v-1a7 7 0 0114 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>Profile</span>
      </Link>
    </nav>
  )
}

export default MainNav
