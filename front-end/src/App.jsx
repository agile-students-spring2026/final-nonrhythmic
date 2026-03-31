import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { ListingsProvider } from './context/ListingsProvider'
import { TenantsProvider } from './context/TenantsProvider'
import HomePage from './HomePage'
import ListingsPage from './ListingsPage'
import ListingDetailPage from './ListingDetailPage'
import TenantsPage from './TenantsPage'
import TenantProfilePage from './TenantProfilePage'
import ProfilePage from './ProfilePage'
import AddListingPage from './AddListingPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'
import SavedPage from './SavedPage'

function App() {
  return (
    <ListingsProvider>
      <TenantsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/listing/:id" element={<ListingDetailPage />} />
            <Route path="/listing" element={<Navigate to="/listings" replace />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/tenant/:tenantId" element={<TenantProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/add-listing" element={<AddListingPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </TenantsProvider>
    </ListingsProvider>
  )
}

export default App
