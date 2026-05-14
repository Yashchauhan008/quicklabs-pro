import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/theme-provider';
import { LearningLayout } from '@/components/user/LearningLayout';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import LandingPage from '@/pages/LandingPage';
import { Dashboard } from '@/components/user/Dashboard';
import { Profile } from '@/components/user/Profile';
import { ProfileEditPage } from '@/pages/profile/ProfileEditPage';
import { Settings } from '@/components/user/Settings';
import { Unauthorized } from '@/components/auth/Unauthorized';
import { IS_DEVELOPMENT, ROUTES } from '@/config';
import { SubjectFormPage } from '@/pages/subject/SubjectFormPage';
import { SubjectDetailPage } from '@/pages/subject/SubjectDetailPage';
import { DocumentUploadPage } from '@/pages/material/DocumentUploadPage';
import { DocumentDetailPage } from '@/pages/material/DocumentDetailPage';
import { SuperDeskPage } from '@/pages/material/SuperDeskPage';
import { PeerLookupPage } from '@/pages/learn/PeerLookupPage';
import { PeerProfilePage } from '@/pages/learn/PeerProfilePage';
import { EnquiriesPage } from '@/pages/learn/EnquiriesPage';
import { EnquiryCreatePage } from '@/pages/learn/EnquiryCreatePage';
import { ExploreCoursesPage } from '@/pages/learn/ExploreCoursesPage';
import { ExploreMaterialsPage } from '@/pages/learn/ExploreMaterialsPage';
import { LeaderboardPage } from '@/pages/learn/LeaderboardPage';
import { ExploreToolsPage } from '@/pages/learn/ExploreToolsPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
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

            <Route path="/learn" element={<LearningLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              
              {/* Strictly Protected Children */}
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="courses" element={<ProtectedRoute><ExploreCoursesPage /></ProtectedRoute>} />
              <Route path="materials" element={<ProtectedRoute><ExploreMaterialsPage /></ProtectedRoute>} />
              <Route
                path="course/create"
                element={
                  <ProtectedRoute>
                    {!IS_DEVELOPMENT ? <Navigate to={ROUTES.EXPLORE_COURSES} replace /> : <SubjectFormPage />}
                  </ProtectedRoute>
                }
              />
              <Route path="course/:id/edit" element={<ProtectedRoute><SubjectFormPage /></ProtectedRoute>} />
              <Route path="course/:id" element={<ProtectedRoute><SubjectDetailPage /></ProtectedRoute>} />
              <Route path="document/add" element={<ProtectedRoute><DocumentUploadPage /></ProtectedRoute>} />
              
              {/* Semi-Public Child (handles its own auth state with a modal) */}
              <Route path="document/:id" element={<DocumentDetailPage />} />
              
              <Route path="documents" element={<Navigate to={ROUTES.EXPLORE_MATERIALS} replace />} />
              <Route path="document" element={<Navigate to={ROUTES.EXPLORE_MATERIALS} replace />} />
              
              <Route path="enquiries/new" element={<ProtectedRoute><EnquiryCreatePage /></ProtectedRoute>} />
              <Route path="enquiries" element={<ProtectedRoute><EnquiriesPage /></ProtectedRoute>} />
              <Route path="leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="super-desk" element={<ProtectedRoute><SuperDeskPage /></ProtectedRoute>} />
              <Route path="peers/:peerId" element={<ProtectedRoute><PeerProfilePage /></ProtectedRoute>} />
              <Route path="peers" element={<ProtectedRoute><PeerLookupPage /></ProtectedRoute>} />
              <Route path="tools" element={<ProtectedRoute><ExploreToolsPage /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="profile/edit" element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="unauthorized" element={<ProtectedRoute><Unauthorized /></ProtectedRoute>} />
            </Route>

            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;