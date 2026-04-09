import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import NewListing from './pages/NewListing'
import ListingDetail from './pages/ListingDetail'
import Profile from './pages/Profile'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import StyleGuide from './pages/StyleGuide'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import BlogCategory from './pages/BlogCategory'

// Authenticated users go straight to /dashboard; everyone else sees the landing page.
function RootRoute() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return <Landing />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-listing"
            element={
              <ProtectedRoute>
                <NewListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listing/:id"
            element={
              <ProtectedRoute>
                <ListingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/category/:category" element={<BlogCategory />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          {import.meta.env.DEV && <Route path="/style-guide" element={<StyleGuide />} />}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
