import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import { LogIn, LogOut, PlusCircle, Shield, Home as HomeIcon, User as UserIcon, Instagram, Copyright } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---
export const Logo = ({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "text-xl gap-2",
    md: "text-3xl gap-3",
    lg: "text-5xl gap-4"
  };
  
  const dotSize = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={`font-display font-black tracking-tighter flex items-center ${sizeClasses[size]} ${className}`}>
      <div className={`${dotSize[size]} bg-bauhaus-red rounded-full border-2 border-bauhaus-ink shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]`} />
      <div className="flex flex-col leading-none">
        <span className={`${size === "sm" ? "hidden" : "hidden sm:inline"} whitespace-nowrap`}>ADINA</span>
        <span className={`${size === "sm" ? "hidden" : "hidden sm:inline"} whitespace-nowrap`}>UTANDIM</span>
        <span className="sm:hidden">AU</span>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- Types ---
export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: any;
  lastLoginAt?: any;
  lastEntryAt?: any;
}

export interface Entry {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  authorUsername: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  cringeScore?: number;
  cringeCount?: number;
}

// --- Context ---
interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

// --- Components ---
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import AdminPage from './components/AdminPage';
import NewEntryPage from './components/NewEntryPage';
import ManifestoPage from './components/ManifestoPage';
import FeedbackPage from './components/FeedbackPage';
import BlogPage from './components/BlogPage';
import BlogPostDetailPage from './components/BlogPostDetailPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import CommunityRulesPage from './components/CommunityRulesPage';
import ErrorBoundary from './components/ErrorBoundary';

