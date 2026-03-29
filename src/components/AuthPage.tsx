import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'motion/react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Logo } from '../App';

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

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists first to avoid overwriting chosen username
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const role = user.email === 'kubratekbiyik@gmail.com' ? 'admin' : 'user';
        // Generate an anonymous username: e.g. "anonim_1234"
        const generatedUsername = `anonim_${Math.floor(1000 + Math.random() * 9000)}`;

        await setDoc(userDocRef, {
          uid: user.uid,
          username: generatedUsername,
          email: user.email,
          role,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          await updateDoc(doc(db, 'users', user.uid), {
            lastLoginAt: serverTimestamp()
          });
        }
        navigate('/');
      } else {
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
          navigate('/');
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('E-posta/Şifre girişi henüz etkinleştirilmemiş. Lütfen Firebase konsolundan etkinleştirin veya Google ile giriş yapın.');
      } else {
        setError(err.message);
      }
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

      <div className="md:col-span-6 p-10 space-y-8 bg-white">
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

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="bauhaus-button-yellow w-full py-4 text-lg flex items-center justify-center gap-4"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              GOOGLE İLE DEVAM ET
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
