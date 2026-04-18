import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Logo } from '../App';

const translateError = (code: string) => {
  switch (code) {
    case 'auth/user-not-found':
      return 'Kullanıcı bulunamadı.';
    case 'auth/wrong-password':
      return 'Hatalı şifre.';
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi.';
    case 'auth/user-disabled':
      return 'Kullanıcı hesabı devre dışı bırakılmış.';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda.';
    case 'auth/weak-password':
      return 'Şifre çok zayıf (en az 6 karakter olmalıdır).';
    case 'auth/popup-closed-by-user':
      return 'Giriş penceresi kapatıldı.';
    case 'auth/operation-not-allowed':
      return 'E-posta/Şifre girişi henüz etkinleştirilmemiş.';
    case 'auth/invalid-credential':
      return 'Giriş bilgileri hatalı veya süresi dolmuş.';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (location.state && typeof location.state.isLogin === 'boolean') {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && (username.trim().length < 3 || username.trim().length > 30)) {
      setError('Kullanıcı adı 3-30 karakter arasında olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          // Update last login time without awaiting to speed up navigation
          updateDoc(doc(db, 'users', user.uid), {
            lastLoginAt: serverTimestamp()
          }).catch(err => console.error("Last login update failed:", err));
        }
        const from = location.state?.from || '/';
        navigate(from, { replace: true });
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        try {
          await updateProfile(user, { displayName: username.trim() });
        } catch (profileErr) {
          console.error("Profile update failed, but continuing with Firestore setup", profileErr);
        }
        
        // Create user profile in Firestore
        const role = email === 'kubratekbiyik@gmail.com' ? 'admin' : 'user';
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            username: username.trim(),
            email,
            role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
          
          const from = location.state?.from || '/';
          navigate(from, { replace: true });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      setError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] bg-white"
    >
      <div className="md:col-span-6 bg-bauhaus-yellow p-10 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
        <div className="space-y-12">
          <Logo size="lg" />
          <h1 className="text-4xl font-display font-black leading-none tracking-tighter">
            {isLogin ? (
              <>KİM BİLİR ELF GÖZLERİN YİNE NELER GÖRDÜ.</>
            ) : 'GEL GEL, BİRLİKTE UTANALIM.'}
          </h1>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest leading-tight">
          {isLogin ? 'BAŞKASININ ADINA UTANDIĞIN ANLARI PAYLAŞMAYA DEVAM ET.' : 'BAŞKALARI ADINA UTANDIĞIN ANLARI ANLATMAYA BAŞLA.'}
        </p>
      </div>

      <div className="md:col-span-6 p-10 space-y-8 bg-white relative">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center space-y-6"
            >
              <div className="w-16 h-16 border-8 border-bauhaus-ink border-t-bauhaus-red rounded-full animate-spin shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]" />
              <div className="space-y-2">
                <h3 className="font-display font-black text-xl tracking-tighter uppercase">BAĞLANILIYOR...</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">LÜTFEN BEKLEYİN, UTANÇ DÜNYASINA GİRİŞ YAPILIYOR.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">KULLANICI ADI</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">E-POSTA</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest">ŞİFRE</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-bauhaus-ink hover:text-bauhaus-red transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-bauhaus-red text-white border-4 border-bauhaus-ink font-bold text-xs uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="bauhaus-button w-full py-4 text-lg"
            >
              {loading ? 'İŞLENİYOR...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}
            </button>
          </div>
        </form>

        <div className="pt-6 border-t-4 border-bauhaus-bg text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black uppercase tracking-widest hover:text-bauhaus-red transition-colors"
          >
            {isLogin ? 'HESABIN YOK MU? KAYIT OL' : 'ZATEN HESABIN VAR MI? GİRİŞ YAP'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
