import { useNavigate, useLocation } from 'react-router-dom';
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

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

        toast.success('Login successful!');

        const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      const message = err?.message || 'Login failed';
      toast.error(message);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-6">
        <Card className="w-full border-0 shadow-lg ring-1 ring-border">
          <CardHeader className="space-y-2 pb-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              QuickLabs Learning
            </p>
            <CardTitle className="text-xl font-semibold sm:text-2xl">
              Sign in
            </CardTitle>
            <CardDescription className="text-sm">
              Use your Google account to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            {!googleConfig.clientId ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center">
                <p className="text-sm text-destructive">
                  Missing `VITE_GOOGLE_CLIENT_ID` in client env.
                </p>
              </div>
            ) : (
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="continue_with"
                  theme="outline"
                  shape="pill"
                  size="large"
                />
              </div>
            )}

            <p className="text-center text-xs leading-5 text-muted-foreground">
              Sign in with the same Google account linked to your QuickLabs profile.
            </p>

            {loginMutation.isPending ? (
              <p className="text-center text-xs font-medium text-primary">
                Signing you in...
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};