import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/theme-provider';
import { LearningLayout } from '@/components/user/LearningLayout';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
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
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<ExploreCoursesPage />} />
              <Route path="materials" element={<ExploreMaterialsPage />} />
              <Route
                path="subject/create"
                element={
                  !IS_DEVELOPMENT ? (
                    <Navigate to={ROUTES.EXPLORE_COURSES} replace />
                  ) : (
                    <SubjectFormPage />
                  )
                }
              />
              <Route path="subject/:id/edit" element={<SubjectFormPage />} />
              <Route path="subject/:id" element={<SubjectDetailPage />} />
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
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="super-desk" element={<SuperDeskPage />} />
              <Route path="peers/:peerId" element={<PeerProfilePage />} />
              <Route path="peers" element={<PeerLookupPage />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/edit" element={<ProfileEditPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;