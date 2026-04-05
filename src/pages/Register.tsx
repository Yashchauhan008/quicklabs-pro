import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRegister } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/schema/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { ROUTES } from '@/config';

export const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerMutation.mutateAsync(data);

      // Axios responses use .data for payload, and don't have 'success' at the root
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

        toast.success('Registration successful!');
        navigate(ROUTES.DASHBOARD, { replace: true });
      }

      //todo why this any is giving error
    // } catch (error: any) {
    //   const message = error?.message || 'Registration failed';
    //   toast.error(message);
    // }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Registration failed';
    toast.error(message);
  }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-background to-violet-50/70 p-4 dark:from-background dark:via-background dark:to-primary/10">
      <Card className="w-full max-w-md border-0 shadow-xl ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm font-semibold text-primary">QuickLabs Learning</p>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="text-base">
            Join to explore courses and learning resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Creating account...' : 'Register'}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};