import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import ListingsPage from './ListingsPage'
import ListingDetailPage from './ListingDetailPage'
import ProfilePage from './ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/listing" element={<ListingDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
