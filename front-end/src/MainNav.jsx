import { Link } from 'react-router-dom'

/** Matches profile bottom nav; `active` highlights the current section. */
function MainNav({ active }) {
  const cls = (key) => (key === active ? 'nav-item active-nav' : 'nav-item')
  return (
    <nav className="bottom-nav" aria-label="Site sections">
      <Link to="/" className={cls('home')}>
        Home
      </Link>
      <Link to="/listings" className={cls('listings')}>
        Subleases
      </Link>
      <Link to="/tenants" className={cls('tenants')}>
        Tenants
      </Link>
      <Link to="/add-listing" className={cls('add')}>
        Add listing
      </Link>
      <Link to="/profile" className={cls('profile')}>
        Profile
      </Link>
    </nav>
  )
}

export default MainNav
