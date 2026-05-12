import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Library, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  ChevronRight, 
  Layout, 
  Sparkles,
  ArrowRight,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-none">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              QuickLabs <span className="text-violet-600">Pro</span>
            </span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">Testimonials</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-none" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(124,58,237,0.08)_0%,transparent_100%)]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 mb-8">
                <Zap className="h-4 w-4" />
                <span>Next generation learning platform</span>
              </div>
              <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
                Accelerate Your Learning with <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Interactive Labs</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                Join thousands of students and professionals who are mastering new technologies through our hands-on labs, collaborative projects, and peer-to-peer mentoring.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="h-14 px-8 text-lg bg-violet-600 hover:bg-violet-700 text-white" asChild>
                  <Link to="/login" className="flex items-center gap-2">
                    Start Learning Now <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>
              
              {/* Hero Image/Mockup */}
              <div className="mt-20 relative mx-auto max-w-5xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Layout className="h-20 w-20 text-slate-300 dark:text-slate-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-slate-900/50" />
                  </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute -top-10 -right-10 -z-10 h-72 w-72 animate-pulse rounded-full bg-violet-100/50 blur-3xl dark:bg-violet-900/20" />
                <div className="absolute -bottom-10 -left-10 -z-10 h-72 w-72 animate-pulse rounded-full bg-indigo-100/50 blur-3xl dark:bg-indigo-900/20" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-slate-100 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { label: 'Active Students', value: '10K+' },
                { label: 'Available Courses', value: '500+' },
                { label: 'Labs Completed', value: '1M+' },
                { label: 'Success Rate', value: '98%' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Everything You Need to Succeed
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                Our platform provides a comprehensive suite of tools designed to make learning engaging, effective, and collaborative.
              </p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Interactive Labs',
                  description: 'Learn by doing with our browser-based interactive labs. No setup required.',
                  icon: Zap,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-500/10',
                },
                {
                  title: 'Peer Learning',
                  description: 'Connect with other students, ask questions, and collaborate on complex projects.',
                  icon: Users,
                  color: 'text-violet-500',
                  bg: 'bg-violet-50 dark:bg-violet-500/10',
                },
                {
                  title: 'Structured Courses',
                  description: 'Our curriculum is designed by experts to take you from beginner to advanced.',
                  icon: BookOpen,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-500/10',
                },
                {
                  title: 'Smart Progress',
                  description: 'Track your learning journey with detailed analytics and personalized insights.',
                  icon: Trophy,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                },
                {
                  title: 'Global Community',
                  description: 'Join a worldwide network of learners and share your achievements on the leaderboard.',
                  icon: Library,
                  color: 'text-rose-500',
                  bg: 'bg-rose-50 dark:bg-rose-500/10',
                },
                {
                  title: 'Verified Certificates',
                  description: 'Earn industry-recognized certificates for every course you complete successfully.',
                  icon: Shield,
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-50 dark:bg-indigo-500/10',
                },
              ].map((feature) => (
                <div key={feature.title} className="group relative rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-violet-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-violet-500/50">
                  <div className={cn("mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors", feature.bg)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-violet-600 px-6 py-20 text-center shadow-2xl lg:px-16 lg:py-28">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Start Your Journey?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-violet-100">
                Create your account today and get unlimited access to all basic courses and interactive labs.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg bg-white text-violet-600 hover:bg-slate-50" asChild>
                  <Link to="/login">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white text-white hover:bg-white/10" asChild>
                  <Link to="/login">View All Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  QuickLabs <span className="text-violet-600">Pro</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm text-slate-600 dark:text-slate-400">
                Empowering the next generation of developers and tech professionals through hands-on learning and community collaboration.
              </p>
              <div className="mt-6 flex gap-4">
                <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="text-slate-400 hover:text-violet-600 transition-colors"><Linkedin className="h-5 w-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Interactive Labs</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Certification</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-violet-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-violet-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-slate-100 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-600">
            &copy; {new Date().getFullYear()} QuickLabs Pro. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
