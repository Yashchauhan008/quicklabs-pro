import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/theme-provider';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Dashboard } from '@/components/admin/Dashboard';
import { Profile } from '@/components/admin/Profile';
import { Settings } from '@/components/admin/Settings';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { ROUTES } from '@/config';
import { Register } from './pages/Register';

//todo: why reactNOde

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="lms-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;