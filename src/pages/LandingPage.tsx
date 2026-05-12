import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Library, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  Sparkles,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Terminal,
  Code2,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Interactive Background Elements */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-200/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] animate-pulse" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/70"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-200 dark:shadow-none group-hover:rotate-12 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              QuickLabs <span className="text-violet-600">Pro</span>
            </span>
          </Link>
          
          <div className="hidden items-center gap-8 md:flex">
            {['Features', 'Testimonials', 'FAQ'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-sm font-medium text-slate-600 transition-all hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-none" asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 mb-8"
                >
                  <Zap className="h-4 w-4 animate-bounce" />
                  <span>Interactive Learning. Redefined.</span>
                </motion.div>
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white leading-[1.1]">
                  Master Modern Tech with <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Interactive Labs</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-xl">
                  Join 10,000+ learners mastering Kubernetes, Cloud Arch, and AI through hands-on, browser-based labs. No setup, no limits.
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="h-14 px-8 text-lg bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto shadow-xl shadow-violet-500/20" asChild>
                      <Link to="/login" className="flex items-center gap-2">
                        Start Learning <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto" asChild>
                    <a href="#features">Explore Labs</a>
                  </Button>
                </div>
                
                {/* Trusted By */}
                <div className="mt-12">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Trusted by developers at</p>
                  <div className="flex flex-wrap gap-8 grayscale opacity-50 contrast-125">
                    <div className="flex items-center gap-2 font-bold text-xl"><Terminal className="h-6 w-6" /> TECHCORP</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Code2 className="h-6 w-6" /> DEVCLOUD</div>
                    <div className="flex items-center gap-2 font-bold text-xl"><Cpu className="h-6 w-6" /> SYSCORE</div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="relative z-10 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(124,58,237,0.15)] dark:border-slate-800 dark:bg-slate-900 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                  <img 
                    src="/hero.png" 
                    alt="Platform Preview" 
                    className="relative rounded-xl overflow-hidden w-full h-auto shadow-2xl"
                  />
                  {/* Floating badge */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl border-violet-200 dark:border-violet-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase">New Achievement</p>
                        <p className="text-sm font-bold dark:text-white">Kubernetes Master</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 -z-10 h-64 w-64 bg-violet-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -left-20 -z-10 h-64 w-64 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Engineered for <span className="text-violet-600">Performance</span>
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Stop watching videos. Start breaking things. Our labs provide real-world environments to test your skills.
              </p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  title: 'Real-Time Environments',
                  description: 'Spin up full Kubernetes clusters or AI environments in seconds, directly in your browser.',
                  icon: Zap,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50 dark:bg-amber-500/10',
                },
                {
                  title: 'Collaborative Learning',
                  description: 'Work together with peers on complex architecture challenges in real-time.',
                  icon: Users,
                  color: 'text-violet-500',
                  bg: 'bg-violet-50 dark:bg-violet-500/10',
                },
                {
                  title: 'Expert-Led Curriculum',
                  description: 'Follow paths designed by industry veterans from Google, AWS, and Microsoft.',
                  icon: BookOpen,
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 dark:bg-blue-500/10',
                },
                {
                  title: 'Gamified Progress',
                  description: 'Earn XP, badges, and rank up on the global leaderboard as you complete labs.',
                  icon: Trophy,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                },
                {
                  title: 'Deep Resource Library',
                  description: 'Access thousands of whitepapers, templates, and best practice guides.',
                  icon: Library,
                  color: 'text-rose-500',
                  bg: 'bg-rose-50 dark:bg-rose-500/10',
                },
                {
                  title: 'Verified Certificates',
                  description: 'Showcase your skills with blockchain-verified certificates recognized globally.',
                  icon: Shield,
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-50 dark:bg-indigo-500/10',
                },
              ].map((feature) => (
                <motion.div 
                  key={feature.title} 
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-violet-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/50"
                >
                  <div className={cn("mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors", feature.bg)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Stats / Proof Section */}
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { label: 'Active Learners', value: '10K+', sub: 'Daily active users' },
                { label: 'Labs Available', value: '500+', sub: 'New labs weekly' },
                { label: 'Cloud Resources', value: '1M+', sub: 'Provisioned hours' },
                { label: 'Career Growth', value: '85%', sub: 'Users got promoted' },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat.label} 
                  className="text-center"
                >
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                  <div className="text-sm font-bold text-violet-600 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-500">{stat.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-7xl relative overflow-hidden rounded-[3rem] bg-slate-900 px-6 py-20 text-center shadow-2xl lg:px-16 lg:py-28 dark:bg-violet-950/20 dark:border dark:border-violet-500/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.15),transparent_70%)]" />
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Start Your Masterpiece Today
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
                Join QuickLabs Pro and get immediate access to all environments, courses, and our global community.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="h-14 px-10 text-lg bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/40" asChild>
                    <Link to="/login">Get Started for Free</Link>
                  </Button>
                </motion.div>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-slate-700 text-white hover:bg-white/10" asChild>
                  <Link to="/login">View All Courses</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500 italic">No credit card required for basic access.</p>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
            <div className="md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  QuickLabs <span className="text-violet-600">Pro</span>
                </span>
              </div>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Empowering developers worldwide with hands-on labs and collaborative learning experiences.
              </p>
              <div className="mt-8 flex gap-5">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <motion.a 
                    key={i}
                    whileHover={{ y: -3, color: '#7c3aed' }}
                    href="#" 
                    className="text-slate-400 transition-colors"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.a>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Platform', links: ['Courses', 'Labs', 'Leaderboard', 'Certification'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">{col.title}</h4>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="hover:text-violet-600 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="mt-20 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:border-slate-800">
            <p>&copy; {new Date().getFullYear()} QuickLabs Pro. Built for masters.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-violet-600 transition-colors">System Status</a>
              <a href="#" className="hover:text-violet-600 transition-colors">Global Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
