import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SectorsListingPage from './pages/SectorsListingPage'
import SectorDetailPage from './pages/SectorDetailPage'
import ReportsListingPage from './pages/ReportsListingPage'
import ReportDetailPage from './pages/ReportDetailPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import AIAgentPage from './pages/AIAgentPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/sectors" element={<SectorsListingPage />} />
      <Route path="/sectors/:id" element={<SectorDetailPage />} />
      <Route path="/reports" element={<ReportsListingPage />} />
      <Route path="/reports/:id" element={<ReportDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/ai" element={<AIAgentPage />} />
    </Routes>
  )
}

export default App