const Navbar = () => {
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: '/', label: 'ANASAYFA', color: 'hover:bg-bauhaus-yellow' },
    { path: '/manifesto', label: 'MANİFESTO', color: 'hover:bg-bauhaus-blue hover:text-white' },
    { path: '/blog', label: 'BLOG', color: 'hover:bg-bauhaus-yellow' },
  ];

  return (
    <nav className="bg-bauhaus-bg sticky top-0 z-50 border-b-4 border-bauhaus-ink">
      <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
        <Link to="/" className="hover:text-bauhaus-red transition-colors">
          <Logo />
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            (link.path !== '/' || location.pathname !== '/') && (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-xs font-bold uppercase tracking-widest ${link.color} px-3 py-1 transition-colors`}
              >
                {link.label}
              </Link>
            )
          ))}
          
          {user ? (
            <>
              <Link to="/new" className="text-xs font-bold uppercase tracking-widest hover:bg-bauhaus-red hover:text-white px-3 py-1 transition-colors">
                PAYLAŞ
              </Link>
              
              {isAdmin && (
                <Link to="/admin" className="text-xs font-bold uppercase tracking-widest bg-bauhaus-ink text-white px-3 py-1 hover:bg-bauhaus-red transition-colors">
                  PANEL
                </Link>
              )}
              
              <button 
                onClick={() => auth.signOut()}
                className="text-xs font-bold uppercase tracking-widest hover:bg-bauhaus-ink hover:text-white px-3 py-1 transition-colors"
              >
                ÇIKIŞ
              </button>
            </>
          ) : (
            <Link to="/auth" className="bauhaus-button py-2 px-4">
              GİRİŞ YAP
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-bauhaus-ink bg-white hover:bg-bauhaus-yellow transition-colors relative z-50"
          >
            <div className={`w-6 h-0.5 bg-bauhaus-ink transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'}`}></div>
            <div className={`w-6 h-0.5 bg-bauhaus-ink mb-1 transition-opacity ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`w-6 h-0.5 bg-bauhaus-ink transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-bauhaus-bg flex flex-col p-10 pt-32 space-y-8 md:hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bauhaus-grid pointer-events-none opacity-50" />
            
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-2xl font-display font-black tracking-tighter uppercase hover:text-bauhaus-red transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                <Link to="/new" className="text-2xl font-display font-black tracking-tighter uppercase hover:text-bauhaus-red transition-colors">
                  PAYLAŞ
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-2xl font-display font-black tracking-tighter uppercase hover:text-bauhaus-red transition-colors">
                    PANEL
                  </Link>
                )}
                <button 
                  onClick={() => auth.signOut()}
                  className="text-2xl font-display font-black tracking-tighter uppercase text-left hover:text-bauhaus-red transition-colors"
                >
                  ÇIKIŞ
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-2xl font-display font-black tracking-tighter uppercase hover:text-bauhaus-red transition-colors">
                GİRİŞ YAP
              </Link>
            )}

            <div className="pt-10 flex gap-4">
              <div className="w-8 h-8 bg-bauhaus-red" />
              <div className="w-8 h-8 bg-bauhaus-yellow" />
              <div className="w-8 h-8 bg-bauhaus-blue" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-bauhaus-ink text-white py-24 border-t-8 border-bauhaus-yellow">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-8">
          <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
            <Logo className="text-white" size="md" />
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed font-light max-w-sm">
            Başkaları adına utandığınız anları anonim olarak paylaştığınız bir farkındalık platformu.
          </p>
          <div className="flex gap-4 pt-4">
            <a 
              href="https://instagram.com/adinautandim" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-white/20 flex items-center justify-center hover:bg-bauhaus-yellow hover:text-bauhaus-ink hover:border-bauhaus-yellow transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="space-y-8">
          <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-bauhaus-yellow">Navigasyon</h4>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium">
            <li><Link to="/" className="hover:text-bauhaus-red transition-colors">Anasayfa</Link></li>
            <li><Link to="/manifesto" className="hover:text-bauhaus-blue transition-colors">Manifesto</Link></li>
            <li><Link to="/blog" className="hover:text-bauhaus-yellow transition-colors">Blog</Link></li>
            <li><Link to="/new" className="hover:text-bauhaus-yellow transition-colors">Paylaş</Link></li>
            <li><Link to="/rules" className="hover:text-bauhaus-red transition-colors">Topluluk Kuralları</Link></li>
            <li><Link to="/terms" className="hover:text-bauhaus-blue transition-colors">Kullanım Koşulları</Link></li>
            <li><Link to="/privacy" className="hover:text-bauhaus-yellow transition-colors">Gizlilik Politikası</Link></li>
            {user && (
              <li><Link to="/feedback" className="hover:text-bauhaus-red transition-colors">Bize Yaz</Link></li>
            )}
            <li><Link to="/auth" className="hover:text-white transition-colors">Giriş Yap</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 flex items-center gap-1">
          2026 adinautandim.com <Copyright className="w-3 h-3" /> her haklı saklıdır.
        </p>
        <div className="flex gap-4">
          <div className="w-4 h-4 bg-bauhaus-red" />
          <div className="w-4 h-4 bg-bauhaus-yellow" />
          <div className="w-4 h-4 bg-bauhaus-blue" />
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        unsubscribeProfile = onSnapshot(doc(db, 'users', firebaseUser.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile listener error:", error);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.email === 'kubratekbiyik@gmail.com';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-bauhaus-bg text-bauhaus-ink font-sans relative overflow-hidden">
            {/* Bauhaus Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full bauhaus-grid pointer-events-none z-0" />
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-bauhaus-yellow rounded-full opacity-20 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-96 h-96 bg-bauhaus-blue opacity-10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <Navbar />
              <main className="max-w-6xl mx-auto px-6 py-20">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/manifesto" element={<ManifestoPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogPostDetailPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/rules" element={<CommunityRulesPage />} />
                    <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
                    <Route path="/new" element={user ? <NewEntryPage /> : <Navigate to="/auth" />} />
                    <Route path="/feedback" element={user ? <FeedbackPage /> : <Navigate to="/auth" />} />
                    <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" />} />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
            </div>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}
