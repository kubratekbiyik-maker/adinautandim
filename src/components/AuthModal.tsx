import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorUtils';
import { Logo } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    if (!isOpen) {
      setError('');
      setEmail('');
      setPassword('');
      setUsername('');
    }
  }, [isOpen, initialMode]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      let userDoc;
      try {
        userDoc = await getDoc(userDocRef);
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.GET, `users/${user.uid}`);
      }
      
      if (!userDoc?.exists()) {
        const role = user.email === 'kubratekbiyik@gmail.com' ? 'admin' : 'user';
        const generatedUsername = `anonim_${Math.floor(1000 + Math.random() * 9000)}`;

        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            username: generatedUsername,
            email: user.email,
            role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      } else {
        try {
          await updateDoc(userDocRef, {
            lastLoginAt: serverTimestamp()
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.UPDATE, `users/${user.uid}`);
        }
      }
      onClose();
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'GİRİŞ PENCERESİ KAPATILDI.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'GİRİŞ İŞLEMİ İPTAL EDİLDİ.';
      } else {
        message = err.message;
      }
      setError(message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && (username.trim().length < 3 || username.trim().length > 30)) {
      setError('KULLANICI ADI 3-30 KARAKTER ARASINDA OLMALIDIR.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        const user = auth.currentUser;
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), {
              lastLoginAt: serverTimestamp()
            });
          } catch (fsErr) {
            console.error("Login update failed", fsErr);
          }
        }
        onClose();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        try {
          await updateProfile(user, { displayName: username.trim() });
        } catch (profileErr) {
          console.error("Profile update failed", profileErr);
        }
        
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
          onClose();
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'BU E-POSTA ADRESİ ZATEN KULLANIMDA.';
      } else if (err.code === 'auth/weak-password') {
        message = 'ŞİFRE EN AZ 6 KARAKTER OLMALIDIR.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-POSTA VEYA ŞİFRE HATALI.';
      } else {
        message = err.message;
      }
      setError(message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bauhaus-ink/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white border-4 border-bauhaus-ink shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden grid grid-cols-1 md:grid-cols-12"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-white border-2 border-bauhaus-ink hover:bg-bauhaus-red hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="md:col-span-5 bg-bauhaus-yellow p-8 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-bauhaus-ink">
              <div className="space-y-8">
                <Logo size="md" />
                <h2 className="text-3xl font-display font-black leading-none tracking-tighter">
                  {isLogin ? (
                    <>KİM BİLİR ELF GÖZLERİN YİNE NELER GÖRDÜ.</>
                  ) : 'GEL GEL, BİRLİKTE UTANALIM.'}
                </h2>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-tight mt-8">
                {isLogin ? 'BAŞKASININ ADINA UTANDIĞIN ANLARI PAYLAŞMAYA DEVAM ET.' : 'BAŞKALARI ADINA UTANDIĞIN ANLARI ANLATMAYA BAŞLA.'}
              </p>
            </div>

            <div className="md:col-span-7 p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest">KULLANICI ADI</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-base"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">E-POSTA</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-base"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest">ŞİFRE</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-bauhaus-bg border-4 border-bauhaus-ink focus:bg-white focus:outline-none transition-colors font-bold text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-bauhaus-ink hover:text-bauhaus-red transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-bauhaus-red text-white border-2 border-bauhaus-ink font-bold text-[10px] uppercase tracking-widest"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bauhaus-button w-full py-3 text-base"
                  >
                    {loading ? 'İŞLENİYOR...' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL')}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="bauhaus-button-yellow w-full py-3 text-base flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    GOOGLE İLE DEVAM ET
                  </button>
                </div>
              </form>

              <div className="pt-4 border-t-2 border-bauhaus-bg text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black uppercase tracking-widest hover:text-bauhaus-red transition-colors"
                >
                  {isLogin ? 'HESABIN YOK MU? KAYIT OL' : 'ZATEN HESABIN VAR MI? GİRİŞ YAP'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
