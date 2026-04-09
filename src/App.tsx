import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/theme-provider';
import { LearningLayout } from '@/components/admin/AdminLayout';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Dashboard } from '@/components/admin/Dashboard';
import { Profile } from '@/components/admin/Profile';
import { Settings } from '@/components/admin/Settings';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { ROUTES } from '@/config';
import { SubjectsPage } from '@/pages/admin/SubjectsPage';
import { SubjectFormPage } from '@/pages/admin/SubjectFormPage';
import { SubjectDetailPage } from '@/pages/admin/SubjectDetailPage';
import { DocumentUploadPage } from '@/pages/admin/DocumentUploadPage';
import { DocumentDetailPage } from '@/pages/admin/DocumentDetailPage';
import { SuperDeskPage } from '@/pages/admin/SuperDeskPage';
import { PeerLookupPage } from '@/pages/learn/PeerLookupPage';
import { PeerProfilePage } from '@/pages/learn/PeerProfilePage';
import { EnquiriesPage } from '@/pages/learn/EnquiriesPage';
import { EnquiryCreatePage } from '@/pages/learn/EnquiryCreatePage';
import { ExploreCoursesPage } from '@/pages/learn/ExploreCoursesPage';
import { ExploreMaterialsPage } from '@/pages/learn/ExploreMaterialsPage';

/** Old URLs used `/admin`; send users to the same path under `/learn`. */
function LegacyAdminRedirect() {
  const { pathname, search, hash } = useLocation();
  const tail = pathname.replace(/^\/admin\/?/, '').trim();
  const path = tail ? `/learn/${tail}` : ROUTES.DASHBOARD;
  return <Navigate to={`${path}${search}${hash}`} replace />;
}

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
            <Route path="/register" element={<Navigate to={ROUTES.LOGIN} replace />} />

            <Route
              path="/learn"
              element={
                <ProtectedRoute>
                  <LearningLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="explore/courses" element={<ExploreCoursesPage />} />
              <Route path="explore/materials" element={<ExploreMaterialsPage />} />
              <Route path="subject/create" element={<SubjectFormPage />} />
              <Route path="subject/:id/edit" element={<SubjectFormPage />} />
              <Route path="subject/:id" element={<SubjectDetailPage />} />
              <Route path="subject" element={<SubjectsPage />} />
              <Route path="document/add" element={<DocumentUploadPage />} />
              <Route path="document/:id" element={<DocumentDetailPage />} />
              <Route
                path="document"
                element={
                  <Navigate to={`${ROUTES.PROFILE}?tab=documents`} replace />
                }
              />
              <Route path="enquiries/new" element={<EnquiryCreatePage />} />
              <Route path="enquiries" element={<EnquiriesPage />} />
              <Route path="super-desk" element={<SuperDeskPage />} />
              <Route path="peers/:peerId" element={<PeerProfilePage />} />
              <Route path="peers" element={<PeerLookupPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="/admin/*" element={<LegacyAdminRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;