import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLogin } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { googleConfig, ROUTES } from '@/config';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const handleGoogleSuccess = async (googleResponse: CredentialResponse) => {
    if (!googleResponse.credential) {
      toast.error('Google credential not received');
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        token: googleResponse.credential,
      });

      if (response.data && response.data.user && response.data.token) {
        const { user, token } = response.data;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const authUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          is_root_user: user.role === 'admin',
          role: user.role,
        };

        login(authUser, token, expiresAt.toISOString());
        toast.success('Welcome back, ' + user.name + '!');

        // 1. Check state.from (set by ProtectedRoute or Links)
        // 2. Check ?redirect query param (fallback)
        const fromState = location.state?.from;
        const fromQuery = searchParams.get('redirect');
        const target = fromState || fromQuery || ROUTES.DASHBOARD;
        
        navigate(target, { replace: true });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err?.message || 'Login failed';
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign in failed');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-200/30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-blue-200/30 blur-[100px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200"
          >
            <GraduationCap className="h-8 w-8" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            QuickLabs <span className="text-indigo-600">Pro</span>
          </h1>
          <p className="mt-2 text-slate-500">Learning management evolved.</p>
        </div>

        <Card className="overflow-hidden border-0 bg-white shadow-2xl shadow-indigo-100/50 ring-1 ring-slate-200/60">
          <CardHeader className="space-y-1 pt-8 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-10">
            {!googleConfig.clientId ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-medium text-red-800">
                  Configuration Error
                </p>
                <p className="mt-1 text-xs text-red-600/80">
                  Google Client ID is missing.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex w-full justify-center rounded-xl transition-all">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    text="continue_with"
                    theme="outline"
                    shape="pill"
                    size="large"
                    width="320px"
                  />
                </div>

                {loginMutation.isPending && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-sm text-indigo-600 font-medium"
                  >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    Authenticating...
                  </motion.div>
                )}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">
                  Secure Access
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                By signing in, you agree to our{' '}
                <Link to="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Terms of Service
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            to={ROUTES.REGISTER}
            className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Create one for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};