import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './HomePage'
import ListingsPage from './ListingsPage'
import ListingDetailPage from './ListingDetailPage'
import TenantsPage from './TenantsPage'
import TenantProfilePage from './TenantProfilePage'
import ProfilePage from './ProfilePage'
import AddListingPage from './AddListingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listing" element={<ListingDetailPage />} />
        <Route path="/tenants" element={<TenantsPage />} />
        <Route path="/tenant/:tenantId" element={<TenantProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/add-listing" element={<AddListingPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
