import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import SignupPage from './pages/SignupPage'
import SectorsListingPage from './pages/SectorsListingPage'
import SectorDetailPage from './pages/SectorDetailPage'
import ReportsListingPage from './pages/ReportsListingPage'
import ReportDetailPage from './pages/ReportDetailPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage'
import DashboardReportsPage from './pages/dashboard/DashboardReportsPage'
import DashboardWatchlistPage from './pages/dashboard/DashboardWatchlistPage'
import DashboardActivityPage from './pages/dashboard/DashboardActivityPage'
import DashboardBillingPage from './pages/dashboard/DashboardBillingPage'
import DashboardSettingsPage from './pages/dashboard/DashboardSettingsPage'
import DashboardStatisticsPage from './pages/dashboard/DashboardStatisticsPage'
import DashboardPaymentsPage from './pages/dashboard/DashboardPaymentsPage'
import ProfilePage from './pages/ProfilePage'
import AdminLayout from './layouts/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminReportNewPage from './pages/admin/AdminReportNewPage'
import AdminReportEditPage from './pages/admin/AdminReportEditPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAuditPage from './pages/admin/AdminAuditPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminSectorsPage from './pages/admin/AdminSectorsPage'
import AdminBlogPage from './pages/admin/AdminBlogPage'
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage'
import AIAgentPage from './pages/AIAgentPage'
import BlogListingPage from './pages/BlogListingPage'
import BlogPostPage from './pages/BlogPostPage'
import MyReportsPage from './pages/MyReportsPage'
import CheckoutPage from './pages/CheckoutPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import SearchPage from './pages/SearchPage'
import I18nHtmlLang from './components/I18nHtmlLang'
import RedirectSecteur from './components/RedirectSecteur'
import RequireAuth from './components/auth/RequireAuth'
import RequireAdmin from './components/auth/RequireAdmin'

function App() {
    return (
        <>
            <I18nHtmlLang />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/sectors" element={<SectorsListingPage />} />
                <Route path="/sectors/:id" element={<SectorDetailPage />} />
                <Route path="/reports" element={<ReportsListingPage />} />
                <Route path="/reports/:id" element={<ReportDetailPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <DashboardLayout />
                        </RequireAuth>
                    }
                >
                    <Route index element={<DashboardOverviewPage />} />
                    <Route path="reports" element={<DashboardReportsPage />} />
                    <Route path="watchlist" element={<DashboardWatchlistPage />} />
                    <Route path="activity" element={<DashboardActivityPage />} />
                    <Route path="statistics" element={<DashboardStatisticsPage />} />
                    <Route path="billing" element={<DashboardBillingPage />} />
                    <Route path="payments" element={<DashboardPaymentsPage />} />
                    <Route path="settings" element={<DashboardSettingsPage />} />
                </Route>
                <Route
                    path="/profile"
                    element={
                        <RequireAuth>
                            <ProfilePage />
                        </RequireAuth>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <RequireAdmin>
                            <AdminLayout />
                        </RequireAdmin>
                    }
                >
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route path="sectors" element={<AdminSectorsPage />} />
                    <Route path="blog" element={<AdminBlogPage />} />
                    <Route path="reports/new" element={<AdminReportNewPage />} />
                    <Route path="reports/:reportId" element={<AdminReportEditPage />} />
                    <Route path="import" element={<Navigate to="/admin" replace />} />
                    <Route path="promotions" element={<Navigate to="/admin" replace />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="analytics" element={<Navigate to="/admin" replace />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                    <Route path="payments" element={<AdminPaymentsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
                <Route path="/ai" element={<AIAgentPage />} />
                <Route path="/blog" element={<BlogListingPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/methodology" element={<Navigate to={{ pathname: '/', hash: 'methodology' }} replace />} />
                <Route path="/corporate" element={<Navigate to={{ pathname: '/', hash: 'corporate' }} replace />} />
                <Route
                    path="/my-reports"
                    element={
                        <RequireAuth>
                            <MyReportsPage />
                        </RequireAuth>
                    }
                />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/search" element={<SearchPage />} />
                {/* French URL aliases */}
                <Route path="/tarifs" element={<Navigate to="/pricing" replace />} />
                <Route path="/rapports" element={<Navigate to="/reports" replace />} />
                <Route path="/secteurs" element={<Navigate to="/sectors" replace />} />
                <Route path="/secteurs/:id" element={<RedirectSecteur />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
