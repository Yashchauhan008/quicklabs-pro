import { motion } from 'framer-motion';
import { GraduationCap, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const location = useLocation();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-transparent shadow-none ring-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-br from-violet-600 to-indigo-600" />
          <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          
          <div className="relative pt-12 pb-8 px-8">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl mb-4 text-violet-600 dark:bg-slate-800">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Unlock Content</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2">
                Sign in to view this document and join our learning community.
              </p>
            </div>
            
            {/* Content Preview (blurred) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-8 border border-dashed border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 opacity-40 select-none">
                <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <Button 
                asChild 
                size="lg" 
                className="w-full h-12 text-md bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-500/20"
              >
                <Link to="/login" state={{ from: location }}>
                  <LogIn className="mr-2 h-5 w-5" /> Sign In Now
                </Link>
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-slate-500">Don't have an account? </span>
                <Link 
                  to="/login"
                  state={{ from: location }}
                  className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                >
                  Create one free
                </Link>
              </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-medium">
              Trusted by 10,000+ Learners
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
